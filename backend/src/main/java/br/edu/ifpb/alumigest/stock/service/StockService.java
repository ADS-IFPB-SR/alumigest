package br.edu.ifpb.alumigest.stock.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockItem;
import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.OrderStockAlertResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.OrderStockAlertResponseDTO.MissingMaterialDTO;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.mapper.StockMapper;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação transacional dos casos de uso de estoque e trilha Kardex.
 *
 * <p>Garante atomicidade (RN-02), invariante de saldos (RN-01), bloqueio pessimista
 * contra condições de corrida e reserva não bloqueante no modelo Make-to-Order (RN-05).
 */
@Service
@Transactional(readOnly = true)
public class StockService implements StockPort {

    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    private static final String RESOURCE_MATERIAL = "Material";
    private static final String RESOURCE_PEDIDO = "Pedido";
    private static final String SYSTEM_USER = "SYSTEM";

    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository stockMovementRepository;
    private final MaterialRepository materialRepository;
    private final OrderRepository orderRepository;
    private final StockMapper stockMapper;

    public StockService(
            StockItemRepository stockItemRepository,
            StockMovementRepository stockMovementRepository,
            MaterialRepository materialRepository,
            OrderRepository orderRepository,
            StockMapper stockMapper) {
        this.stockItemRepository = stockItemRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.materialRepository = materialRepository;
        this.orderRepository = orderRepository;
        this.stockMapper = stockMapper;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void reserveMaterialsForOrder(UUID orderId) {
        Order order = findOrderOrThrow(orderId);
        Map<UUID, BigDecimal> pendingReservations = computeNetPendingReservations(orderId);
        if (!pendingReservations.isEmpty()) {
            log.debug("Reserva ignorada por idempotência para O.S. {} (já possui reservas ativas).", order.getCodigo());
            return;
        }

        Map<UUID, BigDecimal> requiredMaterials = aggregateOrderMaterials(order);
        for (Map.Entry<UUID, BigDecimal> entry : requiredMaterials.entrySet()) {
            StockItem stockItem = getOrCreateStockItemForUpdate(entry.getKey());
            BigDecimal prevPhysical = stockItem.getPhysicalQuantity();
            BigDecimal prevReserved = stockItem.getReservedQuantity();

            stockItem.reserve(entry.getValue());
            stockItem = stockItemRepository.saveAndFlush(stockItem);

            recordMovement(
                stockItem,
                StockMovementType.PRODUCTION_RESERVATION,
                entry.getValue(),
                prevPhysical,
                prevReserved,
                MovementAuditContext.forOrder(
                    order,
                    "Reserva automática para Ordem de Serviço " + order.getCodigo()
                )
            );
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void consumeReservedMaterialsForOrder(UUID orderId) {
        processOrderReservationTransition(
            orderId,
            StockMovementType.PRODUCTION_OUTFLOW,
            "Baixa física definitiva na conclusão da produção da O.S. ",
            StockItem::consumeReserved
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void cancelReservationsForOrder(UUID orderId) {
        processOrderReservationTransition(
            orderId,
            StockMovementType.RESERVATION_CANCELLATION,
            "Estorno automático de reserva pelo cancelamento da O.S. ",
            StockItem::cancelReservation
        );
    }

    private void processOrderReservationTransition(
            UUID orderId,
            StockMovementType movementType,
            String reasonPrefix,
            java.util.function.BiFunction<StockItem, BigDecimal, BigDecimal> transitionFn) {
        Order order = findOrderOrThrow(orderId);
        Map<UUID, BigDecimal> pendingReservations = computeNetPendingReservations(orderId);
        if (pendingReservations.isEmpty()) {
            log.debug("Nenhuma reserva pendente ({}) para a O.S. {}.", movementType, order.getCodigo());
            return;
        }

        for (Map.Entry<UUID, BigDecimal> entry : pendingReservations.entrySet()) {
            StockItem stockItem = getOrCreateStockItemForUpdate(entry.getKey());
            BigDecimal prevPhysical = stockItem.getPhysicalQuantity();
            BigDecimal prevReserved = stockItem.getReservedQuantity();

            BigDecimal effectiveQty = transitionFn.apply(stockItem, entry.getValue());
            if (effectiveQty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            stockItem = stockItemRepository.saveAndFlush(stockItem);

            recordMovement(
                stockItem,
                movementType,
                effectiveQty,
                prevPhysical,
                prevReserved,
                MovementAuditContext.forOrder(order, reasonPrefix + order.getCodigo())
            );
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public StockMovementResponseDTO registerMovement(StockMovementRequestDTO request) {
        if (request == null || request.materialId() == null || request.type() == null) {
            throw new BusinessException("Material e tipo de movimentação são obrigatórios.");
        }

        StockItem stockItem = getOrCreateStockItemForUpdate(request.materialId());
        BigDecimal prevPhysical = stockItem.getPhysicalQuantity();
        BigDecimal prevReserved = stockItem.getReservedQuantity();

        applyManualMovement(stockItem, request.type(), request.quantity());
        stockItem = stockItemRepository.saveAndFlush(stockItem);

        StockMovement movement = recordMovement(
            stockItem,
            request.type(),
            request.quantity(),
            prevPhysical,
            prevReserved,
            MovementAuditContext.forManual(request)
        );
        return stockMapper.toMovementResponseDTO(movement);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public StockItemResponseDTO getStockBalance(UUID materialId) {
        StockItem item = stockItemRepository.findByMaterialId(materialId)
            .orElseThrow(() -> new ResourceNotFoundException("Item de estoque", materialId.toString()));
        return stockMapper.toItemResponseDTO(item);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<StockItemResponseDTO> listStockBalances() {
        return stockItemRepository.findAllWithMaterial().stream()
            .map(stockMapper::toItemResponseDTO)
            .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public OrderStockAlertResponseDTO getOrderStockAlert(UUID orderId) {
        findOrderOrThrow(orderId);
        Map<UUID, BigDecimal> pendingReservations = computeNetPendingReservations(orderId);

        if (pendingReservations.isEmpty()) {
            return new OrderStockAlertResponseDTO(StockAlertStatus.IN_STOCK, List.of());
        }

        return buildOrderStockAlert(pendingReservations);
    }

    private OrderStockAlertResponseDTO buildOrderStockAlert(Map<UUID, BigDecimal> pendingReservations) {
        List<StockItem> stockItems = stockItemRepository.findAllByMaterialIdIn(pendingReservations.keySet());
        Map<UUID, StockItem> itemsByMaterialId = stockItems.stream()
            .collect(Collectors.toMap(item -> item.getMaterial().getId(), item -> item));

        List<MissingMaterialDTO> missingMaterials = new ArrayList<>();
        StockAlertStatus worstStatus = StockAlertStatus.IN_STOCK;

        for (Map.Entry<UUID, BigDecimal> entry : pendingReservations.entrySet()) {
            UUID materialId = entry.getKey();
            BigDecimal reserved = entry.getValue();

            StockItem item = itemsByMaterialId.get(materialId);
            if (item == null) {
                worstStatus = StockAlertStatus.NEED_PURCHASE;
                continue;
            }

            StockAlertStatus itemStatus = item.resolveAlertStatus();
            if (itemStatus.isMoreCriticalThan(worstStatus)) {
                worstStatus = itemStatus;
            }

            if (itemStatus == StockAlertStatus.NEED_PURCHASE) {
                missingMaterials.add(stockMapper.toMissingMaterialDTO(item, reserved));
            }
        }

        return new OrderStockAlertResponseDTO(worstStatus, List.copyOf(missingMaterials));
    }

    /**
     * Lista o histórico de movimentações Kardex, opcionalmente filtrado por material.
     *
     * @param materialId identificador opcional do material
     * @return lista ordenada cronologicamente do mais recente ao mais antigo
     */
    public List<StockMovementResponseDTO> listMovements(UUID materialId) {
        List<StockMovement> movements = materialId != null
            ? stockMovementRepository.findByMaterialIdOrderByCreatedAtDesc(materialId)
            : stockMovementRepository.findAllWithMaterialOrderByCreatedAtDesc();

        return movements.stream()
            .map(stockMapper::toMovementResponseDTO)
            .toList();
    }

    private void applyManualMovement(StockItem stockItem, StockMovementType type, BigDecimal quantity) {
        switch (type) {
            case PURCHASE_ENTRY, MANUAL_ADJUSTMENT -> stockItem.addPhysical(quantity);
            case SCRAP_LOSS -> stockItem.removePhysical(quantity);
            default -> throw new BusinessException(
                "Tipo de movimentação '" + type + "' é exclusivo do fluxo automático de produção."
            );
        }
    }

    private Order findOrderOrThrow(UUID orderId) {
        if (orderId == null) {
            throw new BusinessException("O identificador da Ordem de Serviço é obrigatório.");
        }
        return orderRepository.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, orderId.toString()));
    }

    /**
     * Agrega as quantidades totais por material de todos os itens/opções da O.S.
     * Usa {@link TreeMap} para ordenação determinística de UUIDs e prevenção de deadlocks.
     */
    private Map<UUID, BigDecimal> aggregateOrderMaterials(Order order) {
        Map<UUID, BigDecimal> aggregated = new TreeMap<>();
        for (OrderItem item : order.getItems()) {
            for (OrderItemOption option : item.getOptions()) {
                if (option.getMaterial() != null
                        && option.getMaterial().getId() != null
                        && option.getQuantity() != null
                        && option.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    aggregated.merge(option.getMaterial().getId(), option.getQuantity(), BigDecimal::add);
                }
            }
        }
        return aggregated;
    }

    /**
     * Calcula o saldo líquido ainda reservado para uma O.S. (reservas menos baixas e estornos).
     * Retorna um mapa ordenado determinísticamente por UUID para lock seguro sem deadlocks.
     */
    private Map<UUID, BigDecimal> computeNetPendingReservations(UUID orderId) {
        List<StockMovement> orderMovements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        Map<UUID, BigDecimal> netByMaterial = new TreeMap<>();

        for (StockMovement movement : orderMovements) {
            UUID materialId = movement.getMaterial().getId();
            if (movement.getType() == StockMovementType.PRODUCTION_RESERVATION) {
                netByMaterial.merge(materialId, movement.getQuantity(), BigDecimal::add);
            } else if (movement.getType() == StockMovementType.PRODUCTION_OUTFLOW
                    || movement.getType() == StockMovementType.RESERVATION_CANCELLATION) {
                netByMaterial.merge(materialId, movement.getQuantity().negate(), BigDecimal::add);
            }
        }

        netByMaterial.entrySet().removeIf(entry -> entry.getValue().compareTo(BigDecimal.ZERO) <= 0);
        return netByMaterial;
    }

    private StockItem getOrCreateStockItemForUpdate(UUID materialId) {
        return stockItemRepository.findByMaterialIdForUpdate(materialId)
            .orElseGet(() -> {
                Material material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_MATERIAL, materialId.toString()));
                return stockItemRepository.saveAndFlush(new StockItem(material));
            });
    }

    private StockMovement recordMovement(
            StockItem stockItem,
            StockMovementType type,
            BigDecimal quantity,
            BigDecimal previousPhysical,
            BigDecimal previousReserved,
            MovementAuditContext context) {
        StockMovement movement = StockMovement.builder()
            .stockItem(stockItem)
            .material(stockItem.getMaterial())
            .orderId(context.orderId())
            .type(type)
            .quantity(quantity)
            .unitCost(context.unitCost())
            .previousPhysicalQuantity(previousPhysical)
            .newPhysicalQuantity(stockItem.getPhysicalQuantity())
            .previousReservedQuantity(previousReserved)
            .newReservedQuantity(stockItem.getReservedQuantity())
            .referenceDocument(context.referenceDocument())
            .reason(context.reason())
            .registeredBy(context.registeredBy())
            .build();
        return stockMovementRepository.saveAndFlush(movement);
    }

    /**
     * Metadados de contexto e auditoria para registro imutável no Kardex (S107 refactor).
     */
    private record MovementAuditContext(
            UUID orderId,
            String referenceDocument,
            String reason,
            String registeredBy,
            BigDecimal unitCost) {

        static MovementAuditContext forOrder(Order order, String reason) {
            return new MovementAuditContext(
                order.getId(),
                order.getCodigo(),
                reason,
                SYSTEM_USER,
                null
            );
        }

        static MovementAuditContext forManual(StockMovementRequestDTO request) {
            return new MovementAuditContext(
                null,
                request.referenceDocument(),
                request.reason(),
                request.registeredBy() != null && !request.registeredBy().isBlank()
                    ? request.registeredBy()
                    : SYSTEM_USER,
                request.unitCost()
            );
        }
    }
}

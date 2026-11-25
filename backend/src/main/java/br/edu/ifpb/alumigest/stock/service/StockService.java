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
import br.edu.ifpb.alumigest.stock.dto.StockBalanceFilter;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.mapper.StockMapper;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
    public void reserveMaterials(UUID orderId) {
        executeMaterialReservation(orderId);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void reserveMaterialsForOrder(UUID orderId) {
        executeMaterialReservation(orderId);
    }

    private void executeMaterialReservation(UUID orderId) {
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

            if (stockItem.getAvailableQuantity().compareTo(BigDecimal.ZERO) < 0) {
                log.info(
                    "Reserva Make-to-Order (RN-05) para O.S. {} gerou necessidade líquida de compra "
                        + "(NEED_PURCHASE) para material {}: saldo disponível = {}.",
                    order.getCodigo(),
                    entry.getKey(),
                    stockItem.getAvailableQuantity()
                );
            }

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
        validateManualMovementRequest(request);

        if ((request.type() == StockMovementType.SCRAP_LOSS || request.type() == StockMovementType.MANUAL_ADJUSTMENT)
                && (request.reason() == null || request.reason().trim().isEmpty())) {
            throw new BusinessException(
                "A justificativa é obrigatória para movimentações extraordinárias de perda ou ajuste manual."
            );
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
        return listStockBalances(StockBalanceFilter.empty());
    }

    /**
     * {@inheritDoc}
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
     * {@inheritDoc}
     */
    @Override
    public List<StockItemResponseDTO> listStockBalances(StockBalanceFilter filter) {
        StockBalanceFilter effectiveFilter = filter != null ? filter : StockBalanceFilter.empty();
        return stockItemRepository.findAllWithMaterial().stream()
            .filter(item -> matchesProcurementFilter(item, effectiveFilter))
            .map(stockMapper::toItemResponseDTO)
            .filter(dto -> matchesDtoFilter(dto, effectiveFilter))
            .sorted(effectiveFilter.effectiveSort().comparator())
            .toList();
    }

    private boolean matchesProcurementFilter(StockItem item, StockBalanceFilter filter) {
        if (!filter.hasProcurementFilter()) {
            return true;
        }
        boolean matchNeedsPurchase = Boolean.TRUE.equals(filter.needsPurchase())
            && item.needsPurchase();
        boolean matchBelowMin = Boolean.TRUE.equals(filter.belowMinStock())
            && item.isBelowMinimumStock();
        return matchNeedsPurchase || matchBelowMin;
    }

    private boolean matchesDtoFilter(StockItemResponseDTO dto, StockBalanceFilter filter) {
        if (!matchesCategory(dto, filter.category())) {
            return false;
        }
        if (filter.alertStatus() != null && dto.alertStatus() != filter.alertStatus()) {
            return false;
        }
        return matchesSearch(dto, filter.search());
    }

    private boolean matchesCategory(StockItemResponseDTO dto, String category) {
        if (category == null || category.isBlank()) {
            return true;
        }
        return dto.category() != null && dto.category().equalsIgnoreCase(category.trim());
    }

    private boolean matchesSearch(StockItemResponseDTO dto, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String term = search.trim().toLowerCase(Locale.ROOT);
        boolean inName = dto.materialName() != null
            && dto.materialName().toLowerCase(Locale.ROOT).contains(term);
        boolean inSku = dto.materialSku() != null
            && dto.materialSku().toLowerCase(Locale.ROOT).contains(term);
        return inName || inSku;
    }

    /**
     * {@inheritDoc}
     */
    @Override
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

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public StockItemResponseDTO provisionStockItem(UUID materialId, BigDecimal minimumStock) {
        if (materialId == null) {
            throw new BusinessException("O identificador do material é obrigatório.");
        }
        if (minimumStock != null && minimumStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("O ponto de pedido (estoque mínimo) não pode ser negativo.");
        }

        StockItem stockItem = getOrCreateStockItemForUpdate(materialId);
        if (minimumStock != null) {
            stockItem.updateMinimumStock(minimumStock);
            stockItem = stockItemRepository.saveAndFlush(stockItem);
        }
        return stockMapper.toItemResponseDTO(stockItem);
    }

    private void validateManualMovementRequest(StockMovementRequestDTO request) {
        if (request == null || request.materialId() == null || request.type() == null) {
            throw new BusinessException("Material e tipo de movimentação são obrigatórios.");
        }
        if (request.quantity() == null || request.quantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("A quantidade movimentada deve ser maior que zero.");
        }
        if (request.unitCost() != null && request.unitCost().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("O preço de compra unitário deve ser maior que zero.");
        }
        // RN-06: Preço de compra unitário obrigatório em entradas de compra
        if (request.type() == StockMovementType.PURCHASE_ENTRY && request.unitCost() == null) {
            throw new BusinessException(
                "O preço de compra unitário (unitCost) é obrigatório para entradas de compra (RN-06)."
            );
        }
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
            .supplier(context.supplier())
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
            String supplier,
            String reason,
            String registeredBy,
            BigDecimal unitCost) {

        static MovementAuditContext forOrder(Order order, String reason) {
            return new MovementAuditContext(
                order.getId(),
                order.getCodigo(),
                null,
                reason,
                SYSTEM_USER,
                null
            );
        }

        static MovementAuditContext forManual(StockMovementRequestDTO request) {
            return new MovementAuditContext(
                null,
                normalizeOptionalText(request.referenceDocument()),
                normalizeOptionalText(request.supplier()),
                normalizeOptionalText(request.reason()),
                request.registeredBy() != null && !request.registeredBy().isBlank()
                    ? request.registeredBy().trim()
                    : SYSTEM_USER,
                request.unitCost()
            );
        }

        private static String normalizeOptionalText(String value) {
            return value != null && !value.isBlank() ? value.trim() : null;
        }
    }
}
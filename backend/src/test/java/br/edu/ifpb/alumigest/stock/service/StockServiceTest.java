package br.edu.ifpb.alumigest.stock.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderMaterialsReservationEvent;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockItem;
import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.mapper.StockMapper;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockService — Testes Unitários de Ciclo de Vida e Kardex (US-21.2)")
class StockServiceTest {

    @Mock
    private StockItemRepository stockItemRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private OrderRepository orderRepository;

    private StockService stockService;
    private StockMapper stockMapper;

    @BeforeEach
    void setUp() {
        stockMapper = new StockMapper();
        stockService = new StockService(
            stockItemRepository,
            stockMovementRepository,
            materialRepository,
            orderRepository,
            stockMapper
        );
    }

    private Material buildMaterial(UUID id, String groupCode, String sku, String name) {
        MaterialGroup group = new MaterialGroup(
            UUID.randomUUID(),
            groupCode,
            groupCode,
            CalculationType.SQUARE_METER,
            null,
            true,
            true
        );
        Material material = new Material();
        material.setId(id);
        material.setGroup(group);
        material.setSkuCode(sku);
        material.setName(name);
        material.setUnitMeasure(UnitMeasure.M2);
        return material;
    }

    private Order buildOrderWithMaterial(UUID orderId, Material material, BigDecimal qty) {
        Order order = Order.builder()
            .id(orderId)
            .codigo("OS-2026-0001")
            .clienteNome("Cliente Teste")
            .clienteTelefone("83999990000")
            .build();
        OrderItem item = OrderItem.builder()
            .id(UUID.randomUUID())
            .order(order)
            .descricao("Janela de Correr")
            .larguraMm(1200)
            .alturaMm(1000)
            .quantidade(1)
            .build();
        OrderItemOption option = OrderItemOption.builder()
            .id(UUID.randomUUID())
            .material(material)
            .materialName(material.getName())
            .unitMeasure("M2")
            .categoryType("GLASS")
            .quantity(qty)
            .build();
        item.addOption(option);
        order.addItem(item);
        return order;
    }

    @Test
    @DisplayName("consumeReservedMaterialsForOrder: deve baixar físico e reserva mantendo saldo disponível inalterado")
    void shouldConsumeReservedMaterialsMaintainingAvailableBalance() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "VIDRO", "VID-8MM", "Vidro Temperado 8mm");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("6.00"));

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("20.00"));
        stockItem.reserve(new BigDecimal("6.00"));
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("14.00");

        StockMovement priorReservation = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("6.00"))
            .previousPhysicalQuantity(new BigDecimal("20.00"))
            .newPhysicalQuantity(new BigDecimal("20.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("6.00"))
            .build();

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(priorReservation));
        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        stockService.consumeReservedMaterialsForOrder(orderId);

        assertThat(stockItem.getPhysicalQuantity()).isEqualByComparingTo("14.00");
        assertThat(stockItem.getReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("14.00");

        ArgumentCaptor<StockMovement> movementCaptor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).saveAndFlush(movementCaptor.capture());
        StockMovement outflow = movementCaptor.getValue();
        assertThat(outflow.getType()).isEqualTo(StockMovementType.PRODUCTION_OUTFLOW);
        assertThat(outflow.getQuantity()).isEqualByComparingTo("6.00");
        assertThat(outflow.getPreviousPhysicalQuantity()).isEqualByComparingTo("20.00");
        assertThat(outflow.getNewPhysicalQuantity()).isEqualByComparingTo("14.00");
        assertThat(outflow.getPreviousReservedQuantity()).isEqualByComparingTo("6.00");
        assertThat(outflow.getNewReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(outflow.getOrderId()).isEqualTo(orderId);
        assertThat(outflow.getReferenceDocument()).isEqualTo("OS-2026-0001");
    }

    @Test
    @DisplayName("consumeReservedMaterialsForOrder: deve preservar invariante mesmo em Make-to-Order com disponível negativo")
    void shouldPreserveAvailableInvariantWhenConsumingMakeToOrderDeficit() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "ALUMINIO", "PER-001", "Perfil U");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("5.00"));

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("2.00"));
        stockItem.reserve(new BigDecimal("5.00"));
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("-3.00");

        StockMovement reservation = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("5.00"))
            .previousPhysicalQuantity(new BigDecimal("2.00"))
            .newPhysicalQuantity(new BigDecimal("2.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("5.00"))
            .build();

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of(reservation));
        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        stockService.consumeReservedMaterialsForOrder(orderId);

        assertThat(stockItem.getPhysicalQuantity()).isEqualByComparingTo("-3.00");
        assertThat(stockItem.getReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("-3.00");
    }

    @Test
    @DisplayName("cancelReservationsForOrder: deve zerar reserva, recompor disponível e gravar RESERVATION_CANCELLATION")
    void shouldCancelReservationsAndRestoreAvailableBalance() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "FERRAGEM", "FER-010", "Fechadura Bate-Fecha");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("4.00"));

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("2.00"));
        stockItem.reserve(new BigDecimal("4.00"));
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("-2.00");

        StockMovement priorReservation = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("4.00"))
            .previousPhysicalQuantity(new BigDecimal("2.00"))
            .newPhysicalQuantity(new BigDecimal("2.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("4.00"))
            .build();

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(priorReservation));
        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        stockService.cancelReservationsForOrder(orderId);

        assertThat(stockItem.getPhysicalQuantity()).isEqualByComparingTo("2.00");
        assertThat(stockItem.getReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("2.00");

        ArgumentCaptor<StockMovement> movementCaptor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).saveAndFlush(movementCaptor.capture());
        StockMovement cancellation = movementCaptor.getValue();
        assertThat(cancellation.getType()).isEqualTo(StockMovementType.RESERVATION_CANCELLATION);
        assertThat(cancellation.getQuantity()).isEqualByComparingTo("4.00");
        assertThat(cancellation.getPreviousPhysicalQuantity()).isEqualByComparingTo("2.00");
        assertThat(cancellation.getNewPhysicalQuantity()).isEqualByComparingTo("2.00");
        assertThat(cancellation.getPreviousReservedQuantity()).isEqualByComparingTo("4.00");
        assertThat(cancellation.getNewReservedQuantity()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("consumeReservedMaterialsForOrder e cancelReservationsForOrder: devem ser idempotentes sem reserva pendente")
    void shouldBeIdempotentWhenNoPendingReservationsExist() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "PELICULA", "PEL-001", "Película Jateada");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("3.00"));
        StockItem stockItem = new StockItem(material);

        StockMovement reserved = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("3.00"))
            .previousPhysicalQuantity(BigDecimal.ZERO)
            .newPhysicalQuantity(BigDecimal.ZERO)
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("3.00"))
            .build();
        StockMovement alreadyOutflow = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_OUTFLOW)
            .quantity(new BigDecimal("3.00"))
            .previousPhysicalQuantity(BigDecimal.ZERO)
            .newPhysicalQuantity(new BigDecimal("-3.00"))
            .previousReservedQuantity(new BigDecimal("3.00"))
            .newReservedQuantity(BigDecimal.ZERO)
            .build();

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(reserved, alreadyOutflow));

        stockService.consumeReservedMaterialsForOrder(orderId);
        stockService.cancelReservationsForOrder(orderId);

        verify(stockItemRepository, never()).saveAndFlush(any());
        verify(stockMovementRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("registerMovement: deve impedir saldo físico negativo em perda manual (RN-03) e mapear categoria")
    void shouldRejectNegativePhysicalBalanceOnManualLossAndMapDto() {
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "VIDRO", "VID-004", "Vidro Incolor 4mm");
        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("3.00"));
        stockItem.updateMinimumStock(new BigDecimal("5.00"));

        StockItemResponseDTO dto = stockMapper.toItemResponseDTO(stockItem);
        assertThat(dto.category()).isEqualTo("GLASS");
        assertThat(dto.alertStatus()).isEqualTo(StockAlertStatus.ORDER_POINT);

        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));

        StockMovementRequestDTO excessiveLoss = new StockMovementRequestDTO(
            materialId,
            StockMovementType.SCRAP_LOSS,
            new BigDecimal("5.00"),
            null,
            "Quebra no corte",
            null,
            "almoxarife"
        );

        assertThatThrownBy(() -> stockService.registerMovement(excessiveLoss))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Saldo físico insuficiente");
    }

    @Test
    @DisplayName("Deve validar orderId nulo e pedido inexistente")
    void shouldValidateNullAndMissingOrder() {
        assertThatThrownBy(() -> stockService.consumeReservedMaterialsForOrder(null))
            .isInstanceOf(BusinessException.class);

        UUID missingId = UUID.randomUUID();
        when(orderRepository.findByIdWithDetails(missingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockService.cancelReservationsForOrder(missingId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("reserveMaterials: deve reservar materiais com saldo disponível positivo mantendo invariante e gravando PRODUCTION_RESERVATION")
    void shouldReserveMaterialsWithPositiveAvailableBalance() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "VIDRO", "VID-10MM", "Vidro Temperado 10mm");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("6.50"));

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("20.00"));

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of());
        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        stockService.reserveMaterials(orderId);

        assertThat(stockItem.getPhysicalQuantity()).isEqualByComparingTo("20.00");
        assertThat(stockItem.getReservedQuantity()).isEqualByComparingTo("6.50");
        assertThat(stockItem.getAvailableQuantity()).isEqualByComparingTo("13.50");
        assertThat(stockItem.resolveAlertStatus()).isEqualTo(StockAlertStatus.IN_STOCK);

        ArgumentCaptor<StockMovement> movementCaptor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).saveAndFlush(movementCaptor.capture());
        StockMovement reservation = movementCaptor.getValue();
        assertThat(reservation.getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(reservation.getQuantity()).isEqualByComparingTo("6.50");
        assertThat(reservation.getPreviousPhysicalQuantity()).isEqualByComparingTo("20.00");
        assertThat(reservation.getNewPhysicalQuantity()).isEqualByComparingTo("20.00");
        assertThat(reservation.getPreviousReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(reservation.getNewReservedQuantity()).isEqualByComparingTo("6.50");
        assertThat(reservation.getOrderId()).isEqualTo(orderId);
        assertThat(reservation.getReferenceDocument()).isEqualTo("OS-2026-0001");
    }

    @Test
    @DisplayName("reserveMaterials: deve concluir reserva Make-to-Order (RN-05) com disponível negativo, sinalizar NEED_PURCHASE e auto-criar StockItem")
    void shouldReserveMaterialsInMakeToOrderWithNegativeAvailableBalance() {
        UUID orderId = UUID.randomUUID();
        UUID existingMaterialId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID newMaterialId = UUID.fromString("00000000-0000-0000-0000-000000000002");

        Material existingMaterial = buildMaterial(existingMaterialId, "ALUMINIO", "PER-100", "Perfil Marco");
        Material newMaterial = buildMaterial(newMaterialId, "FERRAGEM", "FER-200", "Kit Roldana");

        Order order = buildOrderWithMaterial(orderId, existingMaterial, new BigDecimal("10.00"));
        OrderItemOption secondOption = OrderItemOption.builder()
            .id(UUID.randomUUID())
            .material(newMaterial)
            .materialName(newMaterial.getName())
            .unitMeasure("UN")
            .categoryType("HARDWARE")
            .quantity(new BigDecimal("4.00"))
            .build();
        order.getItems().getFirst().addOption(secondOption);

        StockItem existingStockItem = new StockItem(existingMaterial);
        existingStockItem.addPhysical(new BigDecimal("3.00"));

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of());
        when(stockItemRepository.findByMaterialIdForUpdate(existingMaterialId))
            .thenReturn(Optional.of(existingStockItem));
        when(stockItemRepository.findByMaterialIdForUpdate(newMaterialId))
            .thenReturn(Optional.empty());
        when(materialRepository.findById(newMaterialId)).thenReturn(Optional.of(newMaterial));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        stockService.reserveMaterials(orderId);

        assertThat(existingStockItem.getPhysicalQuantity()).isEqualByComparingTo("3.00");
        assertThat(existingStockItem.getReservedQuantity()).isEqualByComparingTo("10.00");
        assertThat(existingStockItem.getAvailableQuantity()).isEqualByComparingTo("-7.00");
        assertThat(existingStockItem.resolveAlertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);

        ArgumentCaptor<StockItem> savedItemsCaptor = ArgumentCaptor.forClass(StockItem.class);
        verify(stockItemRepository, times(3)).saveAndFlush(savedItemsCaptor.capture());
        StockItem autoCreatedAndReserved = savedItemsCaptor.getAllValues().getLast();
        assertThat(autoCreatedAndReserved.getMaterial().getId()).isEqualTo(newMaterialId);
        assertThat(autoCreatedAndReserved.getPhysicalQuantity()).isEqualByComparingTo("0.00");
        assertThat(autoCreatedAndReserved.getReservedQuantity()).isEqualByComparingTo("4.00");
        assertThat(autoCreatedAndReserved.getAvailableQuantity()).isEqualByComparingTo("-4.00");
        assertThat(autoCreatedAndReserved.resolveAlertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);

        ArgumentCaptor<StockMovement> movementCaptor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository, times(2)).saveAndFlush(movementCaptor.capture());
        assertThat(movementCaptor.getAllValues())
            .extracting(StockMovement::getType)
            .containsOnly(StockMovementType.PRODUCTION_RESERVATION);
    }

    @Test
    @DisplayName("reserveMaterials: deve ser idempotente quando a O.S. já possui reservas pendentes")
    void shouldBeIdempotentWhenReservingMaterialsTwiceForSameOrder() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "VIDRO", "VID-8MM", "Vidro Temperado 8mm");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("5.00"));
        StockItem stockItem = new StockItem(material);

        StockMovement activeReservation = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("5.00"))
            .previousPhysicalQuantity(BigDecimal.ZERO)
            .newPhysicalQuantity(BigDecimal.ZERO)
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("5.00"))
            .build();

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(activeReservation));

        stockService.reserveMaterials(orderId);

        verify(stockItemRepository, never()).saveAndFlush(any());
        verify(stockMovementRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("reserveMaterials e StockOrderEventListener: deve propagar exceção de infraestrutura para rollback e delegar evento")
    void shouldPropagateInfrastructureExceptionOnReserveMaterialsAndDelegateFromListener() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "ALUMINIO", "PER-500", "Perfil Tubular");
        Order order = buildOrderWithMaterial(orderId, material, new BigDecimal("2.00"));
        StockItem stockItem = new StockItem(material);

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of());
        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        doThrow(new DataAccessResourceFailureException("Falha de conexão simulada"))
            .when(stockItemRepository).saveAndFlush(any(StockItem.class));

        assertThatThrownBy(() -> stockService.reserveMaterials(orderId))
            .isInstanceOf(DataAccessResourceFailureException.class)
            .hasMessageContaining("Falha de conexão simulada");

        verify(stockMovementRepository, never()).saveAndFlush(any());

        StockPort portMock = mock(StockPort.class);
        StockOrderEventListener listener = new StockOrderEventListener(portMock);
        listener.onOrderMaterialsReservation(null);
        listener.onOrderMaterialsReservation(new OrderMaterialsReservationEvent(null));
        listener.onOrderMaterialsReservation(new OrderMaterialsReservationEvent(orderId));

        verify(portMock).reserveMaterials(orderId);
    }
}

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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;

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
import br.edu.ifpb.alumigest.stock.domain.StockSortField;
import br.edu.ifpb.alumigest.stock.dto.OrderStockAlertResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockBalanceFilter;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
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
    @DisplayName("registerMovement: deve rejeitar SCRAP_LOSS com justificativa em branco")
    void shouldRejectScrapLossWithBlankReason() {
        UUID materialId = UUID.randomUUID();
        StockMovementRequestDTO emptyReason = new StockMovementRequestDTO(
            materialId,
            StockMovementType.SCRAP_LOSS,
            new BigDecimal("1.00"),
            null,
            "   ",
            null,
            "almoxarife"
        );

        assertThatThrownBy(() -> stockService.registerMovement(emptyReason))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("justificativa é obrigatória");
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

    private List<StockItem> buildCatalogStockFixtures() {
        Material glassNegative = buildMaterial(
            UUID.randomUUID(), "VIDRO", "VID-010", "Vidro Fumê 10mm");
        StockItem deficitItem = new StockItem(glassNegative);
        deficitItem.addPhysical(new BigDecimal("4.00"));
        deficitItem.reserve(new BigDecimal("10.00"));
        deficitItem.updateMinimumStock(new BigDecimal("5.00"));

        Material profileReorder = buildMaterial(
            UUID.randomUUID(), "ALUMINIO", "PER-001", "Perfil Suprema");
        StockItem reorderItem = new StockItem(profileReorder);
        reorderItem.addPhysical(new BigDecimal("5.00"));
        reorderItem.updateMinimumStock(new BigDecimal("5.00"));

        Material hardwareHealthy = buildMaterial(
            UUID.randomUUID(), "FERRAGEM", "FER-001", "Fechadura Concha");
        StockItem healthyItem = new StockItem(hardwareHealthy);
        healthyItem.addPhysical(new BigDecimal("12.00"));
        healthyItem.updateMinimumStock(new BigDecimal("5.00"));

        Material filmZeroMin = buildMaterial(
            UUID.randomUUID(), "PELICULA", "PEL-001", "Película Jateada");
        StockItem zeroMinItem = new StockItem(filmZeroMin);

        return List.of(healthyItem, reorderItem, deficitItem, zeroMinItem);
    }

    @Test
    @DisplayName("[Tabela de Decisão] listStockBalances: combinação needsPurchase e belowMinStock usa OR")
    void shouldFilterBalancesWithDecisionTableCombinations() {
        when(stockItemRepository.findAllWithMaterial()).thenReturn(buildCatalogStockFixtures());

        List<StockItemResponseDTO> onlyDeficit = stockService.listStockBalances(
            new StockBalanceFilter(null, null, null, true, false, StockSortField.NAME)
        );
        assertThat(onlyDeficit).extracting(StockItemResponseDTO::materialSku)
            .containsExactly("VID-010");

        List<StockItemResponseDTO> onlyBelowMin = stockService.listStockBalances(
            new StockBalanceFilter(null, null, null, false, true, StockSortField.NAME)
        );
        assertThat(onlyBelowMin).extracting(StockItemResponseDTO::materialSku)
            .containsExactly("PER-001", "VID-010");

        List<StockItemResponseDTO> combinedOr = stockService.listStockBalances(
            new StockBalanceFilter(null, null, null, true, true, StockSortField.CRITICALITY)
        );
        assertThat(combinedOr).extracting(StockItemResponseDTO::materialSku)
            .containsExactly("VID-010", "PER-001");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] listStockBalances: respeita fronteira available <= minimumStock")
    void shouldEvaluateBoundaryBetweenOrderPointAndInStock() {
        Material exactLimit = buildMaterial(
            UUID.randomUUID(), "VIDRO", "VID-LIM", "Vidro Limite");
        StockItem atBoundary = new StockItem(exactLimit);
        atBoundary.addPhysical(new BigDecimal("5.0000"));
        atBoundary.updateMinimumStock(new BigDecimal("5.0000"));

        Material aboveLimit = buildMaterial(
            UUID.randomUUID(), "VIDRO", "VID-OK", "Vidro Acima");
        StockItem justAbove = new StockItem(aboveLimit);
        justAbove.addPhysical(new BigDecimal("5.0100"));
        justAbove.updateMinimumStock(new BigDecimal("5.0000"));

        when(stockItemRepository.findAllWithMaterial()).thenReturn(List.of(atBoundary, justAbove));

        List<StockItemResponseDTO> belowMin = stockService.listStockBalances(
            new StockBalanceFilter(null, null, null, null, true, StockSortField.AVAILABLE)
        );

        assertThat(belowMin).hasSize(1);
        assertThat(belowMin.get(0).materialSku()).isEqualTo("VID-LIM");
        assertThat(belowMin.get(0).alertStatus()).isEqualTo(StockAlertStatus.ORDER_POINT);
    }

    @Test
    @DisplayName("[Partição de Equivalência] listStockBalances: filtra por categoria, busca e ordenação")
    void shouldFilterByCategorySearchAndSortCriteria() {
        when(stockItemRepository.findAllWithMaterial()).thenReturn(buildCatalogStockFixtures());

        List<StockItemResponseDTO> byCategoryAndSearch = stockService.listStockBalances(
            new StockBalanceFilter("PROFILE", null, "suprema", null, null, StockSortField.NAME)
        );
        assertThat(byCategoryAndSearch).extracting(StockItemResponseDTO::materialSku)
            .containsExactly("PER-001");

        List<StockItemResponseDTO> sortedByAvailable = stockService.listStockBalances(
            new StockBalanceFilter(null, null, null, null, null, StockSortField.AVAILABLE)
        );
        assertThat(sortedByAvailable).extracting(StockItemResponseDTO::materialSku)
            .containsExactly("VID-010", "PEL-001", "PER-001", "FER-001");
    }

    @Test
    @DisplayName("[Partição de Equivalência] listMovements: filtra por material e mapeia auditoria")
    void shouldListMovementsFilteredByMaterialWithExtendedAuditFields() {
        UUID materialId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "VIDRO", "VID-008", "Vidro Incolor 8mm");
        StockItem stockItem = new StockItem(material);

        StockMovement entry = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .type(StockMovementType.PURCHASE_ENTRY)
            .quantity(new BigDecimal("10.0000"))
            .unitCost(new BigDecimal("95.00"))
            .previousPhysicalQuantity(BigDecimal.ZERO)
            .newPhysicalQuantity(new BigDecimal("10.0000"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(BigDecimal.ZERO)
            .referenceDocument("NF-1024")
            .reason("Compra inicial")
            .registeredBy("Almoxarife")
            .build();

        StockMovement reservation = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("4.0000"))
            .previousPhysicalQuantity(new BigDecimal("10.0000"))
            .newPhysicalQuantity(new BigDecimal("10.0000"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("4.0000"))
            .referenceDocument("OS-2026-0001")
            .reason("Reserva O.S.")
            .registeredBy("SYSTEM")
            .build();

        when(stockMovementRepository.findByMaterialIdOrderByCreatedAtDesc(materialId))
            .thenReturn(List.of(reservation, entry));

        List<StockMovementResponseDTO> result = stockService.listMovements(materialId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).type()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(result.get(0).orderId()).isEqualTo(orderId);
        assertThat(result.get(0).unitMeasure()).isEqualTo("M2");
        assertThat(result.get(1).type()).isEqualTo(StockMovementType.PURCHASE_ENTRY);
        assertThat(result.get(1).unitCost()).isEqualByComparingTo("95.00");
        verify(stockMovementRepository).findByMaterialIdOrderByCreatedAtDesc(materialId);
    }

    @Test
    @DisplayName("[Partição de Equivalência] listMovements: sem filtro consulta todas com JOIN FETCH")
    void shouldListAllMovementsWhenMaterialIdIsNull() {
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "FERRAGEM", "FER-010", "Fecho Concha");
        material.setUnitMeasure(null);
        StockItem stockItem = new StockItem(material);

        StockMovement outflow = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .type(StockMovementType.PRODUCTION_OUTFLOW)
            .quantity(new BigDecimal("2.0000"))
            .previousPhysicalQuantity(new BigDecimal("5.0000"))
            .newPhysicalQuantity(new BigDecimal("3.0000"))
            .previousReservedQuantity(new BigDecimal("2.0000"))
            .newReservedQuantity(BigDecimal.ZERO)
            .referenceDocument("OS-2026-0002")
            .reason("Baixa de conclusão")
            .registeredBy("SYSTEM")
            .build();

        when(stockMovementRepository.findAllWithMaterialOrderByCreatedAtDesc())
            .thenReturn(List.of(outflow));

        List<StockMovementResponseDTO> result = stockService.listMovements(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).unitMeasure()).isNull();
        assertThat(result.get(0).type()).isEqualTo(StockMovementType.PRODUCTION_OUTFLOW);
        verify(stockMovementRepository).findAllWithMaterialOrderByCreatedAtDesc();
    }
    @Test
    @DisplayName("RN-06: Deve lançar BusinessException ao registrar PURCHASE_ENTRY sem unitCost")
    void shouldRejectPurchaseEntryWithoutUnitCost() {
        StockMovementRequestDTO request = new StockMovementRequestDTO(
            UUID.randomUUID(),
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10"),
            null,
            "Compra sem custo",
            "Pedido 1088",
            "almoxarifado",
            "Distribuidora Asa"
        );

        assertThatThrownBy(() -> stockService.registerMovement(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("RN-06");
    }

    @Test
    @DisplayName("RN-05 e supplier: Deve normalizar documento livre e persistir fornecedor no Kardex")
    void shouldPersistFreeDocumentAndSupplierOnPurchaseEntry() {
        UUID materialId = UUID.randomUUID();
        Material material = mock(Material.class);
        when(material.getId()).thenReturn(materialId);
        StockItem stockItem = new StockItem(material);

        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.of(stockItem));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.saveAndFlush(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovementRequestDTO request = new StockMovementRequestDTO(
            materialId,
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10"),
            new BigDecimal("145.00"),
            "  Chegada de loja  ",
            "  Pedido 1088  ",
            "  almoxarifado  ",
            "  Distribuidora Asa  "
        );

        StockMovementResponseDTO response = stockService.registerMovement(request);

        ArgumentCaptor<StockMovement> captor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).saveAndFlush(captor.capture());
        StockMovement saved = captor.getValue();

        assertThat(saved.getReferenceDocument()).isEqualTo("Pedido 1088");
        assertThat(saved.getSupplier()).isEqualTo("Distribuidora Asa");
        assertThat(saved.getReason()).isEqualTo("Chegada de loja");
        assertThat(saved.getRegisteredBy()).isEqualTo("almoxarifado");
        assertThat(saved.getUnitCost()).isEqualByComparingTo("145.00");
        assertThat(response.supplier()).isEqualTo("Distribuidora Asa");
        assertThat(response.referenceDocument()).isEqualTo("Pedido 1088");
    }

    @Test
    @DisplayName("Auto-provisionamento: Deve criar tb_stock_items ausente e aplicar ponto de pedido (minimumStock)")
    void shouldProvisionMissingStockItemWithMinimumStock() {
        UUID materialId = UUID.randomUUID();
        Material material = mock(Material.class);
        when(material.getId()).thenReturn(materialId);

        when(stockItemRepository.findByMaterialIdForUpdate(materialId)).thenReturn(Optional.empty());
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));
        when(stockItemRepository.saveAndFlush(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));

        StockItemResponseDTO response = stockService.provisionStockItem(materialId, new BigDecimal("4"));

        ArgumentCaptor<StockItem> captor = ArgumentCaptor.forClass(StockItem.class);
        verify(stockItemRepository, times(2)).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getMinimumStock()).isEqualByComparingTo("4.0000");
        assertThat(response.minimumStock()).isEqualByComparingTo("4.0000");
    }

    @Test
    @DisplayName("Auto-provisionamento: Deve rejeitar ponto de pedido negativo")
    void shouldRejectNegativeMinimumStockOnProvision() {
        UUID materialId = UUID.randomUUID();
        BigDecimal negativeMinimumStock = new BigDecimal("-1");

        assertThatThrownBy(() -> stockService.provisionStockItem(materialId, negativeMinimumStock))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("não pode ser negativo");
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

    @Test
    @DisplayName("getOrderStockAlert: deve validar orderId nulo e pedido inexistente")
    void shouldValidateNullAndMissingOrderInGetOrderStockAlert() {
        assertThatThrownBy(() -> stockService.getOrderStockAlert(null))
            .isInstanceOf(BusinessException.class);

        UUID missingId = UUID.randomUUID();
        when(orderRepository.findByIdWithDetails(missingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockService.getOrderStockAlert(missingId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getOrderStockAlert: deve retornar IN_STOCK quando a O.S. não tiver reservas pendentes")
    void shouldReturnInStockWhenOrderHasNoPendingReservations() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).codigo("OS-2026-0001").build();
        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of());

        OrderStockAlertResponseDTO alert = stockService.getOrderStockAlert(orderId);

        assertThat(alert.alertStatus()).isEqualTo(StockAlertStatus.IN_STOCK);
        assertThat(alert.missingMaterials()).isEmpty();
    }

    @Test
    @DisplayName("getOrderStockAlert: deve retornar IN_STOCK quando houver reserva ativa mas o estoque for suficiente")
    void shouldReturnInStockWhenOrderHasActiveReservationWithSufficientStock() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "PERFIL", "ALU-5050", "Perfil 50x50");

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("20.00"));
        stockItem.reserve(new BigDecimal("5.00"));
        stockItem.updateMinimumStock(new BigDecimal("5.00"));

        Order order = Order.builder().id(orderId).codigo("OS-2026-0001").build();
        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));

        StockMovement reservationMovement = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("5.00"))
            .previousPhysicalQuantity(new BigDecimal("20.00"))
            .newPhysicalQuantity(new BigDecimal("20.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("5.00"))
            .build();

        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(reservationMovement));
        when(stockItemRepository.findAllByMaterialIdIn(any()))
            .thenReturn(List.of(stockItem));

        OrderStockAlertResponseDTO alert = stockService.getOrderStockAlert(orderId);

        assertThat(alert.alertStatus()).isEqualTo(StockAlertStatus.IN_STOCK);
        assertThat(alert.missingMaterials()).isEmpty();
    }

    @Test
    @DisplayName("getOrderStockAlert: deve retornar ORDER_POINT quando o saldo disponível atingir o estoque mínimo")
    void shouldReturnOrderPointWhenReservedMaterialReachesMinimumStock() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "PERFIL", "ALU-5050", "Perfil 50x50");

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("15.00"));
        stockItem.reserve(new BigDecimal("10.00"));
        stockItem.updateMinimumStock(new BigDecimal("5.00"));

        Order order = Order.builder().id(orderId).codigo("OS-2026-0001").build();
        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));

        StockMovement reservationMovement = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("10.00"))
            .previousPhysicalQuantity(new BigDecimal("15.00"))
            .newPhysicalQuantity(new BigDecimal("15.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("10.00"))
            .build();

        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(reservationMovement));
        when(stockItemRepository.findAllByMaterialIdIn(any()))
            .thenReturn(List.of(stockItem));

        OrderStockAlertResponseDTO alert = stockService.getOrderStockAlert(orderId);

        assertThat(alert.alertStatus()).isEqualTo(StockAlertStatus.ORDER_POINT);
        assertThat(alert.missingMaterials()).isEmpty();
    }

    @Test
    @DisplayName("getOrderStockAlert: deve retornar NEED_PURCHASE e listar insumos com déficit")
    void shouldReturnNeedPurchaseWithMissingMaterialsWhenAvailableIsNegative() {
        UUID orderId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        Material material = buildMaterial(materialId, "PERFIL", "ALU-5050", "Perfil 50x50");

        StockItem stockItem = new StockItem(material);
        // physical 2, reserve 10 -> available = -8 (NEED_PURCHASE)
        stockItem.addPhysical(new BigDecimal("2.00"));
        stockItem.reserve(new BigDecimal("10.00"));

        Order order = Order.builder().id(orderId).codigo("OS-2026-0001").build();
        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));

        StockMovement reservationMovement = StockMovement.builder()
            .stockItem(stockItem)
            .material(material)
            .orderId(orderId)
            .type(StockMovementType.PRODUCTION_RESERVATION)
            .quantity(new BigDecimal("10.00"))
            .previousPhysicalQuantity(new BigDecimal("2.00"))
            .newPhysicalQuantity(new BigDecimal("2.00"))
            .previousReservedQuantity(BigDecimal.ZERO)
            .newReservedQuantity(new BigDecimal("10.00"))
            .build();

        when(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId))
            .thenReturn(List.of(reservationMovement));
        when(stockItemRepository.findAllByMaterialIdIn(any()))
            .thenReturn(List.of(stockItem));

        OrderStockAlertResponseDTO alert = stockService.getOrderStockAlert(orderId);

        assertThat(alert.alertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);
        assertThat(alert.missingMaterials()).hasSize(1);
        OrderStockAlertResponseDTO.MissingMaterialDTO missing = alert.missingMaterials().get(0);
        assertThat(missing.materialName()).isEqualTo("Perfil 50x50");
        assertThat(missing.materialSku()).isEqualTo("ALU-5050");
        assertThat(missing.availableQuantity()).isLessThan(BigDecimal.ZERO);
    }
}

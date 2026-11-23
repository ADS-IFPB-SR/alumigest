package br.edu.ifpb.alumigest.stock.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockItem;
import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integração Ciclo de Vida Estoque x O.S. (US-21.2)")
class StockLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StockPort stockPort;

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    @Autowired
    private ProductRepository productRepository;

    private final List<UUID> createdOrderIds = new ArrayList<>();
    private final List<UUID> createdBudgetIds = new ArrayList<>();
    private final List<UUID> createdClientIds = new ArrayList<>();
    private final List<UUID> createdProductIds = new ArrayList<>();
    private final List<UUID> createdMaterialIds = new ArrayList<>();
    private final List<UUID> createdGroupIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        stockMovementRepository.deleteAll();
        stockItemRepository.deleteAll();
        createdOrderIds.forEach(orderRepository::deleteById);
        createdBudgetIds.forEach(budgetRepository::deleteById);
        createdClientIds.forEach(clientRepository::deleteById);
        createdProductIds.forEach(productRepository::deleteById);
        createdMaterialIds.forEach(materialRepository::deleteById);
        createdGroupIds.forEach(materialGroupRepository::deleteById);
        createdOrderIds.clear();
        createdBudgetIds.clear();
        createdClientIds.clear();
        createdProductIds.clear();
        createdMaterialIds.clear();
        createdGroupIds.clear();
    }

    private Material persistMaterial(String sku, BigDecimal initialPhysical) {
        String code = "GRP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        MaterialGroup group = new MaterialGroup(
            null,
            code,
            "Grupo Teste",
            CalculationType.SQUARE_METER,
            null,
            false,
            true
        );
        group = materialGroupRepository.saveAndFlush(group);
        createdGroupIds.add(group.getId());

        Material material = new Material();
        material.setGroup(group);
        material.setSkuCode(sku);
        material.setName("Vidro 8mm " + sku);
        material.setCostPrice(new BigDecimal("50.00"));
        material.setSalePrice(new BigDecimal("100.00"));
        material.setUnitMeasure(UnitMeasure.M2);
        material = materialRepository.saveAndFlush(material);
        createdMaterialIds.add(material.getId());

        StockItem stockItem = new StockItem(material);
        if (initialPhysical.compareTo(BigDecimal.ZERO) > 0) {
            stockItem.addPhysical(initialPhysical);
        }
        stockItemRepository.saveAndFlush(stockItem);
        return material;
    }

    private Order persistOrder(OrderStatus status, Material material, BigDecimal qty) {
        Client client = Client.builder()
            .fullName("Cliente Estoque IT")
            .phone("83988887777")
            .build();
        client = clientRepository.saveAndFlush(client);
        createdClientIds.add(client.getId());

        Budget budget = new Budget();
        budget.setCode("ORC-STK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.APPROVED);
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.setTotal(new BigDecimal("1000.00"));
        budget = budgetRepository.saveAndFlush(budget);
        createdBudgetIds.add(budget.getId());

        Order order = Order.builder()
            .codigo("OS-STK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .orcamentoId(budget.getId())
            .cliente(client)
            .clienteNome(client.getFullName())
            .clienteTelefone(client.getPhone())
            .status(status)
            .canalAprovacao(ApprovalChannel.WHATSAPP)
            .dataPrevisaoEntrega(LocalDate.now(ZoneOffset.UTC).plusDays(7))
            .valorBruto(new BigDecimal("1000.00"))
            .valorLiquido(new BigDecimal("1000.00"))
            .build();

        OrderItem item = OrderItem.builder()
            .order(order)
            .descricao("Porta Temperada")
            .larguraMm(1000)
            .alturaMm(2100)
            .quantidade(1)
            .build();

        OrderItemOption option = OrderItemOption.builder()
            .material(material)
            .materialName(material.getName())
            .unitMeasure("M2")
            .categoryType("GLASS")
            .quantity(qty)
            .build();

        item.addOption(option);
        order.addItem(item);
        order = orderRepository.saveAndFlush(order);
        createdOrderIds.add(order.getId());
        return order;
    }

    @Test
    @DisplayName("Ao concluir O.S. (IN_PRODUCTION -> COMPLETED), deve baixar físico e reserva mantendo disponível e gravando PRODUCTION_OUTFLOW")
    void shouldConsumeReservedStockWhenCompletingOrderViaProductionEndpoint() throws Exception {
        Material material = persistMaterial("VID-INT-1", new BigDecimal("30.00"));
        Order order = persistOrder(OrderStatus.IN_PRODUCTION, material, new BigDecimal("8.50"));

        stockPort.reserveMaterialsForOrder(order.getId());

        StockItem afterReserve = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterReserve.getPhysicalQuantity()).isEqualByComparingTo("30.00");
        assertThat(afterReserve.getReservedQuantity()).isEqualByComparingTo("8.50");
        assertThat(afterReserve.getAvailableQuantity()).isEqualByComparingTo("21.50");

        mockMvc.perform(patch("/api/v1/orders/{id}/production-status", order.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMPLETED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"));

        StockItem afterComplete = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterComplete.getPhysicalQuantity()).isEqualByComparingTo("21.50");
        assertThat(afterComplete.getReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(afterComplete.getAvailableQuantity()).isEqualByComparingTo("21.50");

        List<StockMovement> movements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        assertThat(movements).hasSize(2);
        assertThat(movements.get(0).getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(movements.get(1).getType()).isEqualTo(StockMovementType.PRODUCTION_OUTFLOW);
        assertThat(movements.get(1).getQuantity()).isEqualByComparingTo("8.50");
        assertThat(movements.get(1).getNewPhysicalQuantity()).isEqualByComparingTo("21.50");
        assertThat(movements.get(1).getNewReservedQuantity()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Ao cancelar O.S., deve zerar reserva, recompor disponível e gravar RESERVATION_CANCELLATION")
    void shouldCancelReservedStockWhenCancellingOrderViaEndpoint() throws Exception {
        Material material = persistMaterial("VID-INT-2", new BigDecimal("10.00"));
        Order order = persistOrder(OrderStatus.WAITING_PRODUCTION, material, new BigDecimal("14.00"));

        stockPort.reserveMaterialsForOrder(order.getId());

        StockItem afterReserve = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterReserve.getAvailableQuantity()).isEqualByComparingTo("-4.00");

        OrderCancelRequest cancelRequest = new OrderCancelRequest("Cliente desistiu do pedido");

        mockMvc.perform(patch("/api/v1/orders/{id}/cancel", order.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        StockItem afterCancel = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterCancel.getPhysicalQuantity()).isEqualByComparingTo("10.00");
        assertThat(afterCancel.getReservedQuantity()).isEqualByComparingTo("0.00");
        assertThat(afterCancel.getAvailableQuantity()).isEqualByComparingTo("10.00");

        List<StockMovement> movements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        assertThat(movements).hasSize(2);
        assertThat(movements.get(0).getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(movements.get(1).getType()).isEqualTo(StockMovementType.RESERVATION_CANCELLATION);
        assertThat(movements.get(1).getQuantity()).isEqualByComparingTo("14.00");
        assertThat(movements.get(1).getNewReservedQuantity()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("GET /api/v1/stock/orders/{id}/alert deve retornar o status Make-to-Order e insumos faltantes")
    void shouldReturnStockAlertForOrderViaEndpoint() throws Exception {
        Material material = persistMaterial("VID-INT-ALERT", new BigDecimal("5.00"));
        Order order = persistOrder(OrderStatus.WAITING_PRODUCTION, material, new BigDecimal("12.00"));

        stockPort.reserveMaterialsForOrder(order.getId());

        mockMvc.perform(get("/api/v1/stock/orders/{id}/alert", order.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.alertStatus").value("NEED_PURCHASE"))
            .andExpect(jsonPath("$.missingMaterials").isArray())
            .andExpect(jsonPath("$.missingMaterials[0].materialSku").value("VID-INT-ALERT"))
            .andExpect(jsonPath("$.missingMaterials[0].availableQuantity").value(-7.0));
    }

    @Test
    @DisplayName("Ao aprovar/converter orçamento e avançar para WAITING_PRODUCTION, deve reservar materiais Make-to-Order sem bloquear")
    void shouldAutoReserveMaterialsInMakeToOrderWhenConvertingBudgetAndTransitioningToWaitingProduction()
            throws Exception {
        Material material = persistMaterial("VID-INT-MTO", new BigDecimal("2.00"));

        Client client = Client.builder()
            .fullName("Cliente Make-to-Order IT")
            .phone("83988881111")
            .build();
        client = clientRepository.saveAndFlush(client);
        createdClientIds.add(client.getId());

        Product product = new Product();
        product.setName("Porta de Correr MTO");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_1F);
        product.setActive(true);
        product = productRepository.saveAndFlush(product);
        createdProductIds.add(product.getId());

        Budget budget = new Budget();
        budget.setCode("ORC-MTO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.SENT);
        budget.setSubtotal(new BigDecimal("1800.00"));
        budget.setTotal(new BigDecimal("1800.00"));

        BudgetItem budgetItem = new BudgetItem();
        budgetItem.setProduct(product);
        budgetItem.setProductName(product.getName());
        budgetItem.setWidthMm(new BigDecimal("1500"));
        budgetItem.setHeightMm(new BigDecimal("2100"));
        budgetItem.setQuantity(1);
        budgetItem.setSubtotal(new BigDecimal("1800.00"));
        budgetItem.setLaborCost(BigDecimal.ZERO);

        BudgetItemOption option = new BudgetItemOption();
        option.setMaterial(material);
        option.setMaterialName(material.getName());
        option.setUnitMeasure("M2");
        option.setCategoryType(MaterialCategoryType.GLASS);
        option.setQuantity(new BigDecimal("7.50"));
        option.setUnitPrice(new BigDecimal("100.00"));
        option.setTotalPrice(new BigDecimal("750.00"));
        budgetItem.addOption(option);
        budget.addItem(budgetItem);

        budget = budgetRepository.saveAndFlush(budget);
        createdBudgetIds.add(budget.getId());

        OrderConvertRequest convertRequest = new OrderConvertRequest(
            ApprovalChannel.WHATSAPP,
            LocalDate.now(ZoneOffset.UTC).plusDays(10),
            "Reserva Make-to-Order automática"
        );

        MvcResult convertResult = mockMvc.perform(post("/api/v1/orders/from-budget/{budgetId}", budget.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(convertRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("CREATED"))
            .andReturn();

        UUID createdOrderId = UUID.fromString(
            objectMapper.readTree(convertResult.getResponse().getContentAsString()).get("id").asText()
        );
        createdOrderIds.add(createdOrderId);

        StockItem afterConvert = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterConvert.getPhysicalQuantity()).isEqualByComparingTo("2.0000");
        assertThat(afterConvert.getReservedQuantity()).isEqualByComparingTo("7.5000");
        assertThat(afterConvert.getAvailableQuantity()).isEqualByComparingTo("-5.5000");
        assertThat(afterConvert.resolveAlertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);

        List<StockMovement> movementsAfterConvert =
            stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(createdOrderId);
        assertThat(movementsAfterConvert).hasSize(1);
        assertThat(movementsAfterConvert.getFirst().getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(movementsAfterConvert.getFirst().getQuantity()).isEqualByComparingTo("7.50");

        mockMvc.perform(patch("/api/v1/orders/{id}/status", createdOrderId)
                .param("status", "WAITING_PRODUCTION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"));

        StockItem afterWaiting = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterWaiting.getReservedQuantity()).isEqualByComparingTo("7.5000");
        assertThat(afterWaiting.getAvailableQuantity()).isEqualByComparingTo("-5.5000");
        assertThat(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(createdOrderId)).hasSize(1);
    }

    @Test
    @DisplayName("POST /api/v1/stock/reserve-for-order/{orderId}: deve reservar materiais Make-to-Order e retornar 204")
    void shouldReserveMaterialsViaReserveForOrderEndpoint() throws Exception {
        Material material = persistMaterial("VID-INT-EP", new BigDecimal("3.00"));
        Order order = persistOrder(OrderStatus.WAITING_PRODUCTION, material, new BigDecimal("5.00"));

        mockMvc.perform(post("/api/v1/stock/reserve-for-order/{orderId}", order.getId()))
            .andExpect(status().isNoContent());

        StockItem afterReserve = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterReserve.getPhysicalQuantity()).isEqualByComparingTo("3.0000");
        assertThat(afterReserve.getReservedQuantity()).isEqualByComparingTo("5.0000");
        assertThat(afterReserve.getAvailableQuantity()).isEqualByComparingTo("-2.0000");
        assertThat(afterReserve.resolveAlertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);

        List<StockMovement> movements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        assertThat(movements).hasSize(1);
        assertThat(movements.getFirst().getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);

        mockMvc.perform(post("/api/v1/stock/reserve-for-order/{orderId}", order.getId()))
            .andExpect(status().isNoContent());
        assertThat(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())).hasSize(1);
    }

    @Test
    @DisplayName("Ao transicionar O.S. de CREATED para WAITING_PRODUCTION sem reserva prévia, deve reservar materiais automaticamente")
    void shouldReserveMaterialsWhenOrderTransitionsFromCreatedToWaitingProduction() throws Exception {
        Material material = persistMaterial("VID-INT-WAIT", new BigDecimal("15.00"));
        Order order = persistOrder(OrderStatus.CREATED, material, new BigDecimal("4.25"));

        assertThat(stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())).isEmpty();

        mockMvc.perform(patch("/api/v1/orders/{id}/status", order.getId())
                .param("status", "WAITING_PRODUCTION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"));

        StockItem afterTransition = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(afterTransition.getPhysicalQuantity()).isEqualByComparingTo("15.0000");
        assertThat(afterTransition.getReservedQuantity()).isEqualByComparingTo("4.2500");
        assertThat(afterTransition.getAvailableQuantity()).isEqualByComparingTo("10.7500");
        assertThat(afterTransition.resolveAlertStatus()).isEqualTo(StockAlertStatus.IN_STOCK);

        List<StockMovement> movements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        assertThat(movements).hasSize(1);
        assertThat(movements.getFirst().getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(movements.getFirst().getQuantity()).isEqualByComparingTo("4.25");
    }

    @Test
    @DisplayName("E2E Completo (US-21.8): Orçamento aprovado -> Conversão em O.S. -> Reserva Make-to-Order -> Fabricação -> Baixa Física, validando invariante em cada etapa")
    void shouldExecuteFullLifecycleFromBudgetToOrderCompletionVerifyingInvariants() throws Exception {
        // 1. Estado Inicial do Estoque: 25.00 unidades físicas
        Material material = persistMaterial("VID-E2E-FULL", new BigDecimal("25.0000"));
        StockItem initialStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(initialStock.getPhysicalQuantity()).isEqualByComparingTo("25.0000");
        assertThat(initialStock.getReservedQuantity()).isEqualByComparingTo("0.0000");
        assertThat(initialStock.getAvailableQuantity()).isEqualByComparingTo("25.0000");
        assertThat(initialStock.getAvailableQuantity())
            .isEqualByComparingTo(initialStock.getPhysicalQuantity().subtract(initialStock.getReservedQuantity()));

        // 2. Criação do Orçamento Aprovado demandando 9.00 do insumo
        Client client = Client.builder()
            .fullName("Cliente Jornada E2E")
            .phone("83988882222")
            .build();
        client = clientRepository.saveAndFlush(client);
        createdClientIds.add(client.getId());

        Product product = new Product();
        product.setName("Janela Integrada E2E");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_1F);
        product.setActive(true);
        product = productRepository.saveAndFlush(product);
        createdProductIds.add(product.getId());

        Budget budget = new Budget();
        budget.setCode("ORC-E2E-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.APPROVED);
        budget.setSubtotal(new BigDecimal("2200.00"));
        budget.setTotal(new BigDecimal("2200.00"));

        BudgetItem budgetItem = new BudgetItem();
        budgetItem.setProduct(product);
        budgetItem.setProductName(product.getName());
        budgetItem.setWidthMm(new BigDecimal("1200"));
        budgetItem.setHeightMm(new BigDecimal("1400"));
        budgetItem.setQuantity(1);
        budgetItem.setSubtotal(new BigDecimal("2200.00"));
        budgetItem.setLaborCost(BigDecimal.ZERO);

        BudgetItemOption option = new BudgetItemOption();
        option.setMaterial(material);
        option.setMaterialName(material.getName());
        option.setUnitMeasure("M2");
        option.setCategoryType(MaterialCategoryType.GLASS);
        option.setQuantity(new BigDecimal("9.0000"));
        option.setUnitPrice(new BigDecimal("120.00"));
        option.setTotalPrice(new BigDecimal("1080.00"));
        budgetItem.addOption(option);
        budget.addItem(budgetItem);

        budget = budgetRepository.saveAndFlush(budget);
        createdBudgetIds.add(budget.getId());

        // 3. Conversão em Ordem de Serviço -> Disparo de Reserva Make-to-Order
        OrderConvertRequest convertRequest = new OrderConvertRequest(
            ApprovalChannel.WHATSAPP,
            LocalDate.now(ZoneOffset.UTC).plusDays(15),
            "Conversão E2E oficial"
        );

        MvcResult convertResult = mockMvc.perform(post("/api/v1/orders/from-budget/{budgetId}", budget.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(convertRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("CREATED"))
            .andReturn();

        UUID orderId = UUID.fromString(
            objectMapper.readTree(convertResult.getResponse().getContentAsString()).get("id").asText()
        );
        createdOrderIds.add(orderId);

        // Validação da Invariante após Reserva Automática
        StockItem stockAfterReserve = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(stockAfterReserve.getPhysicalQuantity()).isEqualByComparingTo("25.0000");
        assertThat(stockAfterReserve.getReservedQuantity()).isEqualByComparingTo("9.0000");
        assertThat(stockAfterReserve.getAvailableQuantity()).isEqualByComparingTo("16.0000");
        assertThat(stockAfterReserve.getAvailableQuantity())
            .isEqualByComparingTo(stockAfterReserve.getPhysicalQuantity().subtract(stockAfterReserve.getReservedQuantity()));

        // 4. Fabricação: Transições na esteira CREATED -> WAITING_PRODUCTION -> IN_PRODUCTION
        mockMvc.perform(patch("/api/v1/orders/{id}/status", orderId)
                .param("status", "WAITING_PRODUCTION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"));

        mockMvc.perform(patch("/api/v1/orders/{id}/status", orderId)
                .param("status", "IN_PRODUCTION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PRODUCTION"));

        // Invariante durante a produção permanece estável
        StockItem stockDuringProd = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(stockDuringProd.getPhysicalQuantity()).isEqualByComparingTo("25.0000");
        assertThat(stockDuringProd.getReservedQuantity()).isEqualByComparingTo("9.0000");
        assertThat(stockDuringProd.getAvailableQuantity()).isEqualByComparingTo("16.0000");
        assertThat(stockDuringProd.getAvailableQuantity())
            .isEqualByComparingTo(stockDuringProd.getPhysicalQuantity().subtract(stockDuringProd.getReservedQuantity()));

        // 5. Conclusão da Produção: Baixa Física Definitiva
        mockMvc.perform(patch("/api/v1/orders/{id}/production-status", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMPLETED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Validação da Invariante Final após Baixa Física (Delta disponível = 0)
        StockItem finalStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(finalStock.getPhysicalQuantity()).isEqualByComparingTo("16.0000"); // 25.00 - 9.00
        assertThat(finalStock.getReservedQuantity()).isEqualByComparingTo("0.0000");  // 9.00 - 9.00
        assertThat(finalStock.getAvailableQuantity()).isEqualByComparingTo("16.0000"); // inalterado!
        assertThat(finalStock.getAvailableQuantity())
            .isEqualByComparingTo(finalStock.getPhysicalQuantity().subtract(finalStock.getReservedQuantity()));

        // Trilha Kardex com histórico imutável: exatamente 2 movimentações vinculadas à O.S.
        List<StockMovement> orderMovements = stockMovementRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        assertThat(orderMovements).hasSize(2);
        assertThat(orderMovements.get(0).getType()).isEqualTo(StockMovementType.PRODUCTION_RESERVATION);
        assertThat(orderMovements.get(0).getQuantity()).isEqualByComparingTo("9.0000");
        assertThat(orderMovements.get(1).getType()).isEqualTo(StockMovementType.PRODUCTION_OUTFLOW);
        assertThat(orderMovements.get(1).getQuantity()).isEqualByComparingTo("9.0000");
    }
}

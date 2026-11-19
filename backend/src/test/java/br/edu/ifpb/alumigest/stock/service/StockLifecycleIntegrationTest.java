package br.edu.ifpb.alumigest.stock.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
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

    private final List<UUID> createdOrderIds = new ArrayList<>();
    private final List<UUID> createdBudgetIds = new ArrayList<>();
    private final List<UUID> createdClientIds = new ArrayList<>();
    private final List<UUID> createdMaterialIds = new ArrayList<>();
    private final List<UUID> createdGroupIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        stockMovementRepository.deleteAll();
        stockItemRepository.deleteAll();
        createdOrderIds.forEach(orderRepository::deleteById);
        createdBudgetIds.forEach(budgetRepository::deleteById);
        createdClientIds.forEach(clientRepository::deleteById);
        createdMaterialIds.forEach(materialRepository::deleteById);
        createdGroupIds.forEach(materialGroupRepository::deleteById);
        createdOrderIds.clear();
        createdBudgetIds.clear();
        createdClientIds.clear();
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
}

package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Testes de Transação Real (Commit H2): Cancelamento de OS e Reabertura de Orçamento [Issue #517]")
class OrderCancellationTransactionIntegrationTest {

  private static final String CANCEL_ENDPOINT = "/api/v1/orders/{id}/cancel";
  private static final String JSON_STATUS_PATH = "$.status";
  private static final String STATUS_CANCELLED = OrderStatus.CANCELLED.name();

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private OrderRepository orderRepository;

  @Autowired
  private BudgetRepository budgetRepository;

  @Autowired
  private ClientRepository clientRepository;

  private final List<UUID> createdOrderIds = new ArrayList<>();
  private final List<UUID> createdBudgetIds = new ArrayList<>();
  private final List<UUID> createdClientIds = new ArrayList<>();

  @AfterEach
  void tearDown() {
    createdOrderIds.forEach(orderRepository::deleteById);
    createdBudgetIds.forEach(budgetRepository::deleteById);
    createdClientIds.forEach(clientRepository::deleteById);
    createdOrderIds.clear();
    createdBudgetIds.clear();
    createdClientIds.clear();
  }

  private Client persistClient() {
    Client client = Client.builder()
        .fullName("Cliente Transação Real")
        .phone("83999991234")
        .build();
    client = clientRepository.saveAndFlush(client);
    createdClientIds.add(client.getId());
    return client;
  }

  private Budget persistBudget(Client client, BudgetStatus status) {
    Budget budget = new Budget();
    budget.setCode("ORC-TX-" + UUID.randomUUID().toString().substring(0, 8));
    budget.setClient(client);
    budget.setStatus(status);
    budget.setSubtotal(new BigDecimal("1800.00"));
    budget.setTotal(new BigDecimal("1800.00"));
    budget.setDiscountValue(BigDecimal.ZERO);
    budget = budgetRepository.saveAndFlush(budget);
    createdBudgetIds.add(budget.getId());
    return budget;
  }

  private Order persistOrder(UUID orcamentoId, String clientName) {
    Order order = Order.builder()
        .codigo("OS-TX-" + UUID.randomUUID().toString().substring(0, 8))
        .orcamentoId(orcamentoId)
        .clienteNome(clientName)
        .status(OrderStatus.WAITING_PRODUCTION)
        .canalAprovacao(ApprovalChannel.WHATSAPP)
        .dataPrevisaoEntrega(LocalDate.now(ZoneOffset.UTC).plusDays(7))
        .valorBruto(new BigDecimal("1800.00"))
        .valorLiquido(new BigDecimal("1800.00"))
        .build();
    order = orderRepository.saveAndFlush(order);
    createdOrderIds.add(order.getId());
    return order;
  }

  @Test
  @DisplayName("Deve comitar cancelamento da OS e reabertura do orçamento em transação real")
  void shouldCommitOrderCancellationAndBudgetReopenInRealTransaction() throws Exception {
    Client client = persistClient();
    Budget approvedBudget = persistBudget(client, BudgetStatus.APPROVED);
    Order order = persistOrder(approvedBudget.getId(), client.getFullName());

    OrderCancelRequest request = new OrderCancelRequest("Cancelamento com commit real no banco H2.");

    mockMvc.perform(patch(CANCEL_ENDPOINT, order.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath(JSON_STATUS_PATH).value(STATUS_CANCELLED));

    Order persistedOrder = orderRepository.findById(order.getId()).orElseThrow();
    Budget persistedBudget = budgetRepository.findById(approvedBudget.getId()).orElseThrow();

    assertThat(persistedOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    assertThat(persistedBudget.getStatus()).isEqualTo(BudgetStatus.DRAFT);
  }

  @Test
  @DisplayName("Deve comitar cancelamento sem UnexpectedRollbackException quando orçamento já estiver em DRAFT")
  void shouldCommitCancellationWithoutUnexpectedRollbackWhenBudgetAlreadyDraft() throws Exception {
    Client client = persistClient();
    Budget draftBudget = persistBudget(client, BudgetStatus.DRAFT);
    Order order = persistOrder(draftBudget.getId(), client.getFullName());

    OrderCancelRequest request = new OrderCancelRequest("Orçamento já estava DRAFT e OS deve ser cancelada.");

    mockMvc.perform(patch(CANCEL_ENDPOINT, order.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath(JSON_STATUS_PATH).value(STATUS_CANCELLED));

    assertThat(orderRepository.findById(order.getId()).orElseThrow().getStatus())
        .isEqualTo(OrderStatus.CANCELLED);
    assertThat(budgetRepository.findById(draftBudget.getId()).orElseThrow().getStatus())
        .isEqualTo(BudgetStatus.DRAFT);
  }

  @Test
  @DisplayName("Deve comitar cancelamento sem UnexpectedRollbackException quando orçamento vinculado não existir")
  void shouldCommitCancellationWithoutUnexpectedRollbackWhenLinkedBudgetDoesNotExist()
      throws Exception {
    Order orphanOrder = persistOrder(UUID.randomUUID(), "Cliente Legado");
    OrderCancelRequest request = new OrderCancelRequest("Cancelamento de ordem com orçamento órfão.");

    mockMvc.perform(patch(CANCEL_ENDPOINT, orphanOrder.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath(JSON_STATUS_PATH).value(STATUS_CANCELLED));

    assertThat(orderRepository.findById(orphanOrder.getId()).orElseThrow().getStatus())
        .isEqualTo(OrderStatus.CANCELLED);
  }
}


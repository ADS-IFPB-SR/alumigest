package br.edu.ifpb.alumigest.clients.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderSummaryDto;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientHubServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private ClientHubService clientHubService;

    private Client client;
    private UUID clientId;

    @BeforeEach
    void setUp() {
        clientId = UUID.randomUUID();
        client = Client.builder()
                .id(clientId)
                .fullName("Antônio Alfredo Figueiredo")
                .personType(PersonType.FISICA)
                .documentNumber("042.891.444-09")
                .phone("(83) 98845-2100")
                .email("antonio@exemplo.com")
                .neighborhood("Torre")
                .city("João Pessoa")
                .state("PB")
                .build();
    }

    @Test
    @DisplayName("Deve retornar dados do dashboard agregando KPIs com sucesso")
    void getClientDashboard_ShouldReturnDashboardWithAggregatedKpis() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(orderRepository.sumTotalContractedByClienteId(clientId)).thenReturn(new BigDecimal("4133.90"));
        when(orderRepository.countByClienteIdAndAtivoTrue(clientId)).thenReturn(4L);
        when(budgetRepository.countByClientId(clientId)).thenReturn(2L);

        ClientDashboardDto response = clientHubService.getClientDashboard(clientId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(clientId);
        assertThat(response.nomeCompleto()).isEqualTo("Antônio Alfredo Figueiredo");
        assertThat(response.personType()).isEqualTo(PersonType.FISICA);
        assertThat(response.totalContratado()).isEqualByComparingTo(new BigDecimal("4133.90"));
        assertThat(response.quantidadeOrdensServico()).isEqualTo(4L);
        assertThat(response.quantidadeOrcamentos()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Deve retornar KPIs zerados quando repositórios retornarem nulos")
    void getClientDashboard_ShouldHandleZeroAndNullValues() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(orderRepository.sumTotalContractedByClienteId(clientId)).thenReturn(null);
        when(orderRepository.countByClienteIdAndAtivoTrue(clientId)).thenReturn(0L);
        when(budgetRepository.countByClientId(clientId)).thenReturn(0L);

        ClientDashboardDto response = clientHubService.getClientDashboard(clientId);

        assertThat(response.totalContratado()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.quantidadeOrdensServico()).isZero();
        assertThat(response.quantidadeOrcamentos()).isZero();
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando cliente não for encontrado")
    void getClientDashboard_ShouldThrowException_WhenClientNotFound() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientHubService.getClientDashboard(clientId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente não encontrado com ID: " + clientId);
    }

    @Test
    @DisplayName("Deve retornar lista paginada de orçamentos vinculados ao cliente")
    void getClientBudgets_ShouldReturnPageOfBudgets() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

        Budget budget = new Budget();
        ReflectionTestUtils.setField(budget, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(budget, "code", "ORC-2026-0001");
        ReflectionTestUtils.setField(budget, "client", client);
        ReflectionTestUtils.setField(budget, "total", new BigDecimal("2067.88"));
        ReflectionTestUtils.setField(budget, "status", BudgetStatus.APPROVED);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        ReflectionTestUtils.setField(budget, "createdAt", now);
        ReflectionTestUtils.setField(budget, "validUntil", now.plusDays(15));

        Pageable pageable = PageRequest.of(0, 10);
        Page<Budget> budgetPage = new PageImpl<>(List.of(budget), pageable, 1);

        when(budgetRepository.findByClientId(eq(clientId), any(Pageable.class))).thenReturn(budgetPage);

        PageResponse<ClientBudgetSummaryDto> response = clientHubService.getClientBudgets(clientId, pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        ClientBudgetSummaryDto item = response.content().get(0);
        assertThat(item.codigo()).isEqualTo("ORC-2026-0001");
        assertThat(item.valorTotal()).isEqualByComparingTo(new BigDecimal("2067.88"));
        assertThat(item.status()).isEqualTo(BudgetStatus.APPROVED);
        assertThat(item.statusDescricao()).isEqualTo(BudgetStatus.APPROVED.getDescricao());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando cliente não for encontrado para orçamentos")
    void getClientBudgets_ShouldThrowException_WhenClientNotFound() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 10);
        assertThatThrownBy(() -> clientHubService.getClientBudgets(clientId, pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente não encontrado com ID: " + clientId);
    }

    @Test
    @DisplayName("Deve retornar lista paginada de Ordens de Serviço do cliente com dados para etiquetas")
    void getClientOrders_ShouldReturnPageOfOrders() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

        UUID orderId = UUID.randomUUID();
        UUID orcamentoId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .codigo("OS-2026-0001")
                .orcamentoId(orcamentoId)
                .cliente(client)
                .clienteNome(client.getFullName())
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .valorLiquido(new BigDecimal("3500.00"))
                .dataAprovacao(LocalDate.now())
                .dataPrevisaoEntrega(LocalDate.now().plusDays(10))
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(order), pageable, 1);

        when(orderRepository.findByClienteIdAndAtivoTrue(eq(clientId), any(Pageable.class))).thenReturn(orderPage);

        PageResponse<ClientOrderSummaryDto> response = clientHubService.getClientOrders(clientId, pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        ClientOrderSummaryDto item = response.content().get(0);
        assertThat(item.id()).isEqualTo(orderId);
        assertThat(item.codigo()).isEqualTo("OS-2026-0001");
        assertThat(item.orcamentoId()).isEqualTo(orcamentoId);
        assertThat(item.status()).isEqualTo(OrderStatus.WAITING_PRODUCTION);
        assertThat(item.statusDescricao()).isEqualTo(OrderStatus.WAITING_PRODUCTION.getDescricao());
        assertThat(item.canalAprovacao()).isEqualTo(ApprovalChannel.WHATSAPP);
        assertThat(item.valorLiquido()).isEqualByComparingTo(new BigDecimal("3500.00"));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando cliente não for encontrado para ordens")
    void getClientOrders_ShouldThrowException_WhenClientNotFound() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 10);
        assertThatThrownBy(() -> clientHubService.getClientOrders(clientId, pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente não encontrado com ID: " + clientId);
    }
}

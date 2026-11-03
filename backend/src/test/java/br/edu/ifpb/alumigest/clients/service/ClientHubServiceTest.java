package br.edu.ifpb.alumigest.clients.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
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

        ClientDashboardDto result = clientHubService.getClientDashboard(clientId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(clientId);
        assertThat(result.nomeCompleto()).isEqualTo("Antônio Alfredo Figueiredo");
        assertThat(result.personType()).isEqualTo(PersonType.FISICA);
        assertThat(result.documento()).isEqualTo("042.891.444-09");
        assertThat(result.telefone()).isEqualTo("(83) 98845-2100");
        assertThat(result.email()).isEqualTo("antonio@exemplo.com");
        assertThat(result.bairro()).isEqualTo("Torre");
        assertThat(result.cidade()).isEqualTo("João Pessoa");
        assertThat(result.uf()).isEqualTo("PB");
        assertThat(result.totalContratado()).isEqualByComparingTo(new BigDecimal("4133.90"));
        assertThat(result.quantidadeOrdensServico()).isEqualTo(4L);
        assertThat(result.quantidadeOrcamentos()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Deve retornar KPIs zerados quando cliente não tiver O.S. ou orçamentos")
    void getClientDashboard_ShouldReturnZeroKpis_WhenNoOrdersOrBudgets() {
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(orderRepository.sumTotalContractedByClienteId(clientId)).thenReturn(null);
        when(orderRepository.countByClienteIdAndAtivoTrue(clientId)).thenReturn(0L);
        when(budgetRepository.countByClientId(clientId)).thenReturn(0L);

        ClientDashboardDto result = clientHubService.getClientDashboard(clientId);

        assertThat(result).isNotNull();
        assertThat(result.totalContratado()).isEqualTo(BigDecimal.ZERO);
        assertThat(result.quantidadeOrdensServico()).isZero();
        assertThat(result.quantidadeOrcamentos()).isZero();
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando cliente não for encontrado para dashboard")
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
}

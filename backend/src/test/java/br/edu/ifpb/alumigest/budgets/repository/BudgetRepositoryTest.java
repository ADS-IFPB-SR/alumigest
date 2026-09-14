package br.edu.ifpb.alumigest.budgets.repository;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BudgetRepositoryTest {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ClientRepository clientRepository;

    private Client client1;
    private Client client2;

    @BeforeEach
    void setUp() {
        client1 = new Client();
        client1.setFullName("Carlos Eduardo Silva");
        client1.setPersonType(PersonType.FISICA);
        client1.setDocumentNumber("11122233344");
        client1.setPhone("83988881111");
        client1.setEmail("carlos@example.com");
        client1 = clientRepository.save(client1);

        client2 = new Client();
        client2.setFullName("Alumínios e Vidros Nordeste LTDA");
        client2.setPersonType(PersonType.JURIDICA);
        client2.setDocumentNumber("12345678000199");
        client2.setPhone("83977772222");
        client2.setEmail("contato@nordeste.com");
        client2 = clientRepository.save(client2);
    }

    private Budget createBudget(String code, Client client, BudgetStatus status, BigDecimal total) {
        Budget budget = new Budget();
        budget.setCode(code);
        budget.setClient(client);
        budget.setStatus(status);
        budget.setSubtotal(total);
        budget.setTotal(total);
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        return budgetRepository.save(budget);
    }

    @Test
    @DisplayName("[US-09.9] Deve verificar se o orçamento existe pelo código (existsByCode)")
    void shouldCheckIfBudgetExistsByCode() {
        createBudget("ORC-2026-001", client1, BudgetStatus.DRAFT, new BigDecimal("1500.00"));

        boolean exists = budgetRepository.existsByCode("ORC-2026-001");
        boolean notExists = budgetRepository.existsByCode("ORC-2026-999");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("[US-09.9] Deve buscar orçamento pelo código (findByCode)")
    void shouldFindBudgetByCode() {
        Budget saved = createBudget("ORC-2026-002", client1, BudgetStatus.SENT, new BigDecimal("2500.00"));

        Optional<Budget> found = budgetRepository.findByCode("ORC-2026-002");
        Optional<Budget> notFound = budgetRepository.findByCode("ORC-INEXISTENTE");

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getCode()).isEqualTo("ORC-2026-002");
        assertThat(found.get().getStatus()).isEqualTo(BudgetStatus.SENT);
        assertThat(notFound).isEmpty();
    }

    @Test
    @DisplayName("[US-09.9] Deve buscar o último código com determinado prefixo (findTopByCodeStartingWithOrderByCodeDesc)")
    void shouldFindTopByCodeStartingWithOrderByCodeDesc() {
        createBudget("ORC-2026-001", client1, BudgetStatus.DRAFT, new BigDecimal("1000.00"));
        createBudget("ORC-2026-005", client1, BudgetStatus.DRAFT, new BigDecimal("2000.00"));
        createBudget("ORC-2026-003", client2, BudgetStatus.SENT, new BigDecimal("3000.00"));
        createBudget("ORC-2025-999", client2, BudgetStatus.APPROVED, new BigDecimal("5000.00"));

        Optional<Budget> top2026 = budgetRepository.findTopByCodeStartingWithOrderByCodeDesc("ORC-2026-");
        Optional<Budget> top2027 = budgetRepository.findTopByCodeStartingWithOrderByCodeDesc("ORC-2027-");

        assertThat(top2026).isPresent();
        assertThat(top2026.get().getCode()).isEqualTo("ORC-2026-005");
        assertThat(top2027).isEmpty();
    }

    @Test
    @DisplayName("[US-09.9] Deve pesquisar orçamentos com filtro de status e busca textual por código")
    void shouldSearchBudgetsByCodeAndStatus() {
        createBudget("ORC-2026-010", client1, BudgetStatus.DRAFT, new BigDecimal("1200.00"));
        createBudget("ORC-2026-020", client1, BudgetStatus.SENT, new BigDecimal("2200.00"));
        createBudget("ORC-2026-030", client2, BudgetStatus.APPROVED, new BigDecimal("3200.00"));

        // Busca textual por código com filtro de status DRAFT
        Page<Budget> pageDraft = budgetRepository.searchBudgets("010", BudgetStatus.DRAFT, PageRequest.of(0, 10));
        assertThat(pageDraft.getContent()).hasSize(1);
        assertThat(pageDraft.getContent().get(0).getCode()).isEqualTo("ORC-2026-010");

        // Busca textual por código sem bater status
        Page<Budget> pageMismatch = budgetRepository.searchBudgets("010", BudgetStatus.SENT, PageRequest.of(0, 10));
        assertThat(pageMismatch.getContent()).isEmpty();
    }

    @Test
    @DisplayName("[US-09.9] Deve pesquisar orçamentos por nome do cliente (case-insensitive)")
    void shouldSearchBudgetsByClientName() {
        createBudget("ORC-2026-011", client1, BudgetStatus.DRAFT, new BigDecimal("1000.00"));
        createBudget("ORC-2026-012", client2, BudgetStatus.SENT, new BigDecimal("2000.00"));

        // Busca por parte do nome "carlos"
        Page<Budget> resultCarlos = budgetRepository.searchBudgets("carlos", null, PageRequest.of(0, 10));
        assertThat(resultCarlos.getContent()).hasSize(1);
        assertThat(resultCarlos.getContent().get(0).getCode()).isEqualTo("ORC-2026-011");

        // Busca por parte da razão social "nordeste"
        Page<Budget> resultNordeste = budgetRepository.searchBudgets("NORDESTE", null, PageRequest.of(0, 10));
        assertThat(resultNordeste.getContent()).hasSize(1);
        assertThat(resultNordeste.getContent().get(0).getCode()).isEqualTo("ORC-2026-012");
    }

    @Test
    @DisplayName("[US-09.9] Deve retornar todos os orçamentos paginados quando busca for nula ou vazia")
    void shouldReturnAllBudgetsWhenSearchIsEmpty() {
        createBudget("ORC-2026-001", client1, BudgetStatus.DRAFT, new BigDecimal("1000.00"));
        createBudget("ORC-2026-002", client2, BudgetStatus.SENT, new BigDecimal("2000.00"));

        Page<Budget> pageNull = budgetRepository.searchBudgets(null, null, PageRequest.of(0, 10));
        Page<Budget> pageEmpty = budgetRepository.searchBudgets("", null, PageRequest.of(0, 10));

        assertThat(pageNull.getTotalElements()).isGreaterThanOrEqualTo(2);
        assertThat(pageEmpty.getTotalElements()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("[US-09.9] Deve buscar orçamentos por ID do cliente e por status")
    void shouldFindBudgetsByClientIdAndByStatus() {
        createBudget("ORC-2026-101", client1, BudgetStatus.DRAFT, new BigDecimal("1000.00"));
        createBudget("ORC-2026-102", client1, BudgetStatus.SENT, new BigDecimal("2000.00"));
        createBudget("ORC-2026-103", client2, BudgetStatus.DRAFT, new BigDecimal("3000.00"));

        Page<Budget> client1Budgets = budgetRepository.findByClientId(client1.getId(), PageRequest.of(0, 10));
        Page<Budget> draftBudgets = budgetRepository.findByStatus(BudgetStatus.DRAFT, PageRequest.of(0, 10));

        assertThat(client1Budgets.getContent()).hasSize(2);
        assertThat(draftBudgets.getContent()).hasSize(2);
    }
}

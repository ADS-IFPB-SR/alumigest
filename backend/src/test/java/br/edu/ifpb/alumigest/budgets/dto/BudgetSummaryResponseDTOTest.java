package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.mapper.BudgetMapper;
import br.edu.ifpb.alumigest.clients.domain.Client;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes de BudgetSummaryResponseDTO e Regras de Expiração")
class BudgetSummaryResponseDTOTest {

    private ObjectMapper objectMapper;
    private BudgetMapper budgetMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        budgetMapper = Mappers.getMapper(BudgetMapper.class);
    }

    @Nested
    @DisplayName("Serialização JSON do DTO")
    class JsonSerializationTests {

        @Test
        @DisplayName("Deve serializar campos do DTO e incluir aliases itemCount e isExpired")
        void shouldSerializeDtoWithAliases() throws Exception {
            UUID id = UUID.randomUUID();
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            BudgetSummaryResponseDTO dto = new BudgetSummaryResponseDTO(
                    id,
                    "ORC-2026-001",
                    "Cliente Exemplo",
                    3,
                    BigDecimal.valueOf(2500.50),
                    BudgetStatus.DRAFT,
                    now.plusDays(10),
                    now,
                    false
            );

            String json = objectMapper.writeValueAsString(dto);

            assertThat(json).contains("\"code\":\"ORC-2026-001\"");
            assertThat(json).contains("\"clientName\":\"Cliente Exemplo\"");
            assertThat(json).contains("\"totalItems\":3");
            assertThat(json).contains("\"itemCount\":3");
            assertThat(json).contains("\"total\":2500.5");
            assertThat(json).contains("\"status\":\"DRAFT\"");
            assertThat(json).contains("\"expired\":false");
            assertThat(json).contains("\"isExpired\":false");
        }
    }

    @Nested
    @DisplayName("Regras de Negócio de Expiração no Domínio (Budget.isExpired)")
    class ExpirationDomainRuleTests {

        @Test
        @DisplayName("Deve retornar true se status for EXPIRED")
        void shouldBeExpiredWhenStatusIsExpired() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.EXPIRED);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(5));

            assertThat(budget.isExpired()).isTrue();
        }

        @Test
        @DisplayName("Deve retornar true se status for DRAFT e validade estiver no passado")
        void shouldBeExpiredWhenDraftAndPastValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));

            assertThat(budget.isExpired()).isTrue();
        }

        @Test
        @DisplayName("Deve retornar false se status for DRAFT e validade estiver no futuro")
        void shouldNotBeExpiredWhenDraftAndFutureValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(5));

            assertThat(budget.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Deve retornar true se status for SENT e validade estiver no passado")
        void shouldBeExpiredWhenSentAndPastValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.SENT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusHours(2));

            assertThat(budget.isExpired()).isTrue();
        }

        @Test
        @DisplayName("Deve retornar false se status for SENT e validade estiver no futuro")
        void shouldNotBeExpiredWhenSentAndFutureValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.SENT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(10));

            assertThat(budget.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Não deve expirar se já estiver APROVADO (APPROVED), mesmo após a data de validade")
        void shouldNotBeExpiredWhenApprovedEvenIfPastValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.APPROVED);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(20));

            assertThat(budget.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Não deve expirar se já estiver RECUSADO (REJECTED), mesmo após a data de validade")
        void shouldNotBeExpiredWhenRejectedEvenIfPastValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.REJECTED);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(10));

            assertThat(budget.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Não deve expirar se estiver CANCELADO (CANCELLED), mesmo após a data de validade")
        void shouldNotBeExpiredWhenCancelledEvenIfPastValidity() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.CANCELLED);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(5));

            assertThat(budget.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Deve retornar false se data de validade for nula")
        void shouldNotBeExpiredWhenValidUntilIsNull() {
            Budget budget = new Budget();
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(null);

            assertThat(budget.isExpired()).isFalse();
        }
    }

    @Nested
    @DisplayName("Mapeamento com BudgetMapper")
    class MapperTests {

        @Test
        @DisplayName("Deve mapear Budget para BudgetSummaryResponseDTO com contagem de itens e status de expiração")
        void shouldMapBudgetToBudgetSummaryResponseDTO() {
            Client client = new Client();
            client.setId(UUID.randomUUID());
            client.setFullName("Maria Oliveira");

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-0099");
            budget.setClient(client);
            budget.setTotal(BigDecimal.valueOf(3200.00));
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));

            BudgetItem item1 = new BudgetItem();
            BudgetItem item2 = new BudgetItem();
            budget.addItem(item1);
            budget.addItem(item2);

            BudgetSummaryResponseDTO result = budgetMapper.toSummaryResponseDTO(budget);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(budget.getId());
            assertThat(result.code()).isEqualTo("ORC-2026-0099");
            assertThat(result.clientName()).isEqualTo("Maria Oliveira");
            assertThat(result.total()).isEqualByComparingTo(BigDecimal.valueOf(3200.00));
            assertThat(result.totalItems()).isEqualTo(2);
            assertThat(result.getItemCount()).isEqualTo(2);
            assertThat(result.expired()).isTrue();
            assertThat(result.getIsExpired()).isTrue();
        }

        @Test
        @DisplayName("Deve mapear corretamente orçamento sem itens (totalItems = 0)")
        void shouldMapBudgetWithEmptyItems() {
            Client client = new Client();
            client.setFullName("Carlos Santos");

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-0100");
            budget.setClient(client);
            budget.setTotal(BigDecimal.ZERO);
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(10));

            BudgetSummaryResponseDTO result = budgetMapper.toSummaryResponseDTO(budget);

            assertThat(result).isNotNull();
            assertThat(result.totalItems()).isEqualTo(0);
            assertThat(result.getItemCount()).isEqualTo(0);
            assertThat(result.expired()).isFalse();
            assertThat(result.getIsExpired()).isFalse();
        }
    }
}

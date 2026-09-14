package br.edu.ifpb.alumigest.budgets.mapper;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.budgets.dto.*;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.clients.domain.Client;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes do Mapper MapStruct BudgetMapper")
class BudgetMapperTest {

    private final BudgetMapper mapper = Mappers.getMapper(BudgetMapper.class);

    @Nested
    @DisplayName("Mapeamento de Entidade para BudgetResponseDTO")
    class ToResponseDTOTests {

        @Test
        @DisplayName("Deve mapear todos os atributos comerciais e labels descritivas corretamente")
        void shouldMapCommercialAttributesAndLabels() {
            Client client = new Client();
            client.setId(UUID.randomUUID());
            client.setFullName("João da Silva");

            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime validUntil = now.plusDays(15);

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-0001");
            budget.setClient(client);
            budget.setSubtotal(new BigDecimal("1000.00"));
            budget.setDiscountPercent(new BigDecimal("10.00"));
            budget.setDiscountValue(new BigDecimal("100.00"));
            budget.setTotal(new BigDecimal("900.00"));
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
            budget.setPaymentNotes("Entrada no ato do pedido e restante na instalação.");
            budget.setNotes("Instalação no 3º andar.");
            budget.setValidUntil(validUntil);
            budget.setCreatedAt(now);
            budget.setUpdatedAt(now);

            BudgetResponseDTO dto = mapper.toResponseDTO(budget);

            assertThat(dto).isNotNull();
            assertThat(dto.id()).isEqualTo(budget.getId());
            assertThat(dto.code()).isEqualTo("ORC-2026-0001");
            assertThat(dto.clientId()).isEqualTo(client.getId());
            assertThat(dto.clientName()).isEqualTo("João da Silva");
            assertThat(dto.subtotal()).isEqualByComparingTo("1000.00");
            assertThat(dto.discountPercent()).isEqualByComparingTo("10.00");
            assertThat(dto.discountValue()).isEqualByComparingTo("100.00");
            assertThat(dto.total()).isEqualByComparingTo("900.00");
            assertThat(dto.status()).isEqualTo(BudgetStatus.DRAFT);
            assertThat(dto.statusLabel()).isEqualTo("Rascunho");
            assertThat(dto.paymentCondition()).isEqualTo(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
            assertThat(dto.paymentConditionLabel()).isEqualTo("50% Entrada + 50% na Entrega");
            assertThat(dto.paymentNotes()).isEqualTo("Entrada no ato do pedido e restante na instalação.");
            assertThat(dto.notes()).isEqualTo("Instalação no 3º andar.");
            assertThat(dto.validUntil()).isEqualTo(validUntil);
            assertThat(dto.expired()).isFalse();
        }

        @Test
        @DisplayName("Deve manter labels como nulo sem lançar NPE quando paymentCondition e status forem nulos")
        void shouldHandleNullEnumsGracefully() {
            Budget budget = new Budget();
            budget.setPaymentCondition(null);
            budget.setStatus(null);

            BudgetResponseDTO dto = mapper.toResponseDTO(budget);

            assertThat(dto).isNotNull();
            assertThat(dto.paymentCondition()).isNull();
            assertThat(dto.paymentConditionLabel()).isNull();
            assertThat(dto.status()).isNull();
            assertThat(dto.statusLabel()).isNull();
        }

        @Test
        @DisplayName("Deve refletir expiração através da regra de domínio de Budget.isExpired()")
        void shouldReflectDomainExpirationRule() {
            // Caso 1: Rascunho com validade vencida -> expired = true
            Budget draftExpired = new Budget();
            draftExpired.setStatus(BudgetStatus.DRAFT);
            draftExpired.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(2));
            BudgetResponseDTO dtoDraft = mapper.toResponseDTO(draftExpired);
            assertThat(dtoDraft.expired()).isTrue();

            // Caso 2: Aprovado com validade no passado -> NÃO deve constar como expirado
            Budget approvedPastValidity = new Budget();
            approvedPastValidity.setStatus(BudgetStatus.APPROVED);
            approvedPastValidity.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(20));
            BudgetResponseDTO dtoApproved = mapper.toResponseDTO(approvedPastValidity);
            assertThat(dtoApproved.expired()).isFalse();

            // Caso 3: Status explícito EXPIRED -> expired = true
            Budget explicitExpired = new Budget();
            explicitExpired.setStatus(BudgetStatus.EXPIRED);
            BudgetResponseDTO dtoExplicit = mapper.toResponseDTO(explicitExpired);
            assertThat(dtoExplicit.expired()).isTrue();
        }
    }

    @Nested
    @DisplayName("Mapeamento de Entidade para BudgetSummaryResponseDTO")
    class ToSummaryResponseDTOTests {

        @Test
        @DisplayName("Deve mapear resumo, contagem de itens e expiração corretamente")
        void shouldMapSummaryWithItemCountAndExpiration() {
            Client client = new Client();
            client.setId(UUID.randomUUID());
            client.setFullName("Maria Souza");

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-0002");
            budget.setClient(client);
            budget.setTotal(new BigDecimal("1500.00"));
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(5));

            BudgetItem item1 = new BudgetItem();
            budget.addItem(item1);

            BudgetSummaryResponseDTO summary = mapper.toSummaryResponseDTO(budget);

            assertThat(summary).isNotNull();
            assertThat(summary.id()).isEqualTo(budget.getId());
            assertThat(summary.code()).isEqualTo("ORC-2026-0002");
            assertThat(summary.clientName()).isEqualTo("Maria Souza");
            assertThat(summary.totalItems()).isEqualTo(1);
            assertThat(summary.expired()).isFalse();
        }

        @Test
        @DisplayName("Deve atribuir totalItems = 0 quando lista de itens for nula")
        void shouldHandleNullItemsListInSummary() {
            Budget budget = new Budget();
            budget.setItems(null);

            BudgetSummaryResponseDTO summary = mapper.toSummaryResponseDTO(budget);

            assertThat(summary).isNotNull();
            assertThat(summary.totalItems()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Mapeamento de Requests para Entidade")
    class ToEntityTests {

        @Test
        @DisplayName("Deve mapear BudgetCreateRequest para Budget vinculando clientId e observações")
        void shouldMapBudgetCreateRequestToEntity() {
            UUID clientId = UUID.randomUUID();
            BudgetCreateRequest request = new BudgetCreateRequest(clientId, "Observação de teste");

            Budget budget = mapper.toEntity(request);

            assertThat(budget).isNotNull();
            assertThat(budget.getClient()).isNotNull();
            assertThat(budget.getClient().getId()).isEqualTo(clientId);
            assertThat(budget.getNotes()).isEqualTo("Observação de teste");
            assertThat(budget.getDiscountPercent()).isEqualTo(BigDecimal.ZERO);
            assertThat(budget.getPaymentCondition()).isNull();
        }

        @Test
        @DisplayName("Deve mapear BudgetRequestDTO para Budget vinculando clientId e campos comerciais")
        void shouldMapBudgetRequestDTOToEntity() {
            UUID clientId = UUID.randomUUID();
            OffsetDateTime validUntil = OffsetDateTime.now(ZoneOffset.UTC).plusDays(10);
            BudgetRequestDTO request = new BudgetRequestDTO(
                    clientId,
                    new BigDecimal("5.00"),
                    "Notas gerais",
                    validUntil,
                    List.of()
            );

            Budget budget = mapper.toEntity(request);

            assertThat(budget).isNotNull();
            assertThat(budget.getClient()).isNotNull();
            assertThat(budget.getClient().getId()).isEqualTo(clientId);
            assertThat(budget.getDiscountPercent()).isEqualByComparingTo("5.00");
            assertThat(budget.getNotes()).isEqualTo("Notas gerais");
            assertThat(budget.getValidUntil()).isEqualTo(validUntil);
            assertThat(budget.getPaymentCondition()).isNull();
        }

        @Test
        @DisplayName("Deve mapear BudgetItemRequestDTO e BudgetItemOptionRequestDTO para entidades")
        void shouldMapItemAndOptionRequests() {
            UUID productId = UUID.randomUUID();
            BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(
                    productId,
                    new BigDecimal("1200.00"),
                    new BigDecimal("2100.00"),
                    2,
                    new BigDecimal("150.00"),
                    "PORTA_CORRER_2F",
                    "{}",
                    "{}",
                    "{}",
                    "Item notas",
                    List.of()
            );

            BudgetItem item = mapper.toEntity(itemRequest);
            assertThat(item).isNotNull();
            assertThat(item.getProduct()).isNotNull();
            assertThat(item.getProduct().getId()).isEqualTo(productId);
            assertThat(item.getQuantity()).isEqualTo(2);

            UUID materialId = UUID.randomUUID();
            BudgetItemOptionRequestDTO optionRequest = new BudgetItemOptionRequestDTO(
                    materialId,
                    MaterialCategoryType.GLASS,
                    new BigDecimal("2.50"),
                    "Vidro Temperado",
                    "#000000"
            );

            BudgetItemOption option = mapper.toEntity(optionRequest);
            assertThat(option).isNotNull();
            assertThat(option.getMaterial()).isNotNull();
            assertThat(option.getMaterial().getId()).isEqualTo(materialId);
        }
    }

    @Nested
    @DisplayName("Mapeamento de Itens e Opções para DTO")
    class ItemToResponseTests {

        @Test
        @DisplayName("Deve mapear BudgetItem para BudgetItemResponseDTO")
        void shouldMapBudgetItemToResponse() {
            Product product = new Product();
            product.setId(UUID.randomUUID());

            BudgetItem item = new BudgetItem();
            item.setId(UUID.randomUUID());
            item.setProduct(product);
            item.setProductName("Janela 4 Folhas");
            item.setQuantity(3);
            item.setSubtotal(new BigDecimal("750.00"));

            BudgetItemResponseDTO dto = mapper.toResponseDTO(item);

            assertThat(dto).isNotNull();
            assertThat(dto.id()).isEqualTo(item.getId());
            assertThat(dto.productId()).isEqualTo(product.getId());
            assertThat(dto.productName()).isEqualTo("Janela 4 Folhas");
            assertThat(dto.quantity()).isEqualTo(3);
            assertThat(dto.subtotal()).isEqualByComparingTo("750.00");
        }

        @Test
        @DisplayName("Deve mapear BudgetItemOption para BudgetItemOptionResponseDTO")
        void shouldMapBudgetItemOptionToResponse() {
            Material material = new Material();
            material.setId(UUID.randomUUID());

            BudgetItemOption option = new BudgetItemOption();
            option.setId(UUID.randomUUID());
            option.setMaterial(material);
            option.setMaterialName("Vidro Temperado 8mm");
            option.setUnitMeasure("M2");
            option.setCategoryType(MaterialCategoryType.GLASS);
            option.setQuantity(new BigDecimal("2.50"));
            option.setUnitPrice(new BigDecimal("120.00"));
            option.setTotalPrice(new BigDecimal("300.00"));

            BudgetItemOptionResponseDTO dto = mapper.toResponseDTO(option);

            assertThat(dto).isNotNull();
            assertThat(dto.id()).isEqualTo(option.getId());
            assertThat(dto.materialId()).isEqualTo(material.getId());
            assertThat(dto.materialName()).isEqualTo("Vidro Temperado 8mm");
            assertThat(dto.unitMeasure()).isEqualTo("M2");
            assertThat(dto.categoryType()).isEqualTo(MaterialCategoryType.GLASS);
            assertThat(dto.unitPrice()).isEqualByComparingTo("120.00");
            assertThat(dto.totalPrice()).isEqualByComparingTo("300.00");
        }
    }
}

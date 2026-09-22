package br.edu.ifpb.alumigest.budgets.controller;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.DiscountRequest;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para os novos endpoints do BudgetController [US-09.27].
 * Valida a camada HTTP (MockMvc) integrada com banco H2 em memória.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BudgetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    private Client savedClient;
    private Product savedProduct;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();

        // 1. Cliente
        Client client = new Client();
        client.setFullName("Cliente Integração US-09");
        client.setDocumentNumber("12345678909");
        client.setEmail("integracao.us09@teste.com");
        client.setPhone("83999998888");
        savedClient = clientRepository.save(client);

        // 2. Grupo de Materiais
        if (materialGroupRepository.findByCode("GRP-INT").isEmpty()) {
            MaterialGroup group = new MaterialGroup();
            group.setCode("GRP-INT");
            group.setName("Grupo Integração");
            group.setCalculationType(CalculationType.LINEAR_METER);
            materialGroupRepository.save(group);
        }

        // 3. Produto (Esquadria)
        Product product = new Product();
        product.setName("Janela Correr 2F Teste");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_2F);
        product.setActive(true);
        savedProduct = productRepository.save(product);
    }

    /**
     * Cria e persiste um orçamento DRAFT com 1 item e subtotal R$ 500,00.
     */
    private Budget createDraftBudgetWithItem() {
        Budget budget = new Budget();
        budget.setCode("ORC-INT-" + UUID.randomUUID().toString().substring(0, 8));
        budget.setClient(savedClient);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setNotes("Orçamento DRAFT para teste de desconto");
        budget.setSubtotal(new BigDecimal("500.00"));
        budget.setTotal(new BigDecimal("500.00"));
        budget.setDiscountPercent(BigDecimal.ZERO);
        budget.setDiscountValue(BigDecimal.ZERO);
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));

        BudgetItem item = new BudgetItem();
        item.setProduct(savedProduct);
        item.setProductName(savedProduct.getName());
        item.setTemplateType(savedProduct.getTemplateType().name());
        item.setWidthMm(new BigDecimal("1200.00"));
        item.setHeightMm(new BigDecimal("1000.00"));
        item.setQuantity(1);
        item.setLaborCost(new BigDecimal("100.00"));
        item.setSubtotal(new BigDecimal("500.00"));

        budget.addItem(item);
        return budgetRepository.save(budget);
    }

    /**
     * Cria e persiste um orçamento DRAFT vazio (sem itens).
     */
    private Budget createEmptyDraftBudget() {
        Budget budget = new Budget();
        budget.setCode("ORC-EMPTY-" + UUID.randomUUID().toString().substring(0, 8));
        budget.setClient(savedClient);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setSubtotal(BigDecimal.ZERO);
        budget.setTotal(BigDecimal.ZERO);
        budget.setDiscountPercent(BigDecimal.ZERO);
        budget.setDiscountValue(BigDecimal.ZERO);
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        return budgetRepository.save(budget);
    }

    /**
     * Cria e persiste um orçamento no status APPROVED (imutável).
     */
    private Budget createApprovedBudgetWithItem() {
        Budget budget = createDraftBudgetWithItem();
        budget.setStatus(BudgetStatus.APPROVED);
        return budgetRepository.save(budget);
    }

    // =========================================================================
    // 1. TESTES DO ENDPOINT PUT /api/budgets/{id}/discount
    // =========================================================================

    @Nested
    @DisplayName("PUT /api/budgets/{id}/discount — Aplicação de Desconto e Condições Comerciais")
    class DiscountEndpointTests {

        @Test
        @DisplayName("Deve aplicar desconto percentual válido e retornar 200 OK com valores recalculados")
        void shouldApplyPercentDiscountSuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();
            LocalDate futureDate = LocalDate.now(ZoneOffset.UTC).plusDays(20);

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("10.00"),
                    PaymentCondition.A_VISTA_PIX,
                    "Pagamento via PIX com 10% de desconto",
                    futureDate
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(budget.getId().toString()))
                    .andExpect(jsonPath("$.discountPercent").value(10.00))
                    .andExpect(jsonPath("$.discountValue").value(50.00))
                    .andExpect(jsonPath("$.total").value(450.00))
                    .andExpect(jsonPath("$.paymentCondition").value("A_VISTA_PIX"))
                    .andExpect(jsonPath("$.paymentNotes").value("Pagamento via PIX com 10% de desconto"));

            // Confirma persistência no banco
            Budget updated = budgetRepository.findById(budget.getId()).orElseThrow();
            assertThat(updated.getDiscountPercent()).isEqualByComparingTo("10.00");
            assertThat(updated.getDiscountValue()).isEqualByComparingTo("50.00");
            assertThat(updated.getTotal()).isEqualByComparingTo("450.00");
            assertThat(updated.getPaymentCondition()).isEqualTo(PaymentCondition.A_VISTA_PIX);
        }

        @Test
        @DisplayName("Deve aplicar desconto em valor fixo válido e retornar 200 OK com percentual equivalente")
        void shouldApplyFixedValueDiscountSuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.VALOR_FIXO,
                    new BigDecimal("75.00"),
                    PaymentCondition.ENTRADA_50_SALDO_ENTREGA,
                    "Desconto fixo de 75 reais",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(budget.getId().toString()))
                    .andExpect(jsonPath("$.discountValue").value(75.00))
                    .andExpect(jsonPath("$.discountPercent").value(15.00)) // 75 de 500 = 15%
                    .andExpect(jsonPath("$.total").value(425.00))
                    .andExpect(jsonPath("$.paymentCondition").value("ENTRADA_50_SALDO_ENTREGA"));

            Budget updated = budgetRepository.findById(budget.getId()).orElseThrow();
            assertThat(updated.getDiscountValue()).isEqualByComparingTo("75.00");
            assertThat(updated.getDiscountPercent()).isEqualByComparingTo("15.00");
            assertThat(updated.getTotal()).isEqualByComparingTo("425.00");
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity quando desconto fixo for superior ao subtotal")
        void shouldReturn422WhenFixedDiscountExceedsSubtotal() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.VALOR_FIXO,
                    new BigDecimal("999.00"), // Subtotal é 500.00
                    PaymentCondition.CARTAO_12X,
                    "Desconto abusivo",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.message", containsString("não pode ser superior ao subtotal")));
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity quando desconto percentual for superior a 100%")
        void shouldReturn422WhenPercentDiscountExceeds100() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("150.00"),
                    PaymentCondition.A_COMBINAR,
                    "150% de desconto",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.message", containsString("não pode ser superior a 100%")));
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity ao aplicar desconto em orçamento sem itens")
        void shouldReturn422WhenApplyingDiscountToEmptyBudget() throws Exception {
            Budget emptyBudget = createEmptyDraftBudget();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("10.00"),
                    PaymentCondition.A_VISTA_PIX,
                    "Tentativa em orçamento vazio",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", emptyBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.message", containsString("deve possuir itens e subtotal maior que zero")));
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity ao tentar aplicar desconto em orçamento imutável (APPROVED)")
        void shouldReturn422WhenBudgetIsNotDraft() throws Exception {
            Budget approvedBudget = createApprovedBudgetWithItem();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("5.00"),
                    PaymentCondition.A_VISTA_PIX,
                    "Orçamento já aprovado",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", approvedBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity());
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request quando payload violar bean validation (campos nulos/negativos)")
        void shouldReturn400WhenPayloadIsInvalid() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            // JSON sem tipoDesconto e com valor negativo
            String invalidJson = """
                    {
                      "valor": -10.0,
                      "condicaoPagamento": null
                    }
                    """;

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors", notNullValue()))
                    .andExpect(jsonPath("$.validationErrors[*].field", hasItem("valor")))
                    .andExpect(jsonPath("$.validationErrors[*].message", hasItem("Valor do desconto não pode ser negativo")));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request quando dataValidade for no passado")
        void shouldReturn400WhenValidUntilIsInThePast() throws Exception {
            Budget budget = createDraftBudgetWithItem();
            LocalDate pastDate = LocalDate.now(ZoneOffset.UTC).minusDays(2);

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("10.00"),
                    PaymentCondition.A_VISTA_PIX,
                    "Validade retroativa",
                    pastDate
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found ao tentar aplicar desconto em ID inexistente")
        void shouldReturn404WhenBudgetNotFound() throws Exception {
            UUID nonexistentId = UUID.randomUUID();

            DiscountRequest request = new DiscountRequest(
                    DiscountType.PERCENTUAL,
                    new BigDecimal("10.00"),
                    PaymentCondition.A_VISTA_PIX,
                    "Orçamento fantasma",
                    null
            );

            mockMvc.perform(put("/api/budgets/{id}/discount", nonexistentId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // 2. TESTES DO ENDPOINT POST /api/budgets/{id}/items
    // =========================================================================

    @Nested
    @DisplayName("POST /api/budgets/{id}/items — Adição Incremental de Item ao Orçamento")
    class AddItemEndpointTests {

        @Test
        @DisplayName("Deve adicionar item com sucesso e retornar 201 Created com Header Location")
        void shouldAddItemSuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();
            int initialItemsCount = budget.getItems().size();

            BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                    savedProduct.getId(),
                    new BigDecimal("1500.00"),
                    new BigDecimal("1200.00"),
                    2,
                    new BigDecimal("80.00"),
                    savedProduct.getTemplateType().name(),
                    null,
                    null,
                    null,
                    "Porta adicional de teste",
                    Collections.emptyList()
            );

            mockMvc.perform(post("/api/budgets/{id}/items", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                    .andExpect(status().isCreated())
                    .andExpect(header().exists("Location"))
                    .andExpect(jsonPath("$.productId").value(savedProduct.getId().toString()))
                    .andExpect(jsonPath("$.quantity").value(2))
                    .andExpect(jsonPath("$.subtotal").value(80.00))
                    .andExpect(jsonPath("$.notes").value("Porta adicional de teste"));

            // Confirma que o item foi inserido no orçamento e valores financeiros recalculados
            Budget updated = budgetRepository.findById(budget.getId()).orElseThrow();
            assertThat(updated.getItems()).hasSize(initialItemsCount + 1);
            assertThat(updated.getSubtotal()).isEqualByComparingTo("180.00");
            assertThat(updated.getTotal()).isEqualByComparingTo("180.00");
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity ao adicionar item em orçamento imutável (APPROVED)")
        void shouldReturn422WhenAddingItemToApprovedBudget() throws Exception {
            Budget approvedBudget = createApprovedBudgetWithItem();

            BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                    savedProduct.getId(),
                    new BigDecimal("1000.00"),
                    new BigDecimal("1000.00"),
                    1,
                    BigDecimal.ZERO,
                    null, null, null, null, null, null
            );

            mockMvc.perform(post("/api/budgets/{id}/items", approvedBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity());
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request ao enviar item com dimensões ou quantidade inválidas")
        void shouldReturn400WhenItemHasInvalidDimensionsOrQuantity() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            // Largura zerada e quantidade zero
            BudgetItemRequestDTO invalidItem = new BudgetItemRequestDTO(
                    savedProduct.getId(),
                    BigDecimal.ZERO,
                    new BigDecimal("1000.00"),
                    0,
                    BigDecimal.ZERO,
                    null, null, null, null, null, null
            );

            mockMvc.perform(post("/api/budgets/{id}/items", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidItem)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors", notNullValue()));
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found ao adicionar item em orçamento inexistente")
        void shouldReturn404WhenAddingItemToNonexistentBudget() throws Exception {
            UUID nonexistentId = UUID.randomUUID();

            BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                    savedProduct.getId(),
                    new BigDecimal("1000.00"),
                    new BigDecimal("1000.00"),
                    1,
                    BigDecimal.ZERO,
                    null, null, null, null, null, null
            );

            mockMvc.perform(post("/api/budgets/{id}/items", nonexistentId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // 3. TESTES DO ENDPOINT POST /api/budgets/{id}/recalcular
    // =========================================================================

    @Nested
    @DisplayName("POST /api/budgets/{id}/recalcular — Forçar Recálculo")
    class RecalculateEndpointTests {

        @Test
        @DisplayName("Deve recalcular orçamento DRAFT com sucesso e retornar 200 OK")
        void shouldRecalculateDraftBudgetSuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            mockMvc.perform(post("/api/budgets/{id}/recalcular", budget.getId())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(budget.getId().toString()))
                    .andExpect(jsonPath("$.status").value("DRAFT"))
                    .andExpect(jsonPath("$.subtotal").value(100.00))
                    .andExpect(jsonPath("$.total").value(100.00));

            Budget updated = budgetRepository.findById(budget.getId()).orElseThrow();
            assertThat(updated.getSubtotal()).isEqualByComparingTo("100.00");
            assertThat(updated.getTotal()).isEqualByComparingTo("100.00");
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity ao forçar recálculo em orçamento imutável")
        void shouldReturn422WhenRecalculatingApprovedBudget() throws Exception {
            Budget approvedBudget = createApprovedBudgetWithItem();

            mockMvc.perform(post("/api/budgets/{id}/recalcular", approvedBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnprocessableEntity());
        }
    }

    // =========================================================================
    // 4. TESTES DO ENDPOINT GET /api/budgets/{id}/pdf/comercial [US-10.6]
    // =========================================================================

    @Nested
    @DisplayName("GET /api/budgets/{id}/pdf/comercial — Exportar PDF Comercial")
    class ExportPdfComercialEndpointTests {

        @Test
        @DisplayName("Deve gerar PDF comercial com sucesso (200 OK) a partir do banco de dados real H2")
        void shouldExportPdfComercialSuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", budget.getId()))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", "application/pdf"))
                    .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(budget.getCode() + "-comercial.pdf")))
                    .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                    .andExpect(result -> {
                        byte[] bytes = result.getResponse().getContentAsByteArray();
                        org.junit.jupiter.api.Assertions.assertTrue(bytes.length > 0);
                        String header = new String(bytes, 0, Math.min(bytes.length, 4));
                        org.junit.jupiter.api.Assertions.assertEquals("%PDF", header);
                    });
        }

        @Test
        @DisplayName("Deve retornar 422 Unprocessable Entity quando tentar emitir PDF de orçamento CANCELLED")
        void shouldReturn422WhenBudgetIsCancelled() throws Exception {
            Budget budget = createDraftBudgetWithItem();
            budget.setStatus(BudgetStatus.CANCELLED);
            budgetRepository.save(budget);

            mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", budget.getId()))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.status").value(422))
                    .andExpect(jsonPath("$.message").value("Não é possível gerar o PDF de um orçamento cancelado."));
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found quando o orçamento não existir")
        void shouldReturn404WhenBudgetDoesNotExist() throws Exception {
            UUID nonExistentId = UUID.randomUUID();

            mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", nonExistentId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }
    }

    // =========================================================================
    // 5. TESTES DO ENDPOINT GET /api/budgets/{id}/resumo-whatsapp [US-10.7]
    // =========================================================================

    @Nested
    @DisplayName("GET /api/budgets/{id}/resumo-whatsapp — Resumo WhatsApp")
    class WhatsAppSummaryEndpointTests {

        @Test
        @DisplayName("Deve retornar 200 OK e o texto do resumo quando o orçamento existir")
        void shouldReturnWhatsAppSummarySuccessfully() throws Exception {
            Budget budget = createDraftBudgetWithItem();

            mockMvc.perform(get("/api/budgets/{id}/resumo-whatsapp", budget.getId()))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8"))
                    .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found quando o orçamento não existir para o WhatsApp")
        void shouldReturn404WhenBudgetDoesNotExistForWhatsApp() throws Exception {
            UUID nonExistentId = UUID.randomUUID();

            mockMvc.perform(get("/api/budgets/{id}/resumo-whatsapp", nonExistentId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }
    }
}

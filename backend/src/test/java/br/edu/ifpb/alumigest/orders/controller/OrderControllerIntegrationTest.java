package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("Testes de Integração (MockMvc + H2): OrderController")
class OrderControllerIntegrationTest {

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

    @Autowired
    private ProductRepository productRepository;

    private Budget draftBudget;
    private Budget cancelledBudget;
    private Order existingOrder;
    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setName("Produto Integração");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_1F);
        product.setActive(true);
        product = productRepository.saveAndFlush(product);

        Client client = Client.builder()
                .fullName("Construtora Integração H2")
                .phone("83999990000")
                .build();
        client = clientRepository.saveAndFlush(client);

        draftBudget = criarOrcamento(client, product, "ORC-2026-0001", BudgetStatus.DRAFT);
        cancelledBudget = criarOrcamento(client, product, "ORC-2026-0002", BudgetStatus.CANCELLED);
        Budget budgetForOrder = criarOrcamento(client, product, "ORC-2026-0003", BudgetStatus.APPROVED);

        existingOrder = Order.builder()
                .codigo("PED-INTEGRACAO-01")
                .clienteNome(client.getFullName())
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .valorBruto(new BigDecimal("3000.00"))
                .valorLiquido(new BigDecimal("3000.00"))
                .orcamentoId(budgetForOrder.getId())
                .build();

        OrderItem orderItem = OrderItem.builder()
                .product(product)
                .descricao("Esquadria Teste OrderItem")
                .larguraMm(1000)
                .alturaMm(1000)
                .quantidade(1)
                .valorUnitario(new BigDecimal("3000.00"))
                .valorTotal(new BigDecimal("3000.00"))
                .build();
        existingOrder.addItem(orderItem);

        existingOrder = orderRepository.saveAndFlush(existingOrder);
    }

    private Budget criarOrcamento(Client client, Product product, String code, BudgetStatus status) {
        Budget budget = new Budget();
        budget.setCode(code);
        budget.setClient(client);
        budget.setStatus(status);
        budget.setSubtotal(new BigDecimal("1500.00"));
        budget.setTotal(new BigDecimal("1500.00"));
        budget.setDiscountValue(BigDecimal.ZERO);

        BudgetItem item = new BudgetItem();
        item.setProduct(product);
        item.setProductName("Esquadria Teste");
        item.setWidthMm(new BigDecimal("1000"));
        item.setHeightMm(new BigDecimal("1000"));
        item.setQuantity(1);
        item.setSubtotal(new BigDecimal("1500.00"));
        item.setLaborCost(BigDecimal.ZERO);

        budget.addItem(item);
        return budgetRepository.saveAndFlush(budget);
    }

    @Nested
    @DisplayName("POST /api/v1/orders/from-budget/{budgetId}")
    class ConvertBudgetToOrderTests {

        @Test
        @DisplayName("Sucesso (201): Deve converter orçamento em Pedido, atualizar status e gerar snapshot")
        void convertSuccess() throws Exception {
            OrderConvertRequest request = new OrderConvertRequest(
                    ApprovalChannel.PRESENCIAL,
                    LocalDate.now(ZoneOffset.UTC).plusDays(10),
                    "Obs Teste"
            );

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", draftBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/v1/orders/")))
                    .andExpect(jsonPath("$.codigo").exists())
                    .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"));

            Budget updatedBudget = budgetRepository.findById(draftBudget.getId()).orElseThrow();
            assertThat(updatedBudget.getStatus()).isEqualTo(BudgetStatus.APPROVED);

            Order savedOrder = orderRepository.findAll().stream()
                    .filter(o -> o.getOrcamentoId().equals(draftBudget.getId()))
                    .findFirst().orElseThrow();

            assertThat(savedOrder.getItems()).hasSize(1);
            assertThat(savedOrder.getItems().get(0).getLarguraMm()).isEqualTo(1000);
            assertThat(savedOrder.getItems().get(0).getAlturaMm()).isEqualTo(1000);
        }

        @Test
        @DisplayName("Erro (422): Orçamento não elegível (Cancelado)")
        void convertError422() throws Exception {
            OrderConvertRequest request = new OrderConvertRequest(
                    ApprovalChannel.WHATSAPP,
                    LocalDate.now(ZoneOffset.UTC).plusDays(10),
                    null
            );

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", cancelledBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.status").value(422))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Erro (409): Pedido já existente (Idempotência)")
        void convertError409() throws Exception {
            Order mockOrder = Order.builder()
                    .codigo("PED-DUPLICADO")
                    .orcamentoId(draftBudget.getId())
                    .clienteNome("Construtora Integração H2")
                    .status(OrderStatus.WAITING_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.PRESENCIAL)
                    .valorBruto(new BigDecimal("1500.00"))
                    .valorLiquido(new BigDecimal("1500.00"))
                    .build();
            orderRepository.saveAndFlush(mockOrder);

            OrderConvertRequest request = new OrderConvertRequest(
                    ApprovalChannel.WHATSAPP,
                    LocalDate.now(ZoneOffset.UTC).plusDays(10),
                    null
            );

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", draftBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status").value(409))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Erro (404): Orçamento inexistente")
        void convertError404() throws Exception {
            OrderConvertRequest request = new OrderConvertRequest(
                    ApprovalChannel.WHATSAPP,
                    LocalDate.now(ZoneOffset.UTC).plusDays(10),
                    null
            );

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", UUID.randomUUID())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Erro (400): Payload inválido (Bean Validation)")
        void convertError400() throws Exception {
            OrderConvertRequest invalidRequest = new OrderConvertRequest(null, null, null);

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", draftBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders")
    class FindAllOrdersTests {

        @Test
        @DisplayName("Sucesso (200): Deve listar pedidos paginados com metadados")
        void findAllSuccess() throws Exception {
            mockMvc.perform(get("/api/v1/orders")
                            .param("page", "0")
                            .param("size", "10")
                            .param("search", "PED-INTEGRACAO"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].codigo").value("PED-INTEGRACAO-01"))
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.page").exists())
                    .andExpect(jsonPath("$.size").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Sucesso (200): Deve retornar pedido detalhado com os itens")
        void findByIdSuccess() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}", existingOrder.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.codigo").value("PED-INTEGRACAO-01"))
                    .andExpect(jsonPath("$.items").isArray())
                    .andExpect(jsonPath("$.items[0].larguraMm").value(1000));
        }
        @Test
        @DisplayName("Erro (404): ID inexistente")
        void findByIdNotFound() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/{id}/pdf/comprovante")
    class DownloadPdfTests {

        @Test
        @DisplayName("Sucesso (200): Deve retornar binário do PDF e cabeçalhos de anexo")
        void downloadPdfSuccess() throws Exception {
            MvcResult result = mockMvc.perform(get("/api/v1/orders/{id}/pdf/comprovante", existingOrder.getId()))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", "application/pdf"))
                    .andExpect(header().string("Content-Disposition", containsString("attachment")))
                    .andExpect(header().string("Content-Disposition", containsString("comprovante-ped-integracao-01.pdf")))
                    .andReturn();

            byte[] pdfContent = result.getResponse().getContentAsByteArray();
            assertThat(pdfContent).isNotEmpty();
        }

        @Test
        @DisplayName("Erro (404): Pedido inexistente para emissão de comprovante PDF")
        void downloadPdfNotFound() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}/pdf/comprovante", UUID.randomUUID()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").exists());
        }
    }
}
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
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

    @BeforeEach
    void setUp() {
        // 1. Criar Produto Válido (Usando propriedades reais de Product.java)
        Product product = new Product();
        product.setName("Produto Integração");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_1F); // Assumindo que este enum exista
        product.setActive(true);
        product = productRepository.saveAndFlush(product);

        // 2. Criar Cliente Válido
        Client client = Client.builder()
                .fullName("Construtora Integração H2")
                .phone("83999990000")
                .build();
        client = clientRepository.saveAndFlush(client);

        // 3. Criar Orçamento DRAFT
        draftBudget = criarOrcamento(client, product, "ORC-2026-0001", BudgetStatus.DRAFT);

        // 4. Criar Orçamento CANCELLED
        cancelledBudget = criarOrcamento(client, product, "ORC-2026-0002", BudgetStatus.CANCELLED);

        // 5. Criar Orçamento Base para o Pedido
        Budget budgetForOrder = criarOrcamento(client, product, "ORC-2026-0003", BudgetStatus.APPROVED);

        // 6. Criar Pedido Válido
        existingOrder = Order.builder()
                .codigo("PED-INTEGRACAO-01")
                .clienteNome(client.getFullName())
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .valorBruto(new BigDecimal("3000.00"))
                .valorLiquido(new BigDecimal("3000.00"))
                .orcamentoId(budgetForOrder.getId())
                .build();
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
        @DisplayName("Sucesso (201): Deve converter orçamento em Pedido")
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
                    .andExpect(jsonPath("$.codigo").exists())
                    .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"));

            assertThat(orderRepository.existsByOrcamentoId(draftBudget.getId())).isTrue();
        }

        @Test
        @DisplayName("Erro (422): Orçamento não elegível")
        void convertError422() throws Exception {
            OrderConvertRequest request = new OrderConvertRequest(
                    ApprovalChannel.WHATSAPP,
                    LocalDate.now(ZoneOffset.UTC).plusDays(10),
                    null
            );

            mockMvc.perform(post("/api/v1/orders/from-budget/{id}", cancelledBudget.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity());
        }

        @Test
        @DisplayName("Erro (409): Pedido já existente")
        void convertError409() throws Exception {
            // Criando o pedido duplicado com todos os campos NOT NULL preenchidos
            Order mockOrder = Order.builder()
                    .codigo("PED-DUPLICADO")
                    .orcamentoId(draftBudget.getId())
                    .clienteNome("Construtora Integração H2") // <-- Correção: campo obrigatório
                    .status(OrderStatus.WAITING_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.PRESENCIAL)
                    .valorBruto(new BigDecimal("1500.00")) // <-- Prevenção de restrição NOT NULL
                    .valorLiquido(new BigDecimal("1500.00")) // <-- Prevenção de restrição NOT NULL
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
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders")
    class FindAllOrdersTests {

        @Test
        @DisplayName("Sucesso (200): Deve listar pedidos paginados")
        void findAllSuccess() throws Exception {
            mockMvc.perform(get("/api/v1/orders")
                            .param("page", "0")
                            .param("size", "10")
                            .param("search", "PED-INTEGRACAO"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].codigo").value("PED-INTEGRACAO-01"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Sucesso (200): Deve retornar pedido salvo")
        void findByIdSuccess() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}", existingOrder.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.codigo").value("PED-INTEGRACAO-01"));
        }

        @Test
        @DisplayName("Erro (404): ID inexistente")
        void findByIdNotFound() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/orders/{id}/pdf/comprovante")
    class DownloadPdfTests {

        @Test
        @DisplayName("Sucesso (200): Deve retornar binário do PDF do comprovante")
        void downloadPdfSuccess() throws Exception {
            mockMvc.perform(get("/api/v1/orders/{id}/pdf/comprovante", existingOrder.getId()))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", "application/pdf"));
        }
    }
}
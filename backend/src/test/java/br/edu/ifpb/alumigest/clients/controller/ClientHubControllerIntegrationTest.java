package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("Testes de Integração (MockMvc + JPA): ClientHubController")
class ClientHubControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ProductRepository productRepository;

    private Client client;
    private Product product;
    private Budget budgetApproved;
    private Budget budgetDraft;
    private Order activeOrder1;
    private Order activeOrder2;
    private Order cancelledOrder;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setName("Janela de Correr 2 Folhas Suprema");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_1F);
        product.setActive(true);
        product = productRepository.saveAndFlush(product);

        client = Client.builder()
                .fullName("Antônio Alfredo Figueiredo")
                .personType(PersonType.FISICA)
                .documentNumber("04289144409")
                .phone("83988452100")
                .email("antonio.figueiredo@email.com")
                .neighborhood("Torre")
                .city("João Pessoa")
                .state("PB")
                .build();
        client = clientRepository.saveAndFlush(client);

        // Orçamentos
        budgetApproved = new Budget();
        budgetApproved.setCode("ORC-2026-1024");
        budgetApproved.setClient(client);
        budgetApproved.setStatus(BudgetStatus.APPROVED);
        budgetApproved.setTotal(new BigDecimal("2067.88"));
        budgetApproved.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        budgetApproved = budgetRepository.saveAndFlush(budgetApproved);

        budgetDraft = new Budget();
        budgetDraft.setCode("ORC-2026-1030");
        budgetDraft.setClient(client);
        budgetDraft.setStatus(BudgetStatus.DRAFT);
        budgetDraft.setTotal(new BigDecimal("3450.00"));
        budgetDraft.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        budgetDraft = budgetRepository.saveAndFlush(budgetDraft);

        // O.S. Ativa 1 (3000.00) com item e medidas nominais
        activeOrder1 = Order.builder()
                .codigo("OS-2026-0001")
                .cliente(client)
                .clienteNome(client.getFullName())
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .valorBruto(new BigDecimal("3000.00"))
                .valorLiquido(new BigDecimal("3000.00"))
                .orcamentoId(budgetApproved.getId())
                .dataAprovacao(LocalDate.now().minusDays(2))
                .dataPrevisaoEntrega(LocalDate.now().plusDays(10))
                .build();

        OrderItem item1 = OrderItem.builder()
                .product(product)
                .descricao("Janela 2 Folhas Vidro 8mm Incolor")
                .larguraMm(1200)
                .alturaMm(1000)
                .quantidade(2)
                .corAluminio("Branco")
                .tipoVidro("Temperado 8mm Incolor")
                .valorUnitario(new BigDecimal("1500.00"))
                .valorTotal(new BigDecimal("3000.00"))
                .build();
        activeOrder1.addItem(item1);
        activeOrder1 = orderRepository.saveAndFlush(activeOrder1);

        // O.S. Ativa 2 (1500.00)
        activeOrder2 = Order.builder()
                .codigo("OS-2026-0002")
                .cliente(client)
                .clienteNome(client.getFullName())
                .status(OrderStatus.IN_PRODUCTION)
                .canalAprovacao(ApprovalChannel.PRESENCIAL)
                .valorBruto(new BigDecimal("1500.00"))
                .valorLiquido(new BigDecimal("1500.00"))
                .orcamentoId(budgetApproved.getId())
                .dataAprovacao(LocalDate.now().minusDays(1))
                .dataPrevisaoEntrega(LocalDate.now().plusDays(5))
                .build();

        OrderItem item2 = OrderItem.builder()
                .product(product)
                .descricao("Porta Giro Linha Gold")
                .larguraMm(800)
                .alturaMm(2100)
                .quantidade(1)
                .corAluminio("Preto")
                .tipoVidro("Laminado 6mm")
                .valorUnitario(new BigDecimal("1500.00"))
                .valorTotal(new BigDecimal("1500.00"))
                .build();
        activeOrder2.addItem(item2);
        activeOrder2 = orderRepository.saveAndFlush(activeOrder2);

        // O.S. Cancelada (500.00) - NÃO deve entrar no somatório de totalContratado
        cancelledOrder = Order.builder()
                .codigo("OS-2026-0003")
                .cliente(client)
                .clienteNome(client.getFullName())
                .status(OrderStatus.CANCELLED)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .valorBruto(new BigDecimal("500.00"))
                .valorLiquido(new BigDecimal("500.00"))
                .orcamentoId(budgetDraft.getId())
                .dataAprovacao(LocalDate.now().minusDays(5))
                .dataPrevisaoEntrega(LocalDate.now().plusDays(2))
                .build();
        cancelledOrder = orderRepository.saveAndFlush(cancelledOrder);
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/dashboard - deve retornar dados cadastrais e KPIs agregados (excluindo canceladas)")
    void shouldReturnDashboardWithAggregatedKpis() throws Exception {
        mockMvc.perform(get("/api/clientes/{id}/dashboard", client.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(client.getId().toString()))
                .andExpect(jsonPath("$.nomeCompleto").value("Antônio Alfredo Figueiredo"))
                .andExpect(jsonPath("$.personType").value("FISICA"))
                .andExpect(jsonPath("$.documento").value("04289144409"))
                .andExpect(jsonPath("$.telefone").value("83988452100"))
                .andExpect(jsonPath("$.bairro").value("Torre"))
                .andExpect(jsonPath("$.cidade").value("João Pessoa"))
                .andExpect(jsonPath("$.uf").value("PB"))
                // Total contratado = 3000.00 + 1500.00 = 4500.00 (ignora cancelledOrder de 500.00)
                .andExpect(jsonPath("$.totalContratado").value(4500.00))
                // Quantidade de O.S. ativas no sistema = 3 (Order 1, Order 2, Order 3 com ativo=true)
                .andExpect(jsonPath("$.quantidadeOrdensServico").value(3))
                // Quantidade de orçamentos vinculados = 2
                .andExpect(jsonPath("$.quantidadeOrcamentos").value(2));
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/budgets - deve retornar listagem paginada de orçamentos")
    void shouldReturnPaginatedBudgets() throws Exception {
        mockMvc.perform(get("/api/clientes/{id}/budgets", client.getId())
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[?(@.codigo == 'ORC-2026-1024')].status").value("APPROVED"))
                .andExpect(jsonPath("$.content[?(@.codigo == 'ORC-2026-1024')].valorTotal").value(2067.88))
                .andExpect(jsonPath("$.content[?(@.codigo == 'ORC-2026-1030')].status").value("DRAFT"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/orders - deve retornar ordens de serviço com esquadrias e medidas em mm")
    void shouldReturnClientOrdersWithItemsAndMeasures() throws Exception {
        mockMvc.perform(get("/api/clientes/{id}/orders", client.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                // Retorna 3 ordens (incluindo o histórico completo ordenado por data)
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                // Verifica detalhamento de esquadria física com medidas na OS-2026-0001
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0001')].totalEsquadrias").value(2))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0001')].items[0].larguraMm").value(1200))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0001')].items[0].alturaMm").value(1000))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0001')].items[0].corAluminio").value("Branco"))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0001')].items[0].tipoVidro").value("Temperado 8mm Incolor"))
                // Verifica OS-2026-0002
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0002')].totalEsquadrias").value(1))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0002')].items[0].larguraMm").value(800))
                .andExpect(jsonPath("$[?(@.codigo == 'OS-2026-0002')].items[0].alturaMm").value(2100));
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/dashboard - deve retornar 404 quando cliente não existir")
    void shouldReturn404WhenClientNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/clientes/{id}/dashboard", nonExistentId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Cliente não encontrado")));
    }
}

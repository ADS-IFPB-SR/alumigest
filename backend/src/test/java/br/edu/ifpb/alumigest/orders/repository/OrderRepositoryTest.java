package br.edu.ifpb.alumigest.orders.repository;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Testes de Integração de Repositório: OrderRepository")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setFullName("Maria Oliveira");
        client.setPersonType(PersonType.FISICA);
        client.setDocumentNumber("98765432100");
        client.setPhone("83999998888");
        client.setEmail("maria@example.com");
        client = clientRepository.save(client);
    }

    private Order buildOrder(String codigo, UUID orcamentoId, OrderStatus status) {
        return buildOrder(codigo, orcamentoId, status, client.getFullName());
    }

    private Order buildOrder(String codigo, UUID orcamentoId, OrderStatus status, String clienteNome) {
        return Order.builder()
                .codigo(codigo)
                .orcamentoId(orcamentoId)
                .cliente(client)
                .clienteNome(clienteNome)
                .clienteTelefone(client.getPhone())
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .status(status)
                .dataAprovacao(LocalDate.now(ZoneOffset.UTC))
                .dataPrevisaoEntrega(LocalDate.now(ZoneOffset.UTC).plusDays(15))
                .valorBruto(new BigDecimal("1500.00"))
                .valorLiquido(new BigDecimal("1500.00"))
                .ativo(true)
                .build();
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve persistir pedido com itens e recuperar por código e ID")
    void shouldPersistAndRetrieveOrderByCodeAndId() {
        Order order = buildOrder("OS-2026-0001", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION);

        OrderItem item = OrderItem.builder()
                .descricao("Janela Correr 2F")
                .larguraMm(1200)
                .alturaMm(1200)
                .quantidade(1)
                .valorUnitario(new BigDecimal("1500.00"))
                .valorTotal(new BigDecimal("1500.00"))
                .build();
        order.addItem(item);

        Order saved = orderRepository.saveAndFlush(order);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getItems()).hasSize(1);

        Optional<Order> found = orderRepository.findByCodigo("OS-2026-0001");
        assertThat(found).isPresent();
        assertThat(found.get().getClienteNome()).isEqualTo("Maria Oliveira");
        assertThat(found.get().getItems().get(0).getDescricao()).isEqualTo("Janela Correr 2F");
    }

    @Test
    @DisplayName("[Restrição de Integridade / Invariante 1:1] Deve lançar DataIntegrityViolationException ao duplicar orcamentoId")
    void shouldEnforceUniqueBudgetConstraint() {
        UUID orcamentoId = UUID.randomUUID();

        Order order1 = buildOrder("OS-2026-0001", orcamentoId, OrderStatus.WAITING_PRODUCTION);
        orderRepository.saveAndFlush(order1);

        Order order2 = buildOrder("OS-2026-0002", orcamentoId, OrderStatus.WAITING_PRODUCTION);

        assertThatThrownBy(() -> orderRepository.saveAndFlush(order2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("[Restrição de Integridade] Deve lançar DataIntegrityViolationException ao duplicar codigo")
    void shouldEnforceUniqueCodigoConstraint() {
        Order order1 = buildOrder("OS-2026-0001", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION);
        orderRepository.saveAndFlush(order1);

        Order order2 = buildOrder("OS-2026-0001", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION);

        assertThatThrownBy(() -> orderRepository.saveAndFlush(order2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve filtrar pedidos ativos por status e busca textual")
    void shouldFilterActiveOrdersByStatusAndSearchTerm() {
        Order order1 = buildOrder("OS-2026-0001", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION, "Carlos Eduardo");
        orderRepository.save(order1);

        Order order2 = buildOrder("OS-2026-0002", UUID.randomUUID(), OrderStatus.IN_PRODUCTION, "Ana Paula");
        orderRepository.save(order2);

        Order order3 = buildOrder("OS-2026-0003", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION, "Bruna Costa");
        orderRepository.save(order3);

        entityManager.flush();
        entityManager.clear();

        // Filtro por status
        Page<Order> aguardando = orderRepository.findAllWithFilters(
                OrderStatus.WAITING_PRODUCTION, null, null, PageRequest.of(0, 10));
        assertThat(aguardando.getContent()).hasSize(2);

        // Filtro por canal de aprovação
        Page<Order> canalWhatsapp = orderRepository.findAllWithFilters(
                null, ApprovalChannel.WHATSAPP, null, PageRequest.of(0, 10));
        assertThat(canalWhatsapp.getContent()).hasSize(3);

        // Filtro por busca textual no nome do cliente
        Page<Order> buscaNome = orderRepository.findAllWithFilters(
                null, null, "Carlos", PageRequest.of(0, 10));
        assertThat(buscaNome.getContent()).hasSize(1);
        assertThat(buscaNome.getContent().get(0).getCodigo()).isEqualTo("OS-2026-0001");

        // Filtro por busca textual no código
        Page<Order> buscaCodigo = orderRepository.findAllWithFilters(
                null, null, "OS-2026-0002", PageRequest.of(0, 10));
        assertThat(buscaCodigo.getContent()).hasSize(1);
        assertThat(buscaCodigo.getContent().get(0).getClienteNome()).isEqualTo("Ana Paula");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve encontrar o pedido com código mais recente para prefixo anual")
    void shouldFindTopOrderByCodePrefix() {
        orderRepository.save(buildOrder("OS-2026-0001", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION));
        orderRepository.save(buildOrder("OS-2026-0005", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION));
        orderRepository.save(buildOrder("OS-2026-0002", UUID.randomUUID(), OrderStatus.WAITING_PRODUCTION));

        entityManager.flush();
        entityManager.clear();

        Optional<Order> topOrder = orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc("OS-2026-");

        assertThat(topOrder).isPresent();
        assertThat(topOrder.get().getCodigo()).isEqualTo("OS-2026-0005");
    }
}

package br.edu.ifpb.alumigest.orders.repository;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Testes de Integração de Repositório: OrderItemRepository")
class OrderItemRepositoryTest {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("[Partição de Equivalência] Deve recuperar itens de um pedido ordenados pela coluna ordem ASC")
    void shouldFindItemsByOrderIdOrdered() {
        Order order = Order.builder()
                .codigo("PED-2026-0001")
                .orcamentoId(UUID.randomUUID())
                .clienteNome("Cliente Teste")
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .status(OrderStatus.AGUARDANDO_PRODUCAO)
                .dataAprovacao(LocalDate.now())
                .dataPrevisaoEntrega(LocalDate.now().plusDays(15))
                .valorBruto(new BigDecimal("1000.00"))
                .valorLiquido(new BigDecimal("1000.00"))
                .ativo(true)
                .build();
        order = orderRepository.save(order);

        OrderItem item2 = OrderItem.builder()
                .order(order)
                .descricao("Item Segundo")
                .larguraMm(1000)
                .alturaMm(1000)
                .quantidade(1)
                .valorUnitario(new BigDecimal("600.00"))
                .valorTotal(new BigDecimal("600.00"))
                .ordem(2)
                .build();
        orderItemRepository.save(item2);

        OrderItem item1 = OrderItem.builder()
                .order(order)
                .descricao("Item Primeiro")
                .larguraMm(800)
                .alturaMm(800)
                .quantidade(1)
                .valorUnitario(new BigDecimal("400.00"))
                .valorTotal(new BigDecimal("400.00"))
                .ordem(1)
                .build();
        orderItemRepository.save(item1);

        entityManager.flush();
        entityManager.clear();

        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByOrdemAsc(order.getId());

        assertThat(items).hasSize(2);
        assertThat(items.get(0).getDescricao()).isEqualTo("Item Primeiro");
        assertThat(items.get(0).getOrdem()).isEqualTo(1);
        assertThat(items.get(1).getDescricao()).isEqualTo("Item Segundo");
        assertThat(items.get(1).getOrdem()).isEqualTo(2);
    }
}

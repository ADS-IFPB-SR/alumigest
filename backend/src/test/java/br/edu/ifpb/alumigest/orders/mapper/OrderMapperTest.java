package br.edu.ifpb.alumigest.orders.mapper;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes de Unidade: OrderMapper (MapStruct)")
class OrderMapperTest {

    private final OrderMapper orderMapper = Mappers.getMapper(OrderMapper.class);

    @Test
    @DisplayName("[Partição de Equivalência] Deve mapear entidade Order para OrderResponse com dados detalhados e labels")
    void shouldMapOrderToOrderResponse() {
        UUID orderId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID orcamentoId = UUID.randomUUID();

        Client client = new Client();
        client.setId(clientId);
        client.setFullName("João das Neves");

        Order order = Order.builder()
                .id(orderId)
                .codigo("OS-2026-0010")
                .orcamentoId(orcamentoId)
                .cliente(client)
                .clienteNome("João das Neves")
                .clienteTelefone("83999991234")
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .dataAprovacao(LocalDate.of(2026, 9, 29))
                .dataPrevisaoEntrega(LocalDate.of(2026, 10, 14))
                .valorBruto(new BigDecimal("2000.00"))
                .valorLiquido(new BigDecimal("1900.00"))
                .valorDesconto(new BigDecimal("100.00"))
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .descricao("Janela 2F")
                .larguraMm(1000)
                .alturaMm(1000)
                .quantidade(2)
                .valorUnitario(new BigDecimal("1000.00"))
                .valorTotal(new BigDecimal("2000.00"))
                .ordem(1)
                .build();

        OrderItemOption option = OrderItemOption.builder()
                .id(UUID.randomUUID())
                .materialName("Perfil Alumínio")
                .unitMeasure("M")
                .categoryType("ALUMINIO")
                .quantity(new BigDecimal("4.00"))
                .unitPrice(new BigDecimal("50.00"))
                .totalPrice(new BigDecimal("200.00"))
                .build();

        item.addOption(option);
        order.addItem(item);

        OrderResponse response = orderMapper.toResponse(order);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(orderId);
        assertThat(response.codigo()).isEqualTo("OS-2026-0010");
        assertThat(response.clienteId()).isEqualTo(clientId);
        assertThat(response.status()).isEqualTo(OrderStatus.WAITING_PRODUCTION);
        assertThat(response.statusDescricao()).isEqualTo("Aguardando Produção");
        assertThat(response.canalAprovacao()).isEqualTo(ApprovalChannel.WHATSAPP);
        assertThat(response.canalAprovacaoDescricao()).isEqualTo("WhatsApp");
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).descricao()).isEqualTo("Janela 2F");
        assertThat(response.items().get(0).options()).hasSize(1);
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve mapear entidade Order para OrderSummaryResponse com contagem de itens")
    void shouldMapOrderToOrderSummaryResponse() {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .codigo("OS-2026-0011")
                .orcamentoId(UUID.randomUUID())
                .clienteNome("Maria Bonita")
                .status(OrderStatus.IN_PRODUCTION)
                .canalAprovacao(ApprovalChannel.PRESENCIAL)
                .valorLiquido(new BigDecimal("3500.00"))
                .build();

        order.addItem(OrderItem.builder().descricao("Item A").larguraMm(500).alturaMm(500).build());
        order.addItem(OrderItem.builder().descricao("Item B").larguraMm(600).alturaMm(600).build());

        OrderSummaryResponse summary = orderMapper.toSummaryResponse(order);

        assertThat(summary).isNotNull();
        assertThat(summary.codigo()).isEqualTo("OS-2026-0011");
        assertThat(summary.statusDescricao()).isEqualTo("Em Produção");
        assertThat(summary.canalAprovacaoDescricao()).isEqualTo("Presencial");
        assertThat(summary.quantidadeItens()).isEqualTo(2);
    }
}

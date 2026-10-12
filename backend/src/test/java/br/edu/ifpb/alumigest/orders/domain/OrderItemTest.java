package br.edu.ifpb.alumigest.orders.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Testes de Domínio: OrderItem")
class OrderItemTest {

    @Test
    @DisplayName("[Partição de Equivalência / Builder] Deve instanciar item de pedido com dados congelados e gerenciar opções")
    void shouldCreateOrderItemAndManageOptions() {
        UUID itemId = UUID.randomUUID();

        OrderItem item = OrderItem.builder()
                .id(itemId)
                .descricao("Porta de Giro Alumínio")
                .larguraMm(900)
                .alturaMm(2100)
                .quantidade(1)
                .corAluminio("PRETO")
                .tipoVidro("INCOLOR_6MM")
                .orientacaoAbertura("DIREITA")
                .ferragens("Fechadura Rolete + Puxador Tubular")
                .valorUnitario(new BigDecimal("1200.00"))
                .valorTotal(new BigDecimal("1200.00"))
                .templateConfig("{\"modelo\":\"giro\"}")
                .handleConfig("{\"puxador\":\"tubular\"}")
                .drillingConfig("{\"furacao\":true}")
                .ordem(1)
                .build();

        OrderItemOption option = OrderItemOption.builder()
                .materialName("Perfil Linha Suprema")
                .unitMeasure("M")
                .categoryType("ALUMINIO")
                .quantity(new BigDecimal("6.20"))
                .unitPrice(new BigDecimal("45.00"))
                .totalPrice(new BigDecimal("279.00"))
                .build();

        item.addOption(option);

        assertThat(item.getId()).isEqualTo(itemId);
        assertThat(item.getDescricao()).isEqualTo("Porta de Giro Alumínio");
        assertThat(item.getLarguraMm()).isEqualTo(900);
        assertThat(item.getAlturaMm()).isEqualTo(2100);
        assertThat(item.getOptions()).containsExactly(option);
        assertThat(option.getOrderItem()).isEqualTo(item);

        item.removeOption(option);
        assertThat(item.getOptions()).isEmpty();
        assertThat(option.getOrderItem()).isNull();
    }

    @Test
    @DisplayName("[Encapsulamento / Clean Code] Deve proteger a coleção de opções retornando lista imutável")
    void shouldProtectOptionsCollectionImmutability() {
        OrderItem item = OrderItem.builder().descricao("Item Teste").build();
        OrderItemOption option = OrderItemOption.builder().materialName("Opção").build();
        List<OrderItemOption> options = item.getOptions();

        assertThatThrownBy(() -> options.add(option))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}

package br.edu.ifpb.alumigest.orders.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes de Domínio: OrderStatus")
class OrderStatusTest {

    @Test
    @DisplayName("[Partição de Equivalência] Deve conter todos os 5 estados do ciclo de vida com descrições e labels formatados em pt-BR")
    void shouldContainAllValidStatusesWithLabels() {
        assertThat(OrderStatus.values()).containsExactly(
                OrderStatus.CRIADO,
                OrderStatus.AGUARDANDO_PRODUCAO,
                OrderStatus.EM_PRODUCAO,
                OrderStatus.CONCLUIDO,
                OrderStatus.CANCELADO
        );

        assertThat(OrderStatus.CRIADO.getDescricao()).isEqualTo("Criado");
        assertThat(OrderStatus.CRIADO.getLabel()).isEqualTo("Criado");

        assertThat(OrderStatus.AGUARDANDO_PRODUCAO.getDescricao()).isEqualTo("Aguardando Produção");
        assertThat(OrderStatus.AGUARDANDO_PRODUCAO.getLabel()).isEqualTo("Aguardando Produção");

        assertThat(OrderStatus.EM_PRODUCAO.getDescricao()).isEqualTo("Em Produção");
        assertThat(OrderStatus.EM_PRODUCAO.getLabel()).isEqualTo("Em Produção");

        assertThat(OrderStatus.CONCLUIDO.getDescricao()).isEqualTo("Concluído");
        assertThat(OrderStatus.CONCLUIDO.getLabel()).isEqualTo("Concluído");

        assertThat(OrderStatus.CANCELADO.getDescricao()).isEqualTo("Cancelado");
        assertThat(OrderStatus.CANCELADO.getLabel()).isEqualTo("Cancelado");
    }

    @ParameterizedTest(name = "[Tabela de Decisão / Transição de Estados] Status {0} permite cancelamento = {1}")
    @CsvSource({
            "CRIADO, true",
            "AGUARDANDO_PRODUCAO, true",
            "EM_PRODUCAO, false",
            "CONCLUIDO, false",
            "CANCELADO, false"
    })
    void shouldValidateCancellationPermissionByStatus(OrderStatus status, boolean expectedCanCancel) {
        assertThat(status.podeCancelar()).isEqualTo(expectedCanCancel);
    }
}

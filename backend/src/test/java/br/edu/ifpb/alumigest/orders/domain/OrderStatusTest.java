package br.edu.ifpb.alumigest.orders.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("Testes de Domínio: OrderStatus")
class OrderStatusTest {

  @Test
  @DisplayName("[Partição de Equivalência] Deve conter todos os 5 estados do ciclo de vida com descrições e labels formatados em pt-BR")
  void shouldContainAllValidStatusesWithLabels() {
    assertThat(OrderStatus.values()).containsExactly(
        OrderStatus.CREATED,
        OrderStatus.WAITING_PRODUCTION,
        OrderStatus.IN_PRODUCTION,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED
    );

    assertThat(OrderStatus.CREATED.getDescription()).isEqualTo("Criado");
    assertThat(OrderStatus.CREATED.getDescricao()).isEqualTo("Criado");
    assertThat(OrderStatus.CREATED.getLabel()).isEqualTo("Criado");

    assertThat(OrderStatus.WAITING_PRODUCTION.getDescription()).isEqualTo("Aguardando Produção");
    assertThat(OrderStatus.WAITING_PRODUCTION.getDescricao()).isEqualTo("Aguardando Produção");
    assertThat(OrderStatus.WAITING_PRODUCTION.getLabel()).isEqualTo("Aguardando Produção");

    assertThat(OrderStatus.IN_PRODUCTION.getDescription()).isEqualTo("Em Produção");
    assertThat(OrderStatus.IN_PRODUCTION.getDescricao()).isEqualTo("Em Produção");
    assertThat(OrderStatus.IN_PRODUCTION.getLabel()).isEqualTo("Em Produção");

    assertThat(OrderStatus.COMPLETED.getDescription()).isEqualTo("Concluído");
    assertThat(OrderStatus.COMPLETED.getDescricao()).isEqualTo("Concluído");
    assertThat(OrderStatus.COMPLETED.getLabel()).isEqualTo("Concluído");

    assertThat(OrderStatus.CANCELLED.getDescription()).isEqualTo("Cancelado");
    assertThat(OrderStatus.CANCELLED.getDescricao()).isEqualTo("Cancelado");
    assertThat(OrderStatus.CANCELLED.getLabel()).isEqualTo("Cancelado");
  }

  @ParameterizedTest(name = "[Tabela de Decisão / Transição de Estados] Status {0} permite cancelamento = {1}")
  @CsvSource({
      "CREATED, true",
      "WAITING_PRODUCTION, true",
      "IN_PRODUCTION, false",
      "COMPLETED, false",
      "CANCELLED, false"
  })
  void shouldValidateCancellationPermissionByStatus(OrderStatus status, boolean expectedCanCancel) {
    assertThat(status.canCancel()).isEqualTo(expectedCanCancel);
    assertThat(status.podeCancelar()).isEqualTo(expectedCanCancel);
  }
}


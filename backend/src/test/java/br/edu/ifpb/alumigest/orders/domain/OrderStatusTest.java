package br.edu.ifpb.alumigest.orders.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

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

  @Nested
  @DisplayName("Testes do Conversor Textual: OrderStatus.fromString(String)")
  class FromStringTests {

    @ParameterizedTest(name = "[Partição de Equivalência] Texto \"{0}\" deve converter para enum {1}")
    @CsvSource({
        // Inglês padrão
        "WAITING_PRODUCTION, WAITING_PRODUCTION",
        "IN_PRODUCTION, IN_PRODUCTION",
        "COMPLETED, COMPLETED",
        "CANCELLED, CANCELLED",
        "CREATED, CREATED",

        // Minúsculas e espaços em inglês
        "waiting_production, WAITING_PRODUCTION",
        "waiting production, WAITING_PRODUCTION",
        "in_production, IN_PRODUCTION",
        "in production, IN_PRODUCTION",
        "completed, COMPLETED",
        "cancelled, CANCELLED",
        "created, CREATED",

        // Português sem acento
        "AGUARDANDO_PRODUCAO, WAITING_PRODUCTION",
        "aguardando producao, WAITING_PRODUCTION",
        "EM_PRODUCAO, IN_PRODUCTION",
        "em producao, IN_PRODUCTION",
        "CONCLUIDO, COMPLETED",
        "concluido, COMPLETED",
        "CANCELADO, CANCELLED",
        "cancelado, CANCELLED",
        "CRIADO, CREATED",
        "criado, CREATED",

        // Português com acentuação e espaços (Normalizer)
        "Aguardando Produção, WAITING_PRODUCTION",
        "aguardando produção, WAITING_PRODUCTION",
        "Em Produção, IN_PRODUCTION",
        "em produção, IN_PRODUCTION",
        "Concluído, COMPLETED",
        "concluído, COMPLETED",
        "CONCLUÍDO, COMPLETED"
    })
    void shouldConvertTextToEnum(String input, OrderStatus expected) {
      assertThat(OrderStatus.fromString(input)).isEqualTo(expected);
    }

    @ParameterizedTest(name = "Entrada nula ou em branco \"{0}\" deve retornar null")
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t", "\n"})
    void shouldReturnNullForNullOrBlankInputs(String input) {
      assertThat(OrderStatus.fromString(input)).isNull();
    }

    @ParameterizedTest(name = "Entrada inválida \"{0}\" deve lançar IllegalArgumentException")
    @ValueSource(strings = {
        "INVALID_STATUS",
        "PRODUCAO",
        "FINALIZADO",
        "PENDENTE",
        "123"
    })
    void shouldThrowIllegalArgumentExceptionForInvalidInputs(String input) {
      assertThatThrownBy(() -> OrderStatus.fromString(input))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Status de pedido inválido: " + input);
    }
  }
}


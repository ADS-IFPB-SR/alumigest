package br.edu.ifpb.alumigest.orders.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Estados do ciclo de vida de um Pedido de Venda.
 */
public enum OrderStatus {
  CREATED("Criado"),
  WAITING_PRODUCTION("Aguardando Produção"),
  IN_PRODUCTION("Em Produção"),
  COMPLETED("Concluído"),
  CANCELLED("Cancelado");

  private final String description;

  OrderStatus(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  public String getDescricao() {
    return description;
  }

  public String getLabel() {
    return description;
  }

  /**
   * Converte uma representação textual (em inglês ou português) para {@link OrderStatus}.
   *
   * @param value valor textual do status
   * @return valor enum correspondente
   */
  @JsonCreator
  public static OrderStatus fromString(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    String normalized = value.trim().toUpperCase()
            .replace(" ", "_")
            .replace("Ç", "C")
            .replace("Ã", "A")
            .replace("Í", "I");

    return switch (normalized) {
      case "WAITING_PRODUCTION", "AGUARDANDO_PRODUCAO" -> WAITING_PRODUCTION;
      case "IN_PRODUCTION", "EM_PRODUCAO" -> IN_PRODUCTION;
      case "COMPLETED", "CONCLUIDO" -> COMPLETED;
      case "CANCELLED", "CANCELADO" -> CANCELLED;
      case "CREATED", "CRIADO" -> CREATED;
      default -> {
        try {
          yield OrderStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
          throw new IllegalArgumentException("Status de pedido inválido: " + value);
        }
      }
    };
  }

  /**
   * Verifica se o pedido no estado atual pode ser cancelado.
   * Somente pedidos nos estados CREATED e WAITING_PRODUCTION permitem cancelamento.
   *
   * @return true se permitido o cancelamento, false caso contrário
   */
  public boolean canCancel() {
    return this == CREATED || this == WAITING_PRODUCTION;
  }

  public boolean podeCancelar() {
    return canCancel();
  }
}


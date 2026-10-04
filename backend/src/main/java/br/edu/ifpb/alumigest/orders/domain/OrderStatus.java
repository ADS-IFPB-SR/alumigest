package br.edu.ifpb.alumigest.orders.domain;

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


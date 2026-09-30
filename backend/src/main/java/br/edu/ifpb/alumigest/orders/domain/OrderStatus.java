package br.edu.ifpb.alumigest.orders.domain;

/**
 * Estados do ciclo de vida de um Pedido de Venda.
 */
public enum OrderStatus {
    CRIADO("Criado"),
    AGUARDANDO_PRODUCAO("Aguardando Produção"),
    EM_PRODUCAO("Em Produção"),
    CONCLUIDO("Concluído"),
    CANCELADO("Cancelado");

    private final String descricao;

    OrderStatus(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getLabel() {
        return descricao;
    }

    /**
     * Verifica se o pedido no estado atual pode ser cancelado.
     * Somente pedidos nos estados CRIADO e AGUARDANDO_PRODUCAO permitem cancelamento.
     *
     * @return true se permitido o cancelamento, false caso contrário
     */
    public boolean podeCancelar() {
        return this == CRIADO || this == AGUARDANDO_PRODUCAO;
    }
}

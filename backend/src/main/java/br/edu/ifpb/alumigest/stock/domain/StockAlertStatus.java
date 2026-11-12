package br.edu.ifpb.alumigest.stock.domain;

/**
 * Níveis de criticidade e alertas de suprimento para insumos de estoque.
 */
public enum StockAlertStatus {

    /**
     * Saldo disponível seguro e acima do ponto de pedido (🟢 Em Dia).
     */
    IN_STOCK,

    /**
     * Saldo disponível atingiu ou está abaixo da margem mínima de segurança (🟠 Ponto de Pedido).
     */
    ORDER_POINT,

    /**
     * Saldo disponível negativo gerado por demanda de O.S. no modelo Make-to-Order (🔴 Falta Insumo / Comprar).
     */
    NEED_PURCHASE
}

package br.edu.ifpb.alumigest.stock.domain;

/**
 * Níveis de criticidade e alertas de suprimento para insumos de estoque.
 *
 * <p>Encapsula pesos de prioridade para comparações de regra de negócio (SOLID / OCP),
 * garantindo que a ordenação de criticidade não dependa da ordem de declaração física das constantes.
 */
public enum StockAlertStatus {

    /**
     * Saldo disponível seguro e acima do ponto de pedido (🟢 Em Dia).
     */
    IN_STOCK(1),

    /**
     * Saldo disponível atingiu ou está abaixo da margem mínima de segurança (🟠 Ponto de Pedido).
     */
    ORDER_POINT(2),

    /**
     * Saldo disponível negativo gerado por demanda de O.S. no modelo Make-to-Order (🔴 Falta Insumo / Comprar).
     */
    NEED_PURCHASE(3);

    private final int priority;

    StockAlertStatus(int priority) {
        this.priority = priority;
    }

    public int getPriority() {
        return priority;
    }

    /**
     * Verifica se este status possui prioridade/gravidade maior que o status comparado.
     *
     * @param other outro status de estoque para comparação
     * @return {@code true} se este status for estritamente mais crítico que {@code other}
     */
    public boolean isMoreCriticalThan(StockAlertStatus other) {
        if (other == null) {
            return true;
        }
        return this.priority > other.priority;
    }
}

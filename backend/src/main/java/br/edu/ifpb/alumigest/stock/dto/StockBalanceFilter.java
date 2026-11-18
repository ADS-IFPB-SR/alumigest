package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockSortField;

/**
 * Critérios de filtragem e ordenação para consulta consolidada de saldos de estoque.
 */
public record StockBalanceFilter(
    String category,
    StockAlertStatus alertStatus,
    String search,
    Boolean needsPurchase,
    Boolean belowMinStock,
    StockSortField sort
) {

    /**
     * Retorna um filtro vazio utilizando a ordenação padrão por nome.
     *
     * @return filtro sem restrições
     */
    public static StockBalanceFilter empty() {
        return new StockBalanceFilter(null, null, null, null, null, StockSortField.NAME);
    }

    /**
     * Indica se há ao menos um filtro de reposição/compra ativo.
     *
     * @return {@code true} quando {@code needsPurchase} ou {@code belowMinStock} é verdadeiro
     */
    public boolean hasProcurementFilter() {
        return Boolean.TRUE.equals(needsPurchase) || Boolean.TRUE.equals(belowMinStock);
    }

    /**
     * Retorna o critério de ordenação efetivo, garantindo fallback seguro para {@link StockSortField#NAME}.
     *
     * @return critério de ordenação não nulo
     */
    public StockSortField effectiveSort() {
        return sort != null ? sort : StockSortField.NAME;
    }
}

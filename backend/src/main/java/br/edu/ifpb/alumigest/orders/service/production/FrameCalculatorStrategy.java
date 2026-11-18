package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.orders.domain.OrderItem;

public interface FrameCalculatorStrategy {

    /**
     * Define se esta regra matemática suporta calcular a lista de corte deste produto.
     * Geralmente valida pelo Template Config ou pelo Nome do Produto (ex: JAN-SUPREMA-2F).
     */
    boolean supports(OrderItem item);

    /**
     * Extrai as dimensões da ordem de serviço, aplica deduções e injeta na ficha técnica.
     */
    void calculateCuts(OrderItem item, ProductionSheetBuilder sheetBuilder);
}
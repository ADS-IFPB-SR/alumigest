package br.edu.ifpb.alumigest.stock.service;

import br.edu.ifpb.alumigest.orders.domain.OrderCompletedEvent;
import br.edu.ifpb.alumigest.orders.domain.OrderMaterialsReservationEvent;
import br.edu.ifpb.alumigest.orders.domain.OrderStockCancelledEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listener síncrono de eventos do ciclo de vida de Ordens de Serviço.
 *
 * <p>Executa na mesma fronteira transacional do serviço de pedidos (RN-02) para garantir
 * atomicidade entre transição de status da O.S. e movimentações de estoque.
 */
@Component
public class StockOrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(StockOrderEventListener.class);

    private final StockPort stockPort;

    public StockOrderEventListener(StockPort stockPort) {
        this.stockPort = stockPort;
    }

    /**
     * Reserva matérias-primas automaticamente (Make-to-Order) quando a O.S. é aprovada/convertida
     * ou transiciona para {@code WAITING_PRODUCTION}.
     *
     * @param event evento de reserva de materiais da ordem
     */
    @EventListener
    public void onOrderMaterialsReservation(OrderMaterialsReservationEvent event) {
        if (event == null || event.orderId() == null) {
            return;
        }
        log.info("Executando reserva automática Make-to-Order de estoque para O.S.: {}", event.orderId());
        stockPort.reserveMaterials(event.orderId());
    }

    /**
     * Realiza baixa física definitiva dos materiais reservados ao concluir uma O.S.
     *
     * @param event evento de conclusão da ordem
     */
    @EventListener
    public void onOrderCompleted(OrderCompletedEvent event) {
        if (event == null || event.orderId() == null) {
            return;
        }
        log.info("Executando baixa física de estoque para O.S. concluída: {}", event.orderId());
        stockPort.consumeReservedMaterialsForOrder(event.orderId());
    }

    /**
     * Estorna reservas de materiais quando uma O.S. é formalmente cancelada.
     *
     * @param event evento de cancelamento da ordem
     */
    @EventListener
    public void onOrderStockCancelled(OrderStockCancelledEvent event) {
        if (event == null || event.orderId() == null) {
            return;
        }
        log.info("Estornando reservas de estoque para O.S. cancelada: {}", event.orderId());
        stockPort.cancelReservationsForOrder(event.orderId());
    }
}


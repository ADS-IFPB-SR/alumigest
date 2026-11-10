package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.orders.domain.OrderCancelledEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listener de eventos responsável por escutar cancelamentos de Ordens de Serviço
 * e acionar a reabertura automática do orçamento de origem para rascunho (DRAFT).
 */
@Component
public class BudgetOrderEventListener {

  private static final Logger log = LoggerFactory.getLogger(BudgetOrderEventListener.class);

  private final BudgetService budgetService;

  /**
   * Cria o listener com injeção por construtor do serviço de orçamentos.
   *
   * @param budgetService serviço responsável pelas regras de transição de orçamentos
   */
  public BudgetOrderEventListener(BudgetService budgetService) {
    this.budgetService = budgetService;
  }

  /**
   * Processa o evento de cancelamento de uma Ordem de Serviço tentando reabrir
   * o orçamento vinculado caso ele esteja elegível.
   *
   * @param event evento contendo o identificador do orçamento vinculado
   */
  @EventListener
  public void onOrderCancelled(OrderCancelledEvent event) {
    if (event == null || event.orcamentoId() == null) {
      return;
    }

    if (budgetService.reabrirOrcamentoSeElegivel(event.orcamentoId())) {
      log.info(
          "Orçamento ID {} reaberto para DRAFT após cancelamento da OS.",
          event.orcamentoId());
    }
  }
}

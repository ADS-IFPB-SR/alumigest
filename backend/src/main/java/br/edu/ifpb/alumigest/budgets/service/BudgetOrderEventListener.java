package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.orders.domain.OrderCancelledEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BudgetOrderEventListener {

    private final BudgetService budgetService;

    public BudgetOrderEventListener(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        if (event.orcamentoId() != null) {
            budgetService.reabrirOrcamento(event.orcamentoId());
        }
    }
}
package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.OrderCancelledEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BudgetOrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(BudgetOrderEventListener.class);

    private final BudgetService budgetService;

    // Construtor explícito para injeção pelo Spring (evita conflitos com campos estáticos e final)
    public BudgetOrderEventListener(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @EventListener
    public void onOrderCancelled(OrderCancelledEvent event) {
        if (event.orcamentoId() == null) {
            return;
        }

        try {
            budgetService.reabrirOrcamento(event.orcamentoId());
            log.info("Orçamento ID {} reaberto para DRAFT após cancelamento da OS.", event.orcamentoId());
        } catch (BusinessException ex) {
            log.warn("Não foi possível reabrir o orçamento ID {} após cancelamento da OS: {}",
                    event.orcamentoId(), ex.getMessage());
        }
    }
}
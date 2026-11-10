package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.OrderCancelledEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class BudgetOrderEventListenerTest {

    @Mock
    private BudgetService budgetService;

    @InjectMocks
    private BudgetOrderEventListener listener;

    @Test
    @DisplayName("Deve reabrir o orçamento para DRAFT quando orcamentoId não for nulo")
    void shouldReopenBudgetWhenOrcamentoIdIsNotNull() {
        UUID orcamentoId = UUID.randomUUID();
        OrderCancelledEvent event = new OrderCancelledEvent(orcamentoId);

        listener.onOrderCancelled(event);

        verify(budgetService).reabrirOrcamento(orcamentoId);
    }

    @Test
    @DisplayName("Não deve acionar BudgetService quando orcamentoId for nulo")
    void shouldNotReopenBudgetWhenOrcamentoIdIsNull() {
        OrderCancelledEvent event = new OrderCancelledEvent(null);

        listener.onOrderCancelled(event);

        verifyNoInteractions(budgetService);
        verify(budgetService, never()).reabrirOrcamento(any());
    }

    @Test
    @DisplayName("Deve capturar BusinessException e não propagar erro caso o orçamento já não esteja em APPROVED")
    void shouldCatchBusinessExceptionWhenBudgetIsNotApproved() {
        UUID orcamentoId = UUID.randomUUID();
        OrderCancelledEvent event = new OrderCancelledEvent(orcamentoId);

        doThrow(new BusinessException("Orçamento não está com status APPROVED"))
                .when(budgetService).reabrirOrcamento(orcamentoId);

        assertThatCode(() -> listener.onOrderCancelled(event))
                .doesNotThrowAnyException();

        verify(budgetService).reabrirOrcamento(orcamentoId);
    }
}
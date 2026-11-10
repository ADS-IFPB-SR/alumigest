package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.orders.domain.OrderCancelledEvent;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
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
  @DisplayName("Deve reabrir o orçamento para DRAFT quando orcamentoId for elegível")
  void shouldReopenBudgetWhenOrcamentoIdIsNotNullAndEligible() {
    UUID orcamentoId = UUID.randomUUID();
    OrderCancelledEvent event = new OrderCancelledEvent(orcamentoId);
    given(budgetService.reabrirOrcamentoSeElegivel(orcamentoId)).willReturn(true);

    assertThatCode(() -> listener.onOrderCancelled(event))
        .doesNotThrowAnyException();

    verify(budgetService).reabrirOrcamentoSeElegivel(orcamentoId);
  }

  @Test
  @DisplayName("Deve concluir normalmente sem erro quando orçamento não estiver elegível para reabertura")
  void shouldCompleteGracefullyWhenBudgetIsNotEligible() {
    UUID orcamentoId = UUID.randomUUID();
    OrderCancelledEvent event = new OrderCancelledEvent(orcamentoId);
    given(budgetService.reabrirOrcamentoSeElegivel(orcamentoId)).willReturn(false);

    assertThatCode(() -> listener.onOrderCancelled(event))
        .doesNotThrowAnyException();

    verify(budgetService).reabrirOrcamentoSeElegivel(orcamentoId);
  }

  @Test
  @DisplayName("Não deve acionar BudgetService quando orcamentoId for nulo")
  void shouldNotReopenBudgetWhenOrcamentoIdIsNull() {
    OrderCancelledEvent event = new OrderCancelledEvent(null);

    listener.onOrderCancelled(event);

    verifyNoInteractions(budgetService);
    verify(budgetService, never()).reabrirOrcamentoSeElegivel(any());
  }

  @Test
  @DisplayName("Não deve acionar BudgetService quando evento for nulo")
  void shouldNotReopenBudgetWhenEventIsNull() {
    listener.onOrderCancelled(null);

    verifyNoInteractions(budgetService);
  }
}

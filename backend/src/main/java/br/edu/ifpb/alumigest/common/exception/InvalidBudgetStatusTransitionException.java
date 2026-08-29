package br.edu.ifpb.alumigest.common.exception;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;

public class InvalidBudgetStatusTransitionException extends BusinessException {
    public InvalidBudgetStatusTransitionException(BudgetStatus current, BudgetStatus target) {
        super(String.format("Transição de status inválida: não é possível mudar de %s para %s.", current, target));
    }
}
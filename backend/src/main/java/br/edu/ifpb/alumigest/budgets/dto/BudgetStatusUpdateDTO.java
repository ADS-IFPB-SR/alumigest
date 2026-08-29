package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import jakarta.validation.constraints.NotNull;

public record BudgetStatusUpdateDTO(
        @NotNull(message = "O novo status é obrigatório")
        BudgetStatus status
) {}
package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;

/**
 * Record DTO para transição e alteração de status de orçamento.
 * [US-09.15]
 */
public record StatusChangeRequest(
        @NotNull(message = "Novo status é obrigatório")
        @JsonAlias({"status", "newStatus"})
        BudgetStatus novoStatus
) {
    @JsonIgnore
    public BudgetStatus status() {
        return novoStatus;
    }
}

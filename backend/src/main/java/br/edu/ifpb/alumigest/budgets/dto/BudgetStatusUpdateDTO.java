package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para atualização de status de orçamento.
 * Mantido como alias/compatibilidade com {@link StatusChangeRequest}.
 *
 * @deprecated desde US-09.15. Use {@link StatusChangeRequest} diretamente.
 */
@Deprecated(since = "US-09.15", forRemoval = true)
public record BudgetStatusUpdateDTO(
        @NotNull(message = "Novo status é obrigatório")
        @JsonAlias({"status", "newStatus"})
        BudgetStatus novoStatus
) {
    @JsonIgnore
    public BudgetStatus status() {
        return novoStatus;
    }

    public StatusChangeRequest toStatusChangeRequest() {
        return new StatusChangeRequest(novoStatus);
    }
}
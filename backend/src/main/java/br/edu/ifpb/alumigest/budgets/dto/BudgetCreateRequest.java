package br.edu.ifpb.alumigest.budgets.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BudgetCreateRequest(
    
    @NotNull(message = "ID do cliente é obrigatório")
    UUID clientId,
    
    String observacoes
    
) {}
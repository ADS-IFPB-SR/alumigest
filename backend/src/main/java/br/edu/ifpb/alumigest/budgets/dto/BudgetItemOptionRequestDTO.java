package br.edu.ifpb.alumigest.budgets.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record BudgetItemOptionRequestDTO(
        @NotNull(message = "O ID do material é obrigatório")
        UUID materialId,

        @NotNull(message = "A quantidade do insumo é obrigatória")
        @Positive(message = "A quantidade do insumo deve ser maior que zero")
        BigDecimal quantity,

        String selectedType,
        String selectedColor
) {}
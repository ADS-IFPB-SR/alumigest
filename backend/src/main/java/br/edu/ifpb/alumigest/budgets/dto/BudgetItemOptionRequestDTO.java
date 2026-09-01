package br.edu.ifpb.alumigest.budgets.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.UUID;

public record BudgetItemOptionRequestDTO(
        @NotNull(message = "O ID do material é obrigatório")
        UUID materialId,

        br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType categoryType,

        @PositiveOrZero(message = "A quantidade do insumo não pode ser negativa")
        BigDecimal quantity,

        String selectedType,
        String selectedColor
) {}
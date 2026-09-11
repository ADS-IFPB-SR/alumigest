package br.edu.ifpb.alumigest.budgets.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BudgetItemCalculationRequestDTO(
        String templateType,

        @NotNull(message = "A largura é obrigatória")
        @Positive(message = "A largura deve ser positiva")
        BigDecimal widthMm,

        @NotNull(message = "A altura é obrigatória")
        @Positive(message = "A altura deve ser positiva")
        BigDecimal heightMm,

        @Min(value = 1, message = "A quantidade de esquadrias deve ser de no mínimo 1")
        Integer quantity,

        @Valid
        List<BudgetItemOptionCalculationDTO> options
) {
    public record BudgetItemOptionCalculationDTO(
            UUID materialId,

            @NotBlank(message = "A categoria do material é obrigatória")
            String categoryType,

            @PositiveOrZero(message = "A quantidade manual do insumo não pode ser negativa")
            BigDecimal manualQuantity
    ) {}
}

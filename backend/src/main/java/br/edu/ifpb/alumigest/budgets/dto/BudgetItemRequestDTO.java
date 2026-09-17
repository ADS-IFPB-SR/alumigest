package br.edu.ifpb.alumigest.budgets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BudgetItemRequestDTO(
        @NotNull(message = "O ID do produto (esquadria) é obrigatório")
        UUID productId,

        @NotNull(message = "A largura é obrigatória")
        @Positive(message = "A largura (widthMm) deve ser estritamente positiva")
        @JsonAlias({"larguraMm", "width"})
        BigDecimal widthMm,

        @NotNull(message = "A altura é obrigatória")
        @Positive(message = "A altura (heightMm) deve ser estritamente positiva")
        @JsonAlias({"alturaMm", "height"})
        BigDecimal heightMm,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade de itens deve ser pelo menos 1")
        @JsonAlias("quantidade")
        Integer quantity,

        @NotNull(message = "O custo de mão-de-obra é obrigatório")
        @PositiveOrZero(message = "O custo de mão-de-obra não pode ser negativo")
        @JsonAlias("valorUnitario")
        BigDecimal laborCost,

        String templateType,
        String templateConfig,
        @JsonAlias("ferragens")
        String handleConfig,
        String drillingConfig,
        @JsonAlias("descricao")
        String notes,

        @Valid
        List<BudgetItemOptionRequestDTO> options
) {}
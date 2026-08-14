package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório")
        String name,

        @NotNull(message = "A categoria é obrigatória")
        UUID categoryId,

        @NotNull(message = "O custo de mão de obra é obrigatório")
        @PositiveOrZero(message = "O custo não pode ser negativo")
        BigDecimal laborCost,

        @NotEmpty(message = "A ficha técnica deve conter pelo menos um material")
        @Valid
        List<ProductItemRequestDTO> items
) {}
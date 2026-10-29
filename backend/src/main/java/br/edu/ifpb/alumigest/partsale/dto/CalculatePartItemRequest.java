package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

/**
 * DTO para pré-cálculo de item avulso de venda de partes.
 */
public record CalculatePartItemRequest(
    @NotNull(message = "A categoria do material é obrigatória")
    MaterialCategoryType category,

    Integer widthMm,

    Integer heightMm,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    Integer quantity,

    @NotNull(message = "O preço unitário é obrigatório")
    @Positive(message = "O preço unitário deve ser maior que zero")
    BigDecimal unitPrice,

    BigDecimal lossFactor
) {}

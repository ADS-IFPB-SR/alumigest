package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Payload de criação de um item dentro da venda avulsa.
 */
public record CreatePartSaleItemRequest(
    @NotNull(message = "Tipo de material é obrigatório")
    MaterialCategoryType materialType,

    @NotNull(message = "ID de referência do material é obrigatório")
    UUID referenceId,

    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser positiva")
    Integer quantity,

    Integer widthMm,

    Integer heightMm,

    @NotNull(message = "Preço unitário é obrigatório")
    @PositiveOrZero(message = "Preço unitário não pode ser negativo")
    BigDecimal unitPrice
) {}

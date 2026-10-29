package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CalculatePartItemRequestDTO(
    @NotNull(message = "O ID do material é obrigatório")
    UUID materialId,

    @NotNull(message = "O tipo de material é obrigatório")
    PartMaterialType materialType,

    @NotNull(message = "A largura é obrigatória")
    @Positive(message = "A largura em milímetros deve ser maior que zero")
    Integer widthMm,

    @NotNull(message = "A altura é obrigatória")
    @Positive(message = "A altura em milímetros deve ser maior que zero")
    Integer heightMm,

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade mínima é 1")
    Integer quantity,

    BigDecimal lossFactor
) {}
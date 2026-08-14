package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductItemRequestDTO(
        @NotNull(message = "O ID do material é obrigatório")
        UUID materialId,

        @NotNull(message = "A quantidade consumida é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        BigDecimal quantity
) {}
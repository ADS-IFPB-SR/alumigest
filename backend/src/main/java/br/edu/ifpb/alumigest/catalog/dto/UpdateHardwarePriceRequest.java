package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record UpdateHardwarePriceRequest(
        @NotNull(message = "O preço unitário é obrigatório")
        @PositiveOrZero(message = "O preço unitário deve ser maior ou igual a zero")
        BigDecimal unitPrice
) {
}

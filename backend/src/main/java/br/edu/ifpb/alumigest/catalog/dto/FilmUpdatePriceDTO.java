package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record FilmUpdatePriceDTO(
        @NotNull(message = "O preço de venda é obrigatório")
        @Positive(message = "O preço por m² deve ser maior que zero")
        BigDecimal salePrice
) {
}
package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record GlassUpdateDTO(
        @NotBlank(message = "O nome do vidro é obrigatório.")
        String name,

        @NotNull(message = "O preço de venda é obrigatório.")
        @Positive(message = "O preço de venda deve ser maior que zero.")
        BigDecimal salePrice
) {}
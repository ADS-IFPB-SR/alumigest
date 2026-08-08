package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record GlassCreateDTO(
        @NotBlank(message = "O nome do vidro é obrigatório.")
        String name,

        @NotBlank(message = "A cor/acabamento do vidro é obrigatória.")
        String colorFinish,

        @NotNull(message = "A espessura é obrigatória.")
        BigDecimal thicknessMm,

        @NotNull(message = "O preço de custo é obrigatório.")
        @Positive(message = "O preço de custo deve ser maior que zero.")
        BigDecimal costPrice,

        @NotNull(message = "O preço de venda é obrigatório.")
        @Positive(message = "O preço de venda deve ser maior que zero.")
        BigDecimal salePrice
) {}
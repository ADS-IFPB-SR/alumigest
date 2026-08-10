package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record FilmRequestDTO(
        @NotBlank(message = "O nome da película é obrigatório")
        String name,

        @NotBlank(message = "A cor/acabamento é obrigatória")
        String colorFinish,

        @NotNull(message = "O preço de venda é obrigatório")
        @Positive(message = "O preço por m² deve ser maior que zero")
        BigDecimal salePrice,

        @NotBlank(message = "A ref. comercial é obrigatoria. Ex: PEL-G20")
        String commercialReference,

        String ncmCode,

        @NotNull(message = "O preço de custo é obrigatório")
        @PositiveOrZero(message = "O preço de custo não pode ser negativo") // um prod pode ser cadastrado sem ainda ter um valor
        BigDecimal costPrice,

        @NotNull(message = "A expessura do prod é obrigatória. Ex: 0.08 mm")
        @Positive(message = "A espessura deve ser maior que zero")
        BigDecimal thicknessMm,

        @NotNull(message = "O comprimento do prod é obrigatório. Ex: 250cm") //Analisar qual será a unidade de medida
        @Positive(message = "O comprimento deve ser maior que zero")
        BigDecimal standardLengthM

) {
}
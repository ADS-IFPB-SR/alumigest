package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record FilmUpdatePriceDTO(
        @jakarta.validation.constraints.NotBlank(message = "O nome é obrigatório")
        @jakarta.validation.constraints.Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @jakarta.validation.constraints.Size(max = 50, message = "A referência comercial deve ter no máximo 50 caracteres")
        String commercialReference,

        @jakarta.validation.constraints.NotBlank(message = "A cor/acabamento é obrigatória")
        @jakarta.validation.constraints.Size(max = 50, message = "A cor deve ter no máximo 50 caracteres")
        String colorFinish,

        @NotNull(message = "O preço de custo é obrigatório")
        @Positive(message = "O preço de custo deve ser maior que zero")
        BigDecimal costPrice,

        @NotNull(message = "O preço de venda é obrigatório")
        @Positive(message = "O preço por m² deve ser maior que zero")
        BigDecimal salePrice,
        
        @jakarta.validation.constraints.Pattern(regexp = "^\\d{8}$", message = "O código NCM deve conter exatamente 8 dígitos numéricos")
        String ncmCode,
        
        @NotNull(message = "A expessura do prod é obrigatória. Ex: 0.08 mm")
        @Positive(message = "A espessura deve ser maior que zero")
        BigDecimal thicknessMm,

        @NotNull(message = "O comprimento do prod é obrigatório. Ex: 250cm")
        @Positive(message = "O comprimento deve ser maior que zero")
        BigDecimal standardLengthM,
        
        @NotNull(message = "A largura máxima da bobina é obrigatória")
        @Positive(message = "A largura máxima deve ser maior que zero")
        BigDecimal maxWidthMm,
        
        Boolean active
) {
}
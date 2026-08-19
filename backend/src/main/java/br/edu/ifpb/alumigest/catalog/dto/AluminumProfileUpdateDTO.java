package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record AluminumProfileUpdateDTO(
        @jakarta.validation.constraints.NotBlank(message = "A referência comercial é obrigatória")
        @jakarta.validation.constraints.Size(max = 50, message = "A referência comercial deve ter no máximo 50 caracteres")
        String commercialReference,

        @jakarta.validation.constraints.NotBlank(message = "O nome é obrigatório")
        @jakarta.validation.constraints.Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @jakarta.validation.constraints.NotBlank(message = "A cor/acabamento é obrigatória")
        @jakarta.validation.constraints.Size(max = 50, message = "A cor deve ter no máximo 50 caracteres")
        String colorFinish,

        @jakarta.validation.constraints.Size(max = 50, message = "A linha comercial deve ter no máximo 50 caracteres")
        String commercialLine,

        @NotNull(message = "O peso é obrigatório")
        @jakarta.validation.constraints.Positive(message = "O peso deve ser maior que zero")
        BigDecimal weight,

        @NotNull(message = "O comprimento padrão da barra é obrigatório")
        @PositiveOrZero(message = "O comprimento padrão deve ser maior ou igual a zero")
        BigDecimal standardLengthM,

        @NotNull(message = "O preço de custo é obrigatório")
        @PositiveOrZero(message = "O preço de custo deve ser maior ou igual a zero")
        BigDecimal costPrice,

        @NotNull(message = "O preço de venda é obrigatório")
        @PositiveOrZero(message = "O preço de venda deve ser maior ou igual a zero")
        BigDecimal salePrice,
        
        Boolean active
) {
}

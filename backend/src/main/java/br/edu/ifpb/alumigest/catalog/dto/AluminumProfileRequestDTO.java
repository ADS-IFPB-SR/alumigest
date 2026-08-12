package br.edu.ifpb.alumigest.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AluminumProfileRequestDTO(

        @NotBlank(message = "O nome do perfil é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @NotBlank(message = "A referência comercial é obrigatória")
        @Size(max = 100, message = "A referência comercial deve ter no máximo 100 caracteres")
        String commercialReference,

        @Size(max = 10, message = "O código NCM deve ter no máximo 10 caracteres")
        String ncmCode,

        @NotBlank(message = "A cor/acabamento é obrigatória")
        @Size(max = 50, message = "A cor/acabamento deve ter no máximo 50 caracteres")
        String colorFinish,

        @NotNull(message = "O comprimento padrão da barra é obrigatório")
        @Positive(message = "O comprimento padrão deve ser maior que zero")
        BigDecimal standardLengthM,

        @NotNull(message = "O preço de custo é obrigatório")
        @PositiveOrZero(message = "O preço de custo deve ser maior ou igual a zero")
        BigDecimal costPrice,

        @NotNull(message = "O preço de venda é obrigatório")
        @PositiveOrZero(message = "O preço de venda deve ser maior ou igual a zero")
        BigDecimal salePrice
) {
}

package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO de criação de ferragem/acessório.
 * A ferragem é persistida como {@code Material} vinculado ao grupo nativo {@code FERRAGEM}.
 */
public record HardwareRequestDTO(

        @NotBlank(message = "O código SKU é obrigatório")
        @Size(max = 50, message = "O código SKU deve ter no máximo 50 caracteres")
        String skuCode,

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @NotNull(message = "A unidade de medida é obrigatória")
        UnitMeasure unitMeasure,

        @NotNull(message = "O tipo de cálculo é obrigatório")
        CalculationType calculationType,

        @NotNull(message = "O preço de custo é obrigatório")
        @PositiveOrZero(message = "O preço de custo deve ser maior ou igual a zero")
        BigDecimal costPrice,

        @NotNull(message = "O preço de venda é obrigatório")
        @PositiveOrZero(message = "O preço de venda deve ser maior ou igual a zero")
        BigDecimal salePrice,

        @jakarta.validation.constraints.Pattern(regexp = "^\\d{8}$", message = "O código NCM deve conter exatamente 8 dígitos numéricos")
        String ncmCode
) {
}

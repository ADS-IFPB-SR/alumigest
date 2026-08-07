package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.entity.CalculationType;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CreateHardwareRequest(
        @NotBlank(message = "O código é obrigatório")
        String code,

        @NotBlank(message = "O nome é obrigatório")
        String name,

        @NotNull(message = "A unidade é obrigatória")
        UnitType unit,

        @NotNull(message = "O tipo de cálculo é obrigatório")
        CalculationType calculationType,

        @NotNull(message = "O preço unitário é obrigatório")
        @PositiveOrZero(message = "O preço unitário deve ser maior ou igual a zero")
        BigDecimal unitPrice
) {
}

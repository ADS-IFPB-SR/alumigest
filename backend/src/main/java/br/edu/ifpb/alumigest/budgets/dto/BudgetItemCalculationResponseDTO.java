package br.edu.ifpb.alumigest.budgets.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BudgetItemCalculationResponseDTO(
        BigDecimal physicalAreaM2,
        BigDecimal physicalPerimeterM,
        List<BudgetItemOptionCalculationResultDTO> options
) {
    public record BudgetItemOptionCalculationResultDTO(
            UUID materialId,
            String categoryType,
            BigDecimal suggestedQuantity,
            BigDecimal physicalMinimumQuantity,
            boolean isBelowPhysicalMinimum,
            String warningMessage
    ) {}
}

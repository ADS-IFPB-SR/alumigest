package br.edu.ifpb.alumigest.budgets.dto;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;

import java.math.BigDecimal;
import java.util.UUID;


public record BudgetItemOptionResponseDTO(
        UUID id,
        UUID materialId,
        String materialName,
        String unitMeasure,
        MaterialCategoryType categoryType,
        String selectedType,
        String selectedColor,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
) {}
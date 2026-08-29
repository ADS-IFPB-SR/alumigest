package br.edu.ifpb.alumigest.budgets.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BudgetItemResponseDTO(
        UUID id,
        UUID productId,
        String productName,
        String templateType,
        String templateConfig,
        String handleConfig,
        String drillingConfig,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer quantity,
        BigDecimal laborCost,
        BigDecimal subtotal,
        String notes,
        List<BudgetItemOptionResponseDTO> options
) {}
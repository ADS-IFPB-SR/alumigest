package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BudgetResponseDTO(
        UUID id,
        String code,
        UUID clientId,
        String clientName,
        BigDecimal subtotal,
        BigDecimal discountPercent,
        BigDecimal discountValue,
        BigDecimal total,
        BudgetStatus status,
        String notes,
        OffsetDateTime validUntil,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<BudgetItemResponseDTO> items
) {}
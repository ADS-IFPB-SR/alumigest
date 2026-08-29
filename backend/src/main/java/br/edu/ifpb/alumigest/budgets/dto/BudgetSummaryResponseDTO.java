package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BudgetSummaryResponseDTO(
        UUID id,
        String code,
        String clientName,
        BigDecimal total,
        BudgetStatus status,
        OffsetDateTime validUntil,
        OffsetDateTime createdAt
) {}
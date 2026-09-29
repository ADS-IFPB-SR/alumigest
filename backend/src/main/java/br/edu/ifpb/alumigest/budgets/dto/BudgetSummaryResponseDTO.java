package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BudgetSummaryResponseDTO(
        UUID id,
        String code,
        String clientName,
        Integer totalItems,
        BigDecimal total,
        BudgetStatus status,
        OffsetDateTime validUntil,
        OffsetDateTime createdAt,
        boolean expired
) {
    @JsonProperty("itemCount")
    public Integer getItemCount() {
        return totalItems;
    }

    @JsonProperty("isExpired")
    public boolean getIsExpired() {
        return expired;
    }
}

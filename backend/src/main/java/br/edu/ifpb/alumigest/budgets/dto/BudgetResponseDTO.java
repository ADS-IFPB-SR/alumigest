package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BudgetResponseDTO(
        UUID id,
        String code,
        UUID clientId,
        String clientName,
        String clientPhone,
        String clientEmail,
        String clientAddress,
        BigDecimal subtotal,
        BigDecimal discountPercent,
        BigDecimal discountValue,
        BigDecimal total,
        PaymentCondition paymentCondition,
        String paymentConditionLabel,
        String paymentNotes,
        BudgetStatus status,
        String statusLabel,
        String notes,
        OffsetDateTime validUntil,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        boolean expired,
        List<BudgetItemResponseDTO> items
) {
    // 👈 Construtor de compatibilidade para os testes antigos (19 argumentos)
    public BudgetResponseDTO(
            UUID id,
            String code,
            UUID clientId,
            String clientName,
            BigDecimal subtotal,
            BigDecimal discountPercent,
            BigDecimal discountValue,
            BigDecimal total,
            PaymentCondition paymentCondition,
            String paymentConditionLabel,
            String paymentNotes,
            BudgetStatus status,
            String statusLabel,
            String notes,
            OffsetDateTime validUntil,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            boolean expired,
            List<BudgetItemResponseDTO> items
    ) {
        this(id, code, clientId, clientName, null, null, null, 
             subtotal, discountPercent, discountValue, total, 
             paymentCondition, paymentConditionLabel, paymentNotes, 
             status, statusLabel, notes, validUntil, createdAt, updatedAt, expired, items);
    }

    @JsonProperty("commercialConditions")
    public String commercialConditions() {
        return paymentNotes;
    }
}
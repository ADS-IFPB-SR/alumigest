package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BudgetResponseDTO(
        UUID id,
        String code,
        
        // Dados resumidos do cliente
        UUID clientId,
        String clientName,
        
        // Totais detalhados
        BigDecimal subtotal,
        BigDecimal discountPercent,
        BigDecimal discountValue,
        BigDecimal total,
        
        // Condições Comerciais (Novos campos)
        PaymentCondition paymentCondition,
        String paymentConditionLabel,
        String paymentNotes,
        
        // Status e Validade
        BudgetStatus status,
        String statusLabel,
        String notes,
        OffsetDateTime validUntil,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        boolean expired, // Indicador de expiração
        
        // Itens
        List<BudgetItemResponseDTO> items
) {}
package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BudgetRequestDTO(
        @NotNull(message = "O ID do cliente é obrigatório")
        UUID clientId,

        @DecimalMin(value = "0.0", message = "O percentual de desconto não pode ser negativo")
        BigDecimal discountPercent,

        String notes,

        OffsetDateTime validUntil,

        @NotEmpty(message = "O orçamento deve conter pelo menos um item")
        @Valid
        List<BudgetItemRequestDTO> items,

        @JsonAlias("paymentCondition")
        PaymentCondition paymentCondition,

        @JsonAlias({"commercialConditions", "paymentNotes"})
        String commercialConditions
) {
    public BudgetRequestDTO(UUID clientId, BigDecimal discountPercent, String notes, List<BudgetItemRequestDTO> items) {
        this(clientId, discountPercent, notes, null, items, null, null);
    }
}
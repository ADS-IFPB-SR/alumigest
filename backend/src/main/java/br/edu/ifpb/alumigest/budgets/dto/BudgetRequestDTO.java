package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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
        @JsonProperty("clientId")
        @JsonAlias({"customerId", "customer_id"})
        UUID clientId,

        @DecimalMin(value = "0.0", message = "O percentual de desconto não pode ser negativo")
        @JsonProperty("discountPercent")
        BigDecimal discountPercent,

        @JsonProperty("notes")
        @JsonAlias("observacoes")
        String notes,

        @JsonProperty("validUntil")
        OffsetDateTime validUntil,

        @NotEmpty(message = "O orçamento deve conter pelo menos um item")
        @Valid
        @JsonProperty("items")
        @JsonAlias("itens")
        List<BudgetItemRequestDTO> items,

        @JsonProperty("paymentCondition")
        @JsonAlias({"condicaoPagamento", "payment_condition"})
        PaymentCondition paymentCondition,

        @JsonProperty("commercialConditions")
        @JsonAlias({"paymentNotes", "observacoesPagamento"})
        String commercialConditions
) {
    public BudgetRequestDTO(UUID clientId, BigDecimal discountPercent, String notes, List<BudgetItemRequestDTO> items) {
        this(clientId, discountPercent, notes, null, items, null, null);
    }

    public String paymentNotes() {
        return commercialConditions;
    }
}
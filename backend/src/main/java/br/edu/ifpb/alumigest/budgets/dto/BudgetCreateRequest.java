package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BudgetCreateRequest(
        @NotNull(message = "O ID do cliente é obrigatório")
        @JsonAlias({"customerId", "customer_id", "clientId"})
        UUID clientId,

        String observacoes,

        String notes,

        @JsonAlias("discountPercent")
        BigDecimal discountPercent,

        @JsonAlias("discountType")
        String discountType,

        @JsonAlias("discountInput")
        BigDecimal discountInput,

        @JsonAlias("paymentCondition")
        PaymentCondition paymentCondition,

        @JsonAlias("commercialConditions")
        String commercialConditions,

        @JsonAlias("validUntil")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime validUntil,

        @Valid
        @JsonAlias({"items", "itens"})
        List<BudgetItemRequestDTO> items
) {
    // 👈 Atribui a string tanto a observacoes quanto a notes para o teste funcionar
    public BudgetCreateRequest(UUID clientId, String observacoes) {
        this(clientId, observacoes, observacoes, null, null, null, null, null, null, null);
    }

    @JsonCreator
    public BudgetCreateRequest(
            @JsonProperty("clientId") @JsonAlias({"customerId", "customer_id"}) UUID clientId,
            @JsonProperty("observacoes") String observacoes,
            @JsonProperty("notes") String notes,
            @JsonProperty("discountPercent") BigDecimal discountPercent,
            @JsonProperty("discountType") String discountType,
            @JsonProperty("discountInput") BigDecimal discountInput,
            @JsonProperty("paymentCondition") PaymentCondition paymentCondition,
            @JsonProperty("commercialConditions") @JsonAlias("paymentNotes") String commercialConditions,
            @JsonProperty("validUntil") OffsetDateTime validUntil,
            @JsonProperty("items") @JsonAlias("itens") List<BudgetItemRequestDTO> items
    ) {
        this.clientId = clientId;
        this.observacoes = observacoes;
        this.notes = notes;
        this.discountPercent = discountPercent;
        this.discountType = discountType;
        this.discountInput = discountInput;
        this.paymentCondition = paymentCondition;
        this.commercialConditions = commercialConditions;
        this.validUntil = validUntil;
        this.items = items;
    }
}
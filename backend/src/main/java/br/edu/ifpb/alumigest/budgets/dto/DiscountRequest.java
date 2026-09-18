package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DiscountRequest(
        @NotNull(message = "Tipo de desconto é obrigatório")
        DiscountType tipoDesconto,

        @NotNull(message = "Valor do desconto é obrigatório")
        @PositiveOrZero(message = "Valor do desconto não pode ser negativo")
        BigDecimal valor,

        @NotNull(message = "Condição de pagamento é obrigatória")
        PaymentCondition condicaoPagamento,

        @Size(max = 500, message = "As observações de pagamento não podem exceder 500 caracteres")
        String observacoesPagamento,

        @FutureOrPresent(message = "A data de validade não pode ser anterior a hoje")
        LocalDate dataValidade
) {}

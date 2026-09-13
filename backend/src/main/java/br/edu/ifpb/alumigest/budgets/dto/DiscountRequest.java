package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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

        String observacoesPagamento,

        LocalDate dataValidade
) {}

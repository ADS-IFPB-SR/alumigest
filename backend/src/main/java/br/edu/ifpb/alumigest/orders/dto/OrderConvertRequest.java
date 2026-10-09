package br.edu.ifpb.alumigest.orders.dto;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO imutável (Record) para conversão de orçamento em pedido de venda.
 */
public record OrderConvertRequest(
    @NotNull(message = "O canal de aprovação é obrigatório.")
    ApprovalChannel canalAprovacao,

    @NotNull(message = "A data de previsão de entrega é obrigatória.")
    @FutureOrPresent(message = "A data de previsão de entrega não pode ser retroativa.")
    LocalDate dataPrevisaoEntrega,

    String observacoes
) {
}

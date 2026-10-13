package br.edu.ifpb.alumigest.orders.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO imutável (Record) para cancelamento formal de um pedido de venda.
 */
public record OrderCancelRequest(
    @NotBlank(message = "A justificativa de cancelamento é obrigatória.")
    @Size(
        min = 10,
        max = 1000,
        message = "A justificativa de cancelamento deve ter entre 10 e 1000 caracteres."
    )
    String justificativa
) {
}

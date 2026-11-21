package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Resumo de orçamento para a aba de propostas do Hub 360° do Cliente")
public record ClientBudgetSummaryDto(
        @Schema(description = "Identificador único do orçamento (UUID)")
        UUID id,

        @Schema(description = "Código legível do orçamento (ex: ORC-2026-0001)")
        String codigo,

        @Schema(description = "Data de criação do orçamento")
        OffsetDateTime dataCriacao,

        @Schema(description = "Data limite de validade do orçamento")
        OffsetDateTime dataValidade,

        @Schema(description = "Valor total da proposta")
        BigDecimal valorTotal,

        @Schema(description = "Situação comercial do orçamento")
        BudgetStatus status,

        @Schema(description = "Descrição amigável do status")
        String statusDescricao
) {
}

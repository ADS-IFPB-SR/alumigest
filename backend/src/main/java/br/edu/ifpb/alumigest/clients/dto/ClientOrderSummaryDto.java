package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Resumo de Ordem de Serviço vinculada ao cliente no Hub 360°")
public record ClientOrderSummaryDto(
        @Schema(description = "ID único da Ordem de Serviço")
        UUID id,

        @Schema(description = "Código legível da O.S. (ex: OS-2026-0001)")
        String codigo,

        @Schema(description = "ID do orçamento de origem")
        UUID orcamentoId,

        @Schema(description = "Status atual de produção/ciclo de vida da O.S.")
        OrderStatus status,

        @Schema(description = "Descrição amigável do status da O.S.")
        String statusDescricao,

        @Schema(description = "Canal de aprovação comercial da O.S.")
        ApprovalChannel canalAprovacao,

        @Schema(description = "Descrição amigável do canal de aprovação")
        String canalAprovacaoDescricao,

        @Schema(description = "Data de aprovação comercial")
        LocalDate dataAprovacao,

        @Schema(description = "Data de previsão de entrega")
        LocalDate dataPrevisaoEntrega,

        @Schema(description = "Data de conclusão da fabricação")
        LocalDate dataConclusao,

        @Schema(description = "Valor líquido final da ordem")
        BigDecimal valorLiquido,

        @Schema(description = "Quantidade de itens/esquadrias físicas")
        int quantidadeItens,

        @Schema(description = "Data de criação do registro da O.S.")
        OffsetDateTime createdAt
) {}

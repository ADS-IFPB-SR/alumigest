package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Schema(description = "Resumo de Ordem de Serviço para a aba de O.S. do Hub 360° do Cliente")
public record ClientOrderSummaryDto(
        @Schema(description = "Identificador único da O.S. (UUID)")
        UUID id,

        @Schema(description = "Código legível da O.S. (ex: OS-2026-0042)")
        String codigo,

        @Schema(description = "Data de aprovação/criação da O.S.")
        LocalDate data,

        @Schema(description = "Status fabril da O.S.")
        OrderStatus status,

        @Schema(description = "Descrição amigável do status fabril")
        String statusDescricao,

        @Schema(description = "Valor líquido total da O.S.")
        BigDecimal valorTotal,

        @Schema(description = "Quantidade total de esquadrias físicas")
        int totalEsquadrias,

        @Schema(description = "Lista de esquadrias físicas da O.S.")
        List<ClientOrderItemDto> items
) {
}

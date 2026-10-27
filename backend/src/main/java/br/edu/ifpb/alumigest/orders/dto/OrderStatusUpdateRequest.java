package br.edu.ifpb.alumigest.orders.dto;

import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Record DTO para atualização de status de produção do pedido (Painel Kanban).
 * US-18.1 (#143).
 */
@Schema(description = "Payload para atualização de status de produção do pedido")
public record OrderStatusUpdateRequest(
        @Schema(description = "Novo status de produção do pedido", example = "IN_PRODUCTION")
        @NotNull(message = "O status de destino é obrigatório.")
        @JsonAlias({"novoStatus", "productionStatus"})
        OrderStatus status
) {
}

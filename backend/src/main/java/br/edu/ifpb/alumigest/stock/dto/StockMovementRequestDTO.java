package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Requisição para registro de movimentações de estoque (entradas manuais, compras e ajustes de inventário).
 */
public record StockMovementRequestDTO(
    @NotNull(message = "O ID do material é obrigatório")
    UUID materialId,

    @NotNull(message = "O tipo de movimentação é obrigatório")
    StockMovementType type,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade movimentada deve ser maior que zero")
    BigDecimal quantity,

    BigDecimal unitCost,

    String reason,

    String referenceDocument,

    String registeredBy
) {}

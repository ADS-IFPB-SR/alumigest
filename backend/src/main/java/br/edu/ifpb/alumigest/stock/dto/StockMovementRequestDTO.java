package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Requisição para registro de movimentações de estoque (entradas manuais, compras e ajustes de inventário).
 */
@Schema(description = "Dados para registro de movimentação manual de estoque (Kardex)")
public record StockMovementRequestDTO(
    @NotNull(message = "O ID do material é obrigatório")
    @Schema(
        description = "Identificador único do material do catálogo",
        example = "e3b0c442-98fc-1c14-9afbf-4c8996fb9242",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    UUID materialId,

    @NotNull(message = "O tipo de movimentação é obrigatório")
    @Schema(
        description = "Tipo de movimentação manual (PURCHASE_ENTRY, MANUAL_ADJUSTMENT, SCRAP_LOSS)",
        example = "PURCHASE_ENTRY",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    StockMovementType type,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade movimentada deve ser maior que zero")
    @Schema(
        description = "Quantidade estritamente positiva a ser movimentada",
        example = "20.0000",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    BigDecimal quantity,

    @Schema(description = "Custo unitário de aquisição do insumo (opcional)", example = "75.50")
    BigDecimal unitCost,

    @Schema(description = "Justificativa ou motivo da movimentação", example = "Recebimento de lote via NF-e 4521")
    String reason,

    @Schema(description = "Documento fiscal ou ordem de referência", example = "NF-e 4521")
    String referenceDocument,

    @Schema(description = "Identificação do operador responsável pelo registro", example = "joao.almoxarife")
    String registeredBy
) {
    /**
     * Valida se a justificativa foi devidamente preenchida para movimentações extraordinárias.
     *
     * @return {@code true} se a justificativa for válida conforme o tipo de movimentação
     */
    @AssertTrue(message = "A justificativa é obrigatória para perdas e ajustes manuais")
    public boolean isReasonValid() {
        if (type == StockMovementType.SCRAP_LOSS || type == StockMovementType.MANUAL_ADJUSTMENT) {
            return reason != null && !reason.trim().isEmpty();
        }
        return true;
    }
}

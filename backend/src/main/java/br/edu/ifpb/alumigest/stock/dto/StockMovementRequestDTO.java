package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Requisição para registro de movimentações de estoque (entradas manuais, compras e ajustes de inventário).
 */
@SuppressWarnings("java:S107")
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

    @Positive(message = "O preço de compra unitário deve ser maior que zero")
    @Schema(description = "Custo unitário de aquisição do insumo (opcional)", example = "75.50")
    BigDecimal unitCost,

    @Size(max = 500, message = "A justificativa deve ter no máximo 500 caracteres")
    @Schema(description = "Justificativa ou motivo da movimentação", example = "Recebimento de lote via NF-e 4521")
    String reason,

    @JsonAlias("documentNumber")
    @Size(max = 100, message = "O número do documento deve ter no máximo 100 caracteres")
    @Schema(description = "Documento fiscal ou ordem de referência", example = "NF-e 4521")
    String referenceDocument,

    @Size(max = 150, message = "O responsável deve ter no máximo 150 caracteres")
    @Schema(description = "Identificação do operador responsável pelo registro", example = "joao.almoxarife")
    String registeredBy,

    @Size(max = 150, message = "O fornecedor deve ter no máximo 150 caracteres")
    @Schema(description = "Nome ou razão social do fornecedor", example = "Alumínio Brasil Ltda")
    String supplier
) {

    /**
     * Construtor de retrocompatibilidade para chamadores sem o campo supplier.
     */
    public StockMovementRequestDTO(
            UUID materialId,
            StockMovementType type,
            BigDecimal quantity,
            BigDecimal unitCost,
            String reason,
            String referenceDocument,
            String registeredBy) {
        this(materialId, type, quantity, unitCost, reason, referenceDocument, registeredBy, null);
    }

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

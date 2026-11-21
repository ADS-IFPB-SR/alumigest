package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Requisição para registro de movimentações de estoque (entradas manuais, compras e ajustes de inventário).
 */
@SuppressWarnings("java:S107")
public record StockMovementRequestDTO(
    @NotNull(message = "O ID do material é obrigatório")
    UUID materialId,

    @NotNull(message = "O tipo de movimentação é obrigatório")
    StockMovementType type,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade movimentada deve ser maior que zero")
    BigDecimal quantity,

    @Positive(message = "O preço de compra unitário deve ser maior que zero")
    BigDecimal unitCost,

    @Size(max = 500, message = "A justificativa deve ter no máximo 500 caracteres")
    String reason,

    @JsonAlias("documentNumber")
    @Size(max = 100, message = "O número do documento deve ter no máximo 100 caracteres")
    String referenceDocument,

    @Size(max = 150, message = "O responsável deve ter no máximo 150 caracteres")
    String registeredBy,

    @Size(max = 150, message = "O fornecedor deve ter no máximo 150 caracteres")
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
}
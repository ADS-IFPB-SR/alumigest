package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Resposta de movimentação de estoque para consulta e auditoria na trilha Kardex.
 */
@SuppressWarnings("java:S107")
@Schema(description = "Registro imutável da trilha de auditoria Kardex de estoque")
public record StockMovementResponseDTO(
    @Schema(description = "Identificador único do registro de movimentação", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID id,

    @Schema(description = "Identificador do item de estoque impactado", example = "7c9e6679-7425-40de-944b-e07fc1f90ae7")
    UUID stockItemId,

    @Schema(description = "Identificador do material vinculado", example = "e3b0c442-98fc-1c14-9afbf-4c8996fb9242")
    UUID materialId,

    @Schema(description = "Código SKU do material", example = "VID-TMP-8MM")
    String materialSku,

    @Schema(description = "Nome do material", example = "Vidro Temperado Incolor 8mm")
    String materialName,

    @Schema(description = "Unidade de medida do material", example = "m²")
    String unitMeasure,

    @Schema(description = "Tipo de movimentação Kardex executada", example = "PURCHASE_ENTRY")
    StockMovementType type,

    @Schema(description = "Quantidade movimentada na operação", example = "10.0000")
    BigDecimal quantity,

    @Schema(description = "Custo unitário do insumo", example = "75.50")
    BigDecimal unitCost,

    @Schema(description = "Saldo físico anterior à movimentação", example = "20.0000")
    BigDecimal previousPhysicalQuantity,

    @Schema(description = "Novo saldo físico após a movimentação", example = "30.0000")
    BigDecimal newPhysicalQuantity,

    @Schema(description = "Saldo reservado anterior à movimentação", example = "5.0000")
    BigDecimal previousReservedQuantity,

    @Schema(description = "Novo saldo reservado após a movimentação", example = "5.0000")
    BigDecimal newReservedQuantity,

    @Schema(description = "Identificador da Ordem de Serviço vinculada, se houver", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID orderId,

    @Schema(description = "Documento fiscal, O.S. ou código de referência", example = "NF-e 4521")
    String referenceDocument,

    @Schema(description = "Nome ou razão social do fornecedor", example = "Alumínio Brasil Ltda")
    String supplier,

    @Schema(description = "Justificativa textual da movimentação", example = "Entrada por compra de fornecedor")
    String reason,

    @Schema(description = "Identificação do usuário ou sistema que registrou a movimentação", example = "joao.almoxarife")
    String registeredBy,

    @Schema(description = "Data e hora de gravação da movimentação (append-only)", example = "2026-11-15T15:00:00Z")
    OffsetDateTime createdAt
) {

    /**
     * Construtor de retrocompatibilidade para chamadores sem o campo supplier.
     */
    public StockMovementResponseDTO(
            UUID id,
            UUID stockItemId,
            UUID materialId,
            String materialSku,
            String materialName,
            String unitMeasure,
            StockMovementType type,
            BigDecimal quantity,
            BigDecimal unitCost,
            BigDecimal previousPhysicalQuantity,
            BigDecimal newPhysicalQuantity,
            BigDecimal previousReservedQuantity,
            BigDecimal newReservedQuantity,
            UUID orderId,
            String referenceDocument,
            String reason,
            String registeredBy,
            OffsetDateTime createdAt) {
        this(
            id, stockItemId, materialId, materialSku, materialName, unitMeasure,
            type, quantity, unitCost,
            previousPhysicalQuantity, newPhysicalQuantity,
            previousReservedQuantity, newReservedQuantity,
            orderId, referenceDocument, null, reason, registeredBy, createdAt
        );
    }

    /**
     * Construtor de retrocompatibilidade para chamadores legados sem campos estendidos de auditoria.
     */
    public StockMovementResponseDTO(
            UUID id,
            UUID stockItemId,
            UUID materialId,
            String materialSku,
            String materialName,
            StockMovementType type,
            BigDecimal quantity,
            BigDecimal previousPhysicalQuantity,
            BigDecimal newPhysicalQuantity,
            BigDecimal previousReservedQuantity,
            BigDecimal newReservedQuantity,
            String referenceDocument,
            String reason,
            String registeredBy,
            OffsetDateTime createdAt) {
        this(
            id, stockItemId, materialId, materialSku, materialName, null,
            type, quantity, null,
            previousPhysicalQuantity, newPhysicalQuantity,
            previousReservedQuantity, newReservedQuantity,
            null, referenceDocument, null, reason, registeredBy, createdAt
        );
    }
}

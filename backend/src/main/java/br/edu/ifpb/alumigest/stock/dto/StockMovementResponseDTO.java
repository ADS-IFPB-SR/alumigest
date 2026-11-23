package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Resposta de movimentação de estoque para consulta e auditoria na trilha Kardex.
 */
@SuppressWarnings("java:S107")
public record StockMovementResponseDTO(
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
    String supplier,
    String reason,
    String registeredBy,
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
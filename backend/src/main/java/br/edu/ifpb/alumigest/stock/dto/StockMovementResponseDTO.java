package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Resposta de movimentação de estoque para consulta e auditoria na trilha Kardex.
 */
public record StockMovementResponseDTO(
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
    OffsetDateTime createdAt
) {}

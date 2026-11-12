package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Representação completa do saldo e status de um item de estoque.
 *
 * <p>Respeita rigorosamente a RN-01: availableQuantity = physicalQuantity - reservedQuantity.
 */
public record StockItemResponseDTO(
    UUID id,
    UUID materialId,
    String materialSku,
    String materialName,
    String category,
    String unitMeasure,
    BigDecimal physicalQuantity,
    BigDecimal reservedQuantity,
    BigDecimal availableQuantity,
    BigDecimal minimumStock,
    StockAlertStatus alertStatus,
    OffsetDateTime lastUpdated
) {}

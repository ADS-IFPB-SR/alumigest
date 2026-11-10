package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Representação de saída de um item da venda avulsa.
 */
public record PartSaleItemResponse(
    UUID id,
    MaterialCategoryType materialType,
    UUID materialId,
    String description,
    Integer quantity,
    Integer widthMm,
    Integer heightMm,
    BigDecimal calculatedUnitMeasure,
    BigDecimal unitPrice,
    BigDecimal totalPrice
) {}

package br.edu.ifpb.alumigest.orders.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO imutável (Record) de resposta para insumo/opção congelada de um item do pedido.
 */
public record OrderItemOptionResponse(
    UUID id,
    UUID orderItemId,
    UUID materialId,
    String materialName,
    String unitMeasure,
    String categoryType,
    String selectedType,
    String selectedColor,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal totalPrice
) {
}

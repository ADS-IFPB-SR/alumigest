package br.edu.ifpb.alumigest.partsale.dto;

import java.math.BigDecimal;

/**
 * DTO com o resultado da apuração matemática do item de parte avulsa.
 */
public record CalculatePartItemResponse(
    BigDecimal calculatedUnitMeasure,
    BigDecimal unitPrice,
    BigDecimal totalPrice
) {}

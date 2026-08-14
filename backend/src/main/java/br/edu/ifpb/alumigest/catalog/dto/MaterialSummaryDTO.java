package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MaterialSummaryDTO(
        UUID id,
        String name,
        String skuCode,
        String commercialReference,
        BigDecimal salePrice,
        String unitMeasure
) {}

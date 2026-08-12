package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AluminumProfileResponseDTO(
        UUID id,
        String name,
        String commercialReference,
        String ncmCode,
        String colorFinish,
        BigDecimal standardLengthM,
        UnitMeasure unitMeasure,
        BigDecimal costPrice,
        BigDecimal salePrice,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

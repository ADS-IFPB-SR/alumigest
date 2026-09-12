package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AluminumProfileResponseDTO(
        UUID id,
        String name,
        String commercialReference,
        String commercialLine,
        String ncmCode,
        String colorFinish,
        BigDecimal standardLengthM,
        UnitMeasure unitMeasure,
        BigDecimal costPrice,
        BigDecimal salePrice,
        BigDecimal weight,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String familyCode,
        boolean isHandle
) {
    public AluminumProfileResponseDTO(
            UUID id,
            String name,
            String commercialReference,
            String commercialLine,
            String ncmCode,
            String colorFinish,
            BigDecimal standardLengthM,
            UnitMeasure unitMeasure,
            BigDecimal costPrice,
            BigDecimal salePrice,
            BigDecimal weight,
            boolean active,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {
        this(id, name, commercialReference, commercialLine, ncmCode, colorFinish, standardLengthM, unitMeasure, costPrice, salePrice, weight, active, createdAt, updatedAt, null, false);
    }

    public AluminumProfileResponseDTO(
            UUID id,
            String name,
            String commercialReference,
            String commercialLine,
            String ncmCode,
            String colorFinish,
            BigDecimal standardLengthM,
            UnitMeasure unitMeasure,
            BigDecimal costPrice,
            BigDecimal salePrice,
            BigDecimal weight,
            boolean active,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            String familyCode
    ) {
        this(id, name, commercialReference, commercialLine, ncmCode, colorFinish, standardLengthM, unitMeasure, costPrice, salePrice, weight, active, createdAt, updatedAt, familyCode, false);
    }
}

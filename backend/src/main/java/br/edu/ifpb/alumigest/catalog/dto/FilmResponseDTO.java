package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FilmResponseDTO(
        UUID id,
        String name,
        String colorFinish,
        BigDecimal costPrice,
        BigDecimal salePrice,
        String unitMeasure,
        BigDecimal thicknessMm,
        BigDecimal standardLengthM,
        BigDecimal maxWidthMm,
        boolean active,
        String commercialReference,
        String skuCode,
        String ncmCode,
        String familyCode
) {
    public FilmResponseDTO(
            UUID id,
            String name,
            String colorFinish,
            BigDecimal costPrice,
            BigDecimal salePrice,
            String unitMeasure,
            BigDecimal thicknessMm,
            BigDecimal standardLengthM,
            BigDecimal maxWidthMm,
            boolean active,
            String commercialReference,
            String skuCode,
            String ncmCode
    ) {
        this(id, name, colorFinish, costPrice, salePrice, unitMeasure, thicknessMm, standardLengthM, maxWidthMm, active, commercialReference, skuCode, ncmCode, null);
    }
}
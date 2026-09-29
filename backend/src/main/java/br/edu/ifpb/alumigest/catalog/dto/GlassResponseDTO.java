package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record GlassResponseDTO(
        UUID id,
        String name,
        String colorFinish,
        String ncmCode,
        BigDecimal thicknessMm,
        BigDecimal costPrice,
        BigDecimal salePrice,
        String unitMeasure,
        boolean active,
        BigDecimal maxWidthMm,
        BigDecimal maxHeightMm,
        String familyCode
) {
    public GlassResponseDTO(
            UUID id,
            String name,
            String colorFinish,
            String ncmCode,
            BigDecimal thicknessMm,
            BigDecimal costPrice,
            BigDecimal salePrice,
            String unitMeasure,
            boolean active,
            BigDecimal maxWidthMm,
            BigDecimal maxHeightMm
    ) {
        this(id, name, colorFinish, ncmCode, thicknessMm, costPrice, salePrice, unitMeasure, active, maxWidthMm, maxHeightMm, null);
    }
}
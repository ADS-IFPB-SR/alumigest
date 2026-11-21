package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO resumido para listagem de materiais em seletores de catálogo, fichas técnicas
 * e formulário de venda avulsa de partes (US-46 / Issue #551).
 */
public record MaterialSummaryDTO(
    UUID id,
    String name,
    MaterialCategoryType category,
    BigDecimal unitPrice,
    UnitMeasure unitOfMeasure,
    String color,
    BigDecimal thicknessMm,
    String familyCode,
    String skuCode,
    String commercialReference,
    BigDecimal salePrice,
    BigDecimal costPrice,
    String unitMeasure,
    boolean isHandle
) {

    /**
     * Construtor de compatibilidade para chamadas legadas com 8 parâmetros.
     */
    public MaterialSummaryDTO(
        UUID id,
        String name,
        String skuCode,
        String commercialReference,
        BigDecimal salePrice,
        BigDecimal costPrice,
        String unitMeasure,
        boolean isHandle
    ) {
        this(
            id,
            name,
            null,
            salePrice,
            parseUnitMeasure(unitMeasure),
            null,
            null,
            null,
            skuCode,
            commercialReference,
            salePrice,
            costPrice,
            unitMeasure,
            isHandle
        );
    }

    /**
     * Factory method canônico para mapeamento a partir da entidade Material.
     */
    public static MaterialSummaryDTO fromEntity(Material m) {
        if (m == null) {
            return null;
        }
        MaterialCategoryType cat = m.getGroup() != null
            ? MaterialCategoryType.fromGroupCode(m.getGroup().getCode())
            : null;

        String unitMeasureStr = m.getUnitMeasure() != null ? m.getUnitMeasure().name() : "";

        return new MaterialSummaryDTO(
            m.getId(),
            m.getName(),
            cat,
            m.getSalePrice(),
            m.getUnitMeasure(),
            m.getColorFinish(),
            m.getThicknessMm(),
            m.getFamilyCode(),
            m.getSkuCode(),
            m.getCommercialReference(),
            m.getSalePrice(),
            m.getCostPrice(),
            unitMeasureStr,
            m.isHandle()
        );
    }

    private static UnitMeasure parseUnitMeasure(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UnitMeasure.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

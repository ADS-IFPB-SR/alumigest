package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de resposta para ferragens.
 * Projetado a partir da entidade {@code Material} vinculada ao grupo {@code FERRAGEM}.
 */
public record HardwareResponseDTO(
        UUID id,
        String skuCode,
        String name,
        UnitMeasure unitMeasure,
        CalculationType calculationType,
        BigDecimal costPrice,
        BigDecimal salePrice,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.entity.CalculationType;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HardwareResponse(
        Long id,
        String code,
        String name,
        UnitType unit,
        CalculationType calculationType,
        BigDecimal unitPrice,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

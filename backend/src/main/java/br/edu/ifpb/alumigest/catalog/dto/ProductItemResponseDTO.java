package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductItemResponseDTO(
        UUID id,
        UUID materialId,
        String materialName,
        BigDecimal quantity
) {}
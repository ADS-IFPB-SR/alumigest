package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductResponseDTO(
        UUID id,
        String name,
        UUID categoryId,
        String categoryName,
        BigDecimal laborCost,
        boolean isActive,
        List<ProductItemResponseDTO> items
) {}
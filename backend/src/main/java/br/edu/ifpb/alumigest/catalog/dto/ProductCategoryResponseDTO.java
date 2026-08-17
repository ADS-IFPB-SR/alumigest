package br.edu.ifpb.alumigest.catalog.dto;

import java.util.UUID;

public record ProductCategoryResponseDTO(
        UUID id,
        String name,
        String description
) {}

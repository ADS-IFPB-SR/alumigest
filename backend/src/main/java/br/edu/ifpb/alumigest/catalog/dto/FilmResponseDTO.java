package br.edu.ifpb.alumigest.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FilmResponseDTO(
        UUID id,
        String name,
        String colorFinish,
        BigDecimal salePrice,
        String unitMeasure
) { }
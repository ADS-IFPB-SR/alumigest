package br.edu.ifpb.alumigest.orders.dto.production;

public record GlassCutDto(
        String glassType,
        Integer widthMm,
        Integer heightMm,
        Integer quantity
) {}
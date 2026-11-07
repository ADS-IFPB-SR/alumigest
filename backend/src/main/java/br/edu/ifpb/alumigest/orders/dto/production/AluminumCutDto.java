package br.edu.ifpb.alumigest.orders.dto.production;

public record AluminumCutDto(
        String profileCode,
        String description,
        Integer lengthMm,
        String cutAngle,
        Integer quantity
) {}
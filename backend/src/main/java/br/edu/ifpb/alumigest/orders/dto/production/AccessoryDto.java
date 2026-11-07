package br.edu.ifpb.alumigest.orders.dto.production;

public record AccessoryDto(
        String code,
        String description,
        Integer quantity,
        String unit
) {}
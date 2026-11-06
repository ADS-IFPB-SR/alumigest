package br.edu.ifpb.alumigest.orders.dto.production;

import java.util.List;

public record ProductionSheetResponse(
        String orderCode,
        String clientName,
        List<AluminumCutDto> aluminumCuts,
        List<GlassCutDto> glassCuts,
        List<AccessoryDto> accessories
) {}
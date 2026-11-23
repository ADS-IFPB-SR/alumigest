package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Payload unificado do fluxo "2 em 1" (Cadastro de Material + Entrada Inicial opcional).
 */
public record MaterialWithStockCreateRequestDTO(
    @NotNull(message = "A categoria do material é obrigatória")
    MaterialCategoryType categoryType,

    @Valid
    AluminumProfileRequestDTO aluminumProfile,

    @Valid
    GlassCreateDTO glass,

    @Valid
    HardwareRequestDTO hardware,

    @Valid
    FilmRequestDTO film,

    @Valid
    InitialStockEntryDTO initialStock
) {}
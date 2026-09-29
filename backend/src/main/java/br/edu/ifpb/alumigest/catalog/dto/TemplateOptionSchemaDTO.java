package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.HandlePosition;
import br.edu.ifpb.alumigest.catalog.domain.HandleType;
import br.edu.ifpb.alumigest.catalog.domain.HoleDrillingMode;
import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import br.edu.ifpb.alumigest.catalog.domain.SlidingMode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Esquema de opções disponíveis e permitidas para o orçamento deste template")
public record TemplateOptionSchemaDTO(
        @Schema(description = "Permite selecionar o modo de correr")
        boolean allowSlidingMode,

        @Schema(description = "Modos de correr permitidos")
        List<SlidingMode> allowedSlidingModes,

        @Schema(description = "Permite selecionar sentido de abertura")
        boolean allowOpeningDirection,

        @Schema(description = "Sentidos de abertura permitidos")
        List<OpeningDirection> allowedOpeningDirections,

        @Schema(description = "Permite configurar puxador/fecho")
        boolean allowHandle,

        @Schema(description = "Tipos de puxador permitidos")
        List<HandleType> allowedHandleTypes,

        @Schema(description = "Posições de puxador permitidas")
        List<HandlePosition> allowedHandlePositions,

        @Schema(description = "Permite configurar furações")
        boolean allowDrilling,

        @Schema(description = "Modos de furação permitidos")
        List<HoleDrillingMode> allowedDrillingModes,

        @Schema(description = "Cores de alumínio permitidas")
        List<String> allowAluminumColors,

        @Schema(description = "Cores/acabamentos de vidro permitidos")
        List<String> allowGlassColors
) {}

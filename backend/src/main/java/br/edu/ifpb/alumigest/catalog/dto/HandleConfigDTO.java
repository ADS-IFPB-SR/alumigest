package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.HandlePosition;
import br.edu.ifpb.alumigest.catalog.domain.HandleType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Configuração do puxador ou fecho da esquadria")
public record HandleConfigDTO(
        @Schema(description = "Tipo de puxador", example = "SHELL_LOCK")
        HandleType handleType,

        @Schema(description = "Posição de instalação", example = "RIGHT")
        HandlePosition position,

        @Schema(description = "Comprimento em mm", example = "150.0")
        BigDecimal lengthMm,

        @Schema(description = "Distância da base/canto em mm (nulo = centro)", example = "100.0")
        BigDecimal offsetMm
) {}

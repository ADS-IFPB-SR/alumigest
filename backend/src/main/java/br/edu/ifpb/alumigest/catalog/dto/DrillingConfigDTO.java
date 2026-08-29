package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.HoleDrillingMode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Configuração de furações para dobradiças ou fixações")
public record DrillingConfigDTO(
        @Schema(description = "Modo de distribuição de furos", example = "EQUAL")
        HoleDrillingMode mode,

        @Schema(description = "Quantidade de furos (para modo EQUAL)", example = "2")
        Integer holesCount,

        @Schema(description = "Medidas partindo da base em mm (para modo CUSTOM)", example = "[100.0, 500.0]")
        List<BigDecimal> customDistancesMm
) {}

package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import br.edu.ifpb.alumigest.catalog.domain.SlidingMode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Configurações padrão e esquema de opções do template de esquadria")
public record TemplateConfigDTO(
        @Schema(description = "Espessura/largura padrão do perfil em mm", example = "20.0")
        BigDecimal profileMm,

        @Schema(description = "Cor padrão do alumínio", example = "#212121")
        String aluminumColor,

        @Schema(description = "Cor/tipo padrão do vidro", example = "#e3f2fd")
        String glassColor,

        @Schema(description = "Sentido de abertura padrão", example = "LEFT_TO_RIGHT")
        OpeningDirection openingDirection,

        @Schema(description = "Modo de correr padrão", example = "BOTH_SLIDING")
        SlidingMode slidingMode,

        @Schema(description = "Configuração de puxador padrão")
        HandleConfigDTO handleConfig,

        @Schema(description = "Configuração de furações padrão")
        DrillingConfigDTO drillingConfig,

        @Schema(description = "Esquema de opções disponíveis para o orçamento")
        TemplateOptionSchemaDTO optionSchema
) {}

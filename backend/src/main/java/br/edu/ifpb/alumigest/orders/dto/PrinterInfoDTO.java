package br.edu.ifpb.alumigest.orders.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Representa uma impressora instalada no sistema operacional.
 */
@Schema(description = "Dados de uma impressora disponível no sistema operacional")
public record PrinterInfoDTO(
        @Schema(description = "Nome da impressora no sistema operacional", example = "Elgin L42 Pro")
        String name,

        @Schema(description = "Indica se é a impressora padrão do sistema operacional", example = "true")
        boolean isDefault,

        @Schema(description = "Indica se o nome sugere ser uma impressora térmica de etiquetas", example = "true")
        boolean isThermal
) {
}

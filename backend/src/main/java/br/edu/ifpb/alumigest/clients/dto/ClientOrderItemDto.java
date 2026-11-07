package br.edu.ifpb.alumigest.clients.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Esquadria física de uma Ordem de Serviço no Hub 360° do Cliente")
public record ClientOrderItemDto(
        @Schema(description = "Identificador único do item (UUID)")
        UUID id,

        @Schema(description = "Descrição da esquadria (ex: Janela de Correr 2 Folhas)")
        String descricao,

        @Schema(description = "Largura nominal em milímetros")
        int larguraMm,

        @Schema(description = "Altura nominal em milímetros")
        int alturaMm,

        @Schema(description = "Quantidade de peças")
        int quantidade,

        @Schema(description = "Cor/acabamento do perfil de alumínio")
        String corAluminio,

        @Schema(description = "Tipo de vidro utilizado")
        String tipoVidro,

        @Schema(description = "Valor total do item")
        BigDecimal valorTotal
) {
}

package br.edu.ifpb.alumigest.orders.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Resposta da operação de envio direto de etiquetas para a impressora térmica física.
 */
@Schema(description = "Resultado do envio direto de etiquetas para a impressora térmica")
public record PrintThermalResultDTO(
        @Schema(description = "Indica se o envio para o spooler/impressora foi concluído com sucesso", example = "true")
        boolean success,

        @Schema(description = "Mensagem descritiva do resultado da operação", example = "10 etiquetas enviadas com sucesso para a impressora Elgin L42 Pro!")
        String message,

        @Schema(description = "Nome da impressora utilizada para a emissão", example = "Elgin L42 Pro")
        String printerName,

        @Schema(description = "Quantidade de etiquetas geradas e impressas", example = "10")
        int labelCount,

        @Schema(description = "Payload com o script completo de comandos BPLB enviado à impressora")
        String bplbPayload
) {
}

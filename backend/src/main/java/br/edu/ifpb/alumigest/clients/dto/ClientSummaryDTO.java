package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Resumo do cliente para listagens paginadas")
public record ClientSummaryDTO(
        @Schema(description = "Identificador único (UUID)", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID id,

        @Schema(description = "Nome completo ou Razão Social", example = "João da Silva")
        String nomeCompleto,

        @Schema(description = "Tipo de pessoa (FISICA ou JURIDICA)", example = "FISICA")
        PersonType personType,

        @Schema(description = "Documento cadastrado (CPF ou CNPJ)", example = "123.456.789-00")
        String documento,

        @Schema(description = "Telefone para contato", example = "(83) 99999-0000")
        String telefone,

        @Schema(description = "Endereço de e-mail", example = "joao@email.com")
        String email,

        @Schema(description = "Cidade", example = "Santa Rita")
        String cidade,

        @Schema(description = "Unidade Federativa (UF)", example = "PB")
        String uf,

        @Schema(description = "Status de ativação do cliente (soft delete)", example = "true")
        boolean ativo
) {
}

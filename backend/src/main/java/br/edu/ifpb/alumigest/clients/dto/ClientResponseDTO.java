package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Detalhes completos do cliente")
public record ClientResponseDTO(
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

        @Schema(description = "CEP do endereço", example = "58300-000")
        String cep,

        @Schema(description = "Logradouro (rua, avenida)", example = "Rua das Flores")
        String logradouro,

        @Schema(description = "Número do imóvel", example = "123")
        String numero,

        @Schema(description = "Complemento", example = "Apto 101")
        String complemento,

        @Schema(description = "Bairro", example = "Centro")
        String bairro,

        @Schema(description = "Cidade", example = "Santa Rita")
        String cidade,

        @Schema(description = "Unidade Federativa (UF)", example = "PB")
        String uf,

        @Schema(description = "Observações gerais", example = "Entregar na obra principal")
        String observacoes,

        @Schema(description = "Status de ativação do cliente (soft delete)", example = "true")
        boolean ativo,

        @Schema(description = "Data e hora de criação")
        OffsetDateTime createdAt,

        @Schema(description = "Data e hora da última atualização")
        OffsetDateTime updatedAt
) {
}

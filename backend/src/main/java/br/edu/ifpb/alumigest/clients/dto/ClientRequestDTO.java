package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criação ou atualização de cliente")
public record ClientRequestDTO(
        @NotBlank(message = "O nome completo é obrigatório")
        @Size(max = 150, message = "O nome completo deve ter no máximo 150 caracteres")
        @Schema(description = "Nome completo (Pessoa Física) ou Razão Social (Pessoa Jurídica)", example = "João da Silva")
        String nomeCompleto,

        @Schema(description = "Tipo de pessoa (FISICA ou JURIDICA). Padrão: FISICA", example = "FISICA")
        PersonType personType,

        @Pattern(regexp = "^$|^(\\d{11}|\\d{14}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                 message = "Documento com formato inválido (deve ser CPF ou CNPJ)")
        @Schema(description = "Número do documento (CPF para Física, CNPJ para Jurídica)", example = "123.456.789-00")
        String documento,

        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
        @Schema(description = "Telefone para contato", example = "(83) 99999-0000")
        String telefone,

        @Email(message = "E-mail inválido")
        @Size(max = 100, message = "O e-mail deve ter no máximo 100 caracteres")
        @Schema(description = "Endereço de e-mail", example = "joao@email.com")
        String email,

        @Size(max = 10, message = "O CEP deve ter no máximo 10 caracteres")
        @Schema(description = "CEP do endereço", example = "58300-000")
        String cep,

        @Size(max = 150, message = "O logradouro deve ter no máximo 150 caracteres")
        @Schema(description = "Logradouro (rua, avenida)", example = "Rua das Flores")
        String logradouro,

        @Size(max = 20, message = "O número deve ter no máximo 20 caracteres")
        @Schema(description = "Número do imóvel", example = "123")
        String numero,

        @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres")
        @Schema(description = "Complemento", example = "Apto 101")
        String complemento,

        @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres")
        @Schema(description = "Bairro", example = "Centro")
        String bairro,

        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres")
        @Schema(description = "Cidade", example = "Santa Rita")
        String cidade,

        @Size(max = 2, message = "A UF deve ter no máximo 2 caracteres")
        @Schema(description = "Unidade Federativa (UF)", example = "PB")
        String uf,

        @Schema(description = "Observações gerais sobre o cliente ou local da obra", example = "Entregar na obra principal")
        String observacoes
) {
}

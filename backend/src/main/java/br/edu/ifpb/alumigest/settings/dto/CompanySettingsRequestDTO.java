package br.edu.ifpb.alumigest.settings.dto;

import br.edu.ifpb.alumigest.settings.validation.ValidPhone;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;

/**
 * Payload de entrada para atualização dos dados institucionais da empresa.
 */
@Schema(description = "Dados para atualização das configurações institucionais da empresa")
public record CompanySettingsRequestDTO(
    @NotBlank(message = "A razão social é obrigatória")
    @Size(min = 2, max = 150, message = "A razão social deve ter entre 2 e 150 caracteres")
    @Schema(description = "Razão social da empresa", example = "Alumiportas LTDA")
    String companyName,

    @NotBlank(message = "O nome fantasia é obrigatório")
    @Size(min = 2, max = 150, message = "O nome fantasia deve ter entre 2 e 150 caracteres")
    @Schema(
        description = "Nome fantasia da empresa",
        example = "Alumiportas Esquadrias e Vidros")
    String tradeName,

    @NotBlank(message = "O CNPJ é obrigatório")
    @Size(max = 20, message = "O CNPJ deve ter no máximo 20 caracteres")
    @Pattern(regexp = "^(?![0./-]+$).*$", message = "CNPJ inválido")
    @CNPJ(message = "CNPJ inválido")
    @Schema(
        description = "CNPJ da empresa com dígitos verificadores válidos",
        example = "11.222.333/0001-81")
    String cnpj,

    @Size(max = 30, message = "A inscrição estadual deve ter no máximo 30 caracteres")
    @Schema(description = "Inscrição estadual da empresa (opcional)", example = "Isento")
    String stateRegistration,

    @NotBlank(message = "O telefone é obrigatório")
    @Size(min = 8, max = 25, message = "O telefone deve ter entre 8 e 25 caracteres")
    @ValidPhone
    @Schema(
        description = "Telefone comercial ou WhatsApp da empresa",
        example = "(83) 99999-9999")
    String phone,

    @Email(message = "E-mail inválido")
    @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
    @Schema(
        description = "Endereço de e-mail institucional (opcional)",
        example = "contato@alumiportas.com.br")
    String email,

    @Size(max = 12, message = "O CEP deve ter no máximo 12 caracteres")
    @Pattern(regexp = "^(\\d{5}-?\\d{3})?$", message = "CEP com formato inválido")
    @Schema(description = "CEP do endereço da empresa (opcional)", example = "58800-000")
    String zipCode,

    @NotBlank(message = "O endereço é obrigatório")
    @Size(min = 3, max = 255, message = "O endereço deve ter entre 3 e 255 caracteres")
    @Schema(
        description = "Logradouro, número e bairro da empresa",
        example = "Rua Principal, 100 - Centro")
    String address,

    @NotBlank(message = "A cidade/UF é obrigatória")
    @Size(min = 3, max = 100, message = "A cidade/UF deve ter entre 3 e 100 caracteres")
    @Schema(description = "Município e Unidade Federativa da empresa", example = "Sousa - PB")
    String cityState) {}

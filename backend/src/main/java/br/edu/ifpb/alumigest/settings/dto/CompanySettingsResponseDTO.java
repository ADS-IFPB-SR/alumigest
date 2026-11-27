package br.edu.ifpb.alumigest.settings.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Representação de saída das configurações institucionais da empresa.
 */
@Schema(description = "Dados institucionais vigentes da empresa")
public record CompanySettingsResponseDTO(
    @Schema(
        description = "Identificador único do registro singleton",
        example = "00000000-0000-0000-0000-000000000001")
    UUID id,

    @Schema(description = "Razão social da empresa", example = "Alumiportas LTDA")
    String companyName,

    @Schema(
        description = "Nome fantasia da empresa",
        example = "Alumiportas Esquadrias e Vidros")
    String tradeName,

    @Schema(description = "CNPJ formatado da empresa", example = "11.222.333/0001-81")
    String cnpj,

    @Schema(description = "Inscrição estadual da empresa", example = "Isento")
    String stateRegistration,

    @Schema(description = "Telefone comercial ou WhatsApp", example = "(83) 99999-9999")
    String phone,

    @Schema(description = "E-mail institucional da empresa", example = "contato@alumiportas.com.br")
    String email,

    @Schema(description = "CEP formatado da empresa", example = "58800-000")
    String zipCode,

    @Schema(description = "Endereço completo da empresa", example = "Rua Principal, 100 - Centro")
    String address,

    @Schema(description = "Cidade e UF da empresa", example = "Sousa - PB")
    String cityState,

    @Schema(description = "Data e hora da última atualização em UTC")
    OffsetDateTime updatedAt) {}

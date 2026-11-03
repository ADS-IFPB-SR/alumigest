package br.edu.ifpb.alumigest.clients.dto;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Dashboard 360° do cliente com dados de contato e KPIs agregados")
public record ClientDashboardDto(
        @Schema(description = "Identificador único (UUID)")
        UUID id,

        @Schema(description = "Nome completo ou Razão Social")
        String nomeCompleto,

        @Schema(description = "Tipo de pessoa (FISICA ou JURIDICA)")
        PersonType personType,

        @Schema(description = "Documento cadastrado (CPF ou CNPJ)")
        String documento,

        @Schema(description = "Telefone para contato")
        String telefone,

        @Schema(description = "Endereço de e-mail")
        String email,

        @Schema(description = "Bairro")
        String bairro,

        @Schema(description = "Cidade")
        String cidade,

        @Schema(description = "Unidade Federativa (UF)")
        String uf,

        @Schema(description = "Total contratado em Ordens de Serviço ativas")
        BigDecimal totalContratado,

        @Schema(description = "Quantidade total de Ordens de Serviço ativas")
        long quantidadeOrdensServico,

        @Schema(description = "Quantidade total de orçamentos gerados")
        long quantidadeOrcamentos
) {
}

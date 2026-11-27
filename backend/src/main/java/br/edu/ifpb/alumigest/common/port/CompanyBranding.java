package br.edu.ifpb.alumigest.common.port;

/**
 * Snapshot imutável com os dados institucionais efetivos da empresa para consumo
 * desacoplado pelos motores de geração de documentos PDF (US-50.3).
 */
public record CompanyBranding(
    String companyName,
    String tradeName,
    String cnpj,
    String stateRegistration,
    String phone,
    String email,
    String zipCode,
    String address,
    String cityState) {}

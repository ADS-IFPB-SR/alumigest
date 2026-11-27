package br.edu.ifpb.alumigest.settings.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.port.CompanyBranding;
import br.edu.ifpb.alumigest.common.port.CompanySettingsQueryPort;
import br.edu.ifpb.alumigest.settings.domain.CompanySettings;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsRequestDTO;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsResponseDTO;
import br.edu.ifpb.alumigest.settings.repository.CompanySettingsRepository;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço de aplicação responsável pela leitura com fallback resiliente, normalização
 * canônica e atualização transacional das configurações institucionais da empresa (US-50.1).
 */
@Service
public class CompanySettingsService implements CompanySettingsQueryPort {

  private static final int CNPJ_DIGITS_LENGTH = 14;
  private static final int ZIP_CODE_DIGITS_LENGTH = 8;

  private final CompanySettingsRepository companySettingsRepository;
  private final CompanyProperties companyProperties;

  /**
   * Constrói o serviço injetando o repositório singleton e as propriedades de fallback.
   *
   * @param companySettingsRepository repositório JPA da entidade singleton
   * @param companyProperties propriedades estáticas legadas para fallback resiliente
   */
  public CompanySettingsService(
      CompanySettingsRepository companySettingsRepository,
      CompanyProperties companyProperties) {
    this.companySettingsRepository = companySettingsRepository;
    this.companyProperties = companyProperties;
  }

  /**
   * Consulta os dados institucionais da empresa com fallback campo a campo para
   * {@link CompanyProperties} caso o banco esteja vazio ou possua campos obrigatórios ausentes.
   *
   * @return representação vigente das configurações da empresa
   */
  @Transactional(readOnly = true)
  public CompanySettingsResponseDTO getSettings() {
    return resolveEffectiveResponse();
  }

  /**
   * Retorna as configurações institucionais efetivas prontas para uso interno por outros
   * serviços da aplicação.
   *
   * @return representação efetiva das configurações da empresa
   */
  @Transactional(readOnly = true)
  public CompanySettingsResponseDTO getEffectiveSettings() {
    return resolveEffectiveResponse();
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyBranding getEffectiveBranding() {
    CompanySettingsResponseDTO effective = resolveEffectiveResponse();
    return new CompanyBranding(
        effective.companyName(),
        effective.tradeName(),
        effective.cnpj(),
        effective.stateRegistration(),
        effective.phone(),
        effective.email(),
        effective.zipCode(),
        effective.address(),
        effective.cityState());
  }

  /**
   * Atualiza de forma transacional (ou cria caso ausente em banco de teste) o registro
   * singleton de configurações institucionais aplicando normalização canônica.
   *
   * @param request payload validado com os novos dados institucionais
   * @return configurações institucionais persistidas e normalizadas
   */
  @Transactional
  public CompanySettingsResponseDTO updateSettings(CompanySettingsRequestDTO request) {
    CompanySettings entity =
        companySettingsRepository.findSingletonForUpdate().orElseGet(CompanySettings::new);

    entity.setSingletonLock(true);
    entity.setCompanyName(request.companyName().trim());
    entity.setTradeName(request.tradeName().trim());
    entity.setCnpj(normalizeCnpj(request.cnpj()));
    entity.setStateRegistration(trimToNull(request.stateRegistration()));
    entity.setPhone(request.phone().trim());
    entity.setEmail(normalizeEmail(request.email()));
    entity.setZipCode(normalizeZipCode(request.zipCode()));
    entity.setAddress(request.address().trim());
    entity.setCityState(request.cityState().trim());

    CompanySettings saved = companySettingsRepository.save(entity);
    return toResponseFromEntity(saved);
  }

  private CompanySettingsResponseDTO resolveEffectiveResponse() {
    return companySettingsRepository
        .findFirstBySingletonLockTrue()
        .map(this::toResponseFromEntity)
        .orElseGet(this::toFallbackResponse);
  }

  private CompanySettingsResponseDTO toResponseFromEntity(CompanySettings entity) {
    String fallbackCompanyName = trimToNull(companyProperties.getRazaoSocial());
    String resolvedCompanyName = firstNonBlank(entity.getCompanyName(), fallbackCompanyName);
    String resolvedTradeName = firstNonBlank(entity.getTradeName(), resolvedCompanyName);

    return new CompanySettingsResponseDTO(
        entity.getId() != null ? entity.getId() : CompanySettings.SINGLETON_ID,
        resolvedCompanyName,
        resolvedTradeName,
        firstNonBlank(entity.getCnpj(), companyProperties.getCnpj()),
        trimToNull(entity.getStateRegistration()),
        firstNonBlank(entity.getPhone(), companyProperties.getTelefone()),
        trimToNull(entity.getEmail()),
        trimToNull(entity.getZipCode()),
        firstNonBlank(entity.getAddress(), companyProperties.getEndereco()),
        firstNonBlank(entity.getCityState(), companyProperties.getCidadeUf()),
        entity.getUpdatedAt());
  }

  private CompanySettingsResponseDTO toFallbackResponse() {
    String companyName = trimToNull(companyProperties.getRazaoSocial());
    return new CompanySettingsResponseDTO(
        CompanySettings.SINGLETON_ID,
        companyName,
        companyName,
        trimToNull(companyProperties.getCnpj()),
        trimToNull(companyProperties.getInscricaoEstadual()),
        trimToNull(companyProperties.getTelefone()),
        null,
        null,
        trimToNull(companyProperties.getEndereco()),
        trimToNull(companyProperties.getCidadeUf()),
        null);
  }

  private static String normalizeCnpj(String rawCnpj) {
    String digits = rawCnpj.replaceAll("\\D", "");
    if (digits.length() != CNPJ_DIGITS_LENGTH) {
      throw new IllegalArgumentException("CNPJ inválido: deve conter 14 dígitos numéricos");
    }
    return "%s.%s.%s/%s-%s"
        .formatted(
            digits.substring(0, 2),
            digits.substring(2, 5),
            digits.substring(5, 8),
            digits.substring(8, 12),
            digits.substring(12, 14));
  }

  private static String normalizeZipCode(String rawZipCode) {
    String trimmed = trimToNull(rawZipCode);
    if (trimmed == null) {
      return null;
    }
    String digits = trimmed.replaceAll("\\D", "");
    if (digits.length() != ZIP_CODE_DIGITS_LENGTH) {
      throw new IllegalArgumentException("CEP inválido: deve conter 8 dígitos numéricos");
    }
    return digits.substring(0, 5) + "-" + digits.substring(5, 8);
  }

  private static String normalizeEmail(String rawEmail) {
    String trimmed = trimToNull(rawEmail);
    return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private static String firstNonBlank(String primary, String fallback) {
    String normalizedPrimary = trimToNull(primary);
    return normalizedPrimary != null ? normalizedPrimary : trimToNull(fallback);
  }
}

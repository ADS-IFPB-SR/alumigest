package br.edu.ifpb.alumigest.common.port;

/**
 * Porta de consulta dos dados institucionais da empresa para consumidores que não
 * devem depender diretamente do domínio ou do repositório de settings.
 */
public interface CompanySettingsQueryPort {

  /**
   * Retorna os dados institucionais efetivos da empresa, aplicando fallback resiliente
   * caso o registro singleton não esteja persistido no banco de dados.
   *
   * @return dados institucionais efetivos da empresa
   */
  CompanyBranding getEffectiveBranding();
}

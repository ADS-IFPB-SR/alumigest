package br.edu.ifpb.alumigest.settings.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.port.CompanyBranding;
import br.edu.ifpb.alumigest.settings.domain.CompanySettings;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsRequestDTO;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsResponseDTO;
import br.edu.ifpb.alumigest.settings.repository.CompanySettingsRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanySettingsService — Testes Unitários (US-50.1)")
class CompanySettingsServiceTest {

  private static final String SEED_COMPANY_NAME = "Alumiportas LTDA";
  private static final String SEED_TRADE_NAME = "Alumiportas Esquadrias e Vidros";
  private static final String SEED_CNPJ = "11.222.333/0001-81";
  private static final String SEED_IE = "Isento";
  private static final String SEED_PHONE = "(83) 99999-9999";
  private static final String SEED_EMAIL = "contato@alumiportas.com.br";
  private static final String SEED_ZIP_CODE = "58800-000";
  private static final String SEED_ADDRESS = "Rua Principal, 100 - Centro";
  private static final String SEED_CITY_STATE = "Sousa - PB";

  private static final String FALLBACK_COMPANY_NAME = "Empresa Fallback LTDA";
  private static final String FALLBACK_CNPJ = "00.000.000/0000-00";
  private static final String FALLBACK_IE = "123456789";
  private static final String FALLBACK_PHONE = "(83) 3521-0000";
  private static final String FALLBACK_ADDRESS = "Av. Fallback, 500 - Centro";
  private static final String FALLBACK_CITY_STATE = "Cajazeiras - PB";

  @Mock private CompanySettingsRepository companySettingsRepository;

  private CompanyProperties companyProperties;
  private CompanySettingsService companySettingsService;

  @BeforeEach
  void setUp() {
    companyProperties = new CompanyProperties();
    companyProperties.setRazaoSocial(FALLBACK_COMPANY_NAME);
    companyProperties.setCnpj(FALLBACK_CNPJ);
    companyProperties.setInscricaoEstadual(FALLBACK_IE);
    companyProperties.setTelefone(FALLBACK_PHONE);
    companyProperties.setEndereco(FALLBACK_ADDRESS);
    companyProperties.setCidadeUf(FALLBACK_CITY_STATE);

    companySettingsService =
        new CompanySettingsService(companySettingsRepository, companyProperties);
  }

  @Nested
  @DisplayName("Consultas e Fallback Resiliente")
  class QueryAndFallbackTests {

    @Test
    @DisplayName("Deve retornar dados persistidos no banco quando o singleton existir")
    void shouldReturnPersistedSettingsWhenSingletonExists() {
      OffsetDateTime updatedAt = OffsetDateTime.of(2026, 11, 26, 12, 0, 0, 0, ZoneOffset.UTC);
      CompanySettings entity = buildPersistedSingleton(updatedAt);
      when(companySettingsRepository.findFirstBySingletonLockTrue())
          .thenReturn(Optional.of(entity));

      CompanySettingsResponseDTO response = companySettingsService.getSettings();
      CompanySettingsResponseDTO effective = companySettingsService.getEffectiveSettings();
      CompanyBranding branding = companySettingsService.getEffectiveBranding();

      assertThat(response.id()).isEqualTo(CompanySettings.SINGLETON_ID);
      assertThat(response.companyName()).isEqualTo(SEED_COMPANY_NAME);
      assertThat(response.tradeName()).isEqualTo(SEED_TRADE_NAME);
      assertThat(response.cnpj()).isEqualTo(SEED_CNPJ);
      assertThat(response.stateRegistration()).isEqualTo(SEED_IE);
      assertThat(response.phone()).isEqualTo(SEED_PHONE);
      assertThat(response.email()).isEqualTo(SEED_EMAIL);
      assertThat(response.zipCode()).isEqualTo(SEED_ZIP_CODE);
      assertThat(response.address()).isEqualTo(SEED_ADDRESS);
      assertThat(response.cityState()).isEqualTo(SEED_CITY_STATE);
      assertThat(response.updatedAt()).isEqualTo(updatedAt);

      assertThat(effective).isEqualTo(response);
      assertThat(branding.companyName()).isEqualTo(SEED_COMPANY_NAME);
      assertThat(branding.tradeName()).isEqualTo(SEED_TRADE_NAME);
      assertThat(branding.cnpj()).isEqualTo(SEED_CNPJ);
      assertThat(branding.email()).isEqualTo(SEED_EMAIL);
    }

    @Test
    @DisplayName("RN-02: Deve sintetizar resposta via CompanyProperties quando banco estiver vazio")
    void shouldFallbackToCompanyPropertiesWhenRepositoryIsEmpty() {
      when(companySettingsRepository.findFirstBySingletonLockTrue()).thenReturn(Optional.empty());

      CompanySettingsResponseDTO response = companySettingsService.getSettings();
      CompanyBranding branding = companySettingsService.getEffectiveBranding();

      assertThat(response.id()).isEqualTo(CompanySettings.SINGLETON_ID);
      assertThat(response.companyName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(response.tradeName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(response.cnpj()).isEqualTo(FALLBACK_CNPJ);
      assertThat(response.stateRegistration()).isEqualTo(FALLBACK_IE);
      assertThat(response.phone()).isEqualTo(FALLBACK_PHONE);
      assertThat(response.email()).isNull();
      assertThat(response.zipCode()).isNull();
      assertThat(response.address()).isEqualTo(FALLBACK_ADDRESS);
      assertThat(response.cityState()).isEqualTo(FALLBACK_CITY_STATE);
      assertThat(response.updatedAt()).isNull();

      assertThat(branding.companyName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(branding.tradeName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(branding.stateRegistration()).isEqualTo(FALLBACK_IE);
    }

    @Test
    @DisplayName("Deve aplicar fallback campo a campo quando campos obrigatórios vierem em branco")
    void shouldFallbackFieldByFieldWhenRequiredFieldsAreBlankInEntity() {
      CompanySettings partial = new CompanySettings();
      partial.setId(null);
      partial.setCompanyName("   ");
      partial.setTradeName(null);
      partial.setCnpj("");
      partial.setStateRegistration("   ");
      partial.setPhone("  ");
      partial.setEmail(" ");
      partial.setZipCode("");
      partial.setAddress(null);
      partial.setCityState("   ");

      when(companySettingsRepository.findFirstBySingletonLockTrue())
          .thenReturn(Optional.of(partial));

      CompanySettingsResponseDTO response = companySettingsService.getSettings();

      assertThat(response.id()).isEqualTo(CompanySettings.SINGLETON_ID);
      assertThat(response.companyName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(response.tradeName()).isEqualTo(FALLBACK_COMPANY_NAME);
      assertThat(response.cnpj()).isEqualTo(FALLBACK_CNPJ);
      assertThat(response.stateRegistration()).isNull();
      assertThat(response.phone()).isEqualTo(FALLBACK_PHONE);
      assertThat(response.email()).isNull();
      assertThat(response.zipCode()).isNull();
      assertThat(response.address()).isEqualTo(FALLBACK_ADDRESS);
      assertThat(response.cityState()).isEqualTo(FALLBACK_CITY_STATE);
    }
  }

  @Nested
  @DisplayName("Atualização Singleton e Normalização Canônica")
  class UpdateAndNormalizationTests {

    @Test
    @DisplayName("Deve atualizar singleton existente normalizando CNPJ, CEP e e-mail")
    void shouldUpdateExistingSingletonAndNormalizeFields() {
      CompanySettings existing =
          buildPersistedSingleton(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
      when(companySettingsRepository.findSingletonForUpdate()).thenReturn(Optional.of(existing));
      when(companySettingsRepository.save(any(CompanySettings.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      CompanySettingsRequestDTO request =
          new CompanySettingsRequestDTO(
              "  Alumiportas Indústria LTDA  ",
              "  Alumiportas Matriz  ",
              "11444777000161",
              "  28.123.456-7  ",
              "  (83) 98888-7777  ",
              "  FINANCEIRO@AlumiPortas.COM.BR  ",
              "58800123",
              "  Av. Presidente Epitácio, 250 - Estação  ",
              "  Sousa - PB  ");

      CompanySettingsResponseDTO updated = companySettingsService.updateSettings(request);

      assertThat(updated.id()).isEqualTo(CompanySettings.SINGLETON_ID);
      assertThat(updated.companyName()).isEqualTo("Alumiportas Indústria LTDA");
      assertThat(updated.tradeName()).isEqualTo("Alumiportas Matriz");
      assertThat(updated.cnpj()).isEqualTo("11.444.777/0001-61");
      assertThat(updated.stateRegistration()).isEqualTo("28.123.456-7");
      assertThat(updated.phone()).isEqualTo("(83) 98888-7777");
      assertThat(updated.email()).isEqualTo("financeiro@alumiportas.com.br");
      assertThat(updated.zipCode()).isEqualTo("58800-123");
      assertThat(updated.address()).isEqualTo("Av. Presidente Epitácio, 250 - Estação");
      assertThat(updated.cityState()).isEqualTo("Sousa - PB");
    }

    @Test
    @DisplayName("Deve criar registro singleton inicial quando banco estiver vazio e limpar vazios")
    void shouldInsertSingletonWhenEmptyAndConvertBlankOptionalsToNull() {
      when(companySettingsRepository.findSingletonForUpdate()).thenReturn(Optional.empty());
      when(companySettingsRepository.save(any(CompanySettings.class)))
          .thenAnswer(
              invocation -> {
                CompanySettings saved = invocation.getArgument(0);
                saved.setId(CompanySettings.SINGLETON_ID);
                saved.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
                return saved;
              });

      CompanySettingsRequestDTO request =
          new CompanySettingsRequestDTO(
              SEED_COMPANY_NAME,
              SEED_TRADE_NAME,
              SEED_CNPJ,
              "   ",
              SEED_PHONE,
              "",
              null,
              SEED_ADDRESS,
              SEED_CITY_STATE);

      CompanySettingsResponseDTO created = companySettingsService.updateSettings(request);

      ArgumentCaptor<CompanySettings> captor = ArgumentCaptor.forClass(CompanySettings.class);
      verify(companySettingsRepository).save(captor.capture());
      CompanySettings captured = captor.getValue();

      assertThat(captured.isSingletonLock()).isTrue();
      assertThat(created.id()).isEqualTo(CompanySettings.SINGLETON_ID);
      assertThat(created.cnpj()).isEqualTo(SEED_CNPJ);
      assertThat(created.stateRegistration()).isNull();
      assertThat(created.email()).isNull();
      assertThat(created.zipCode()).isNull();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidNormalizationPayloads")
    @DisplayName("Deve rejeitar defensivamente CNPJ sem 14 dígitos ou CEP sem 8 dígitos")
    void shouldRejectInvalidDigitLengthsDefensively(
        String scenario, String cnpj, String zipCode, String expectedMessageFragment) {
      when(companySettingsRepository.findSingletonForUpdate()).thenReturn(Optional.empty());

      CompanySettingsRequestDTO invalidRequest =
          new CompanySettingsRequestDTO(
              SEED_COMPANY_NAME,
              SEED_TRADE_NAME,
              cnpj,
              SEED_IE,
              SEED_PHONE,
              SEED_EMAIL,
              zipCode,
              SEED_ADDRESS,
              SEED_CITY_STATE);

      assertThatThrownBy(() -> companySettingsService.updateSettings(invalidRequest))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining(expectedMessageFragment);
    }

    static Stream<Arguments> invalidNormalizationPayloads() {
      return Stream.of(
          Arguments.of("CNPJ com menos de 14 dígitos", "12345678", SEED_ZIP_CODE, "14 dígitos"),
          Arguments.of("CEP com menos de 8 dígitos", SEED_CNPJ, "58800", "8 dígitos"));
    }
  }

  private static CompanySettings buildPersistedSingleton(OffsetDateTime updatedAt) {
    CompanySettings entity = new CompanySettings();
    entity.setId(CompanySettings.SINGLETON_ID);
    entity.setSingletonLock(true);
    entity.setCompanyName(SEED_COMPANY_NAME);
    entity.setTradeName(SEED_TRADE_NAME);
    entity.setCnpj(SEED_CNPJ);
    entity.setStateRegistration(SEED_IE);
    entity.setPhone(SEED_PHONE);
    entity.setEmail(SEED_EMAIL);
    entity.setZipCode(SEED_ZIP_CODE);
    entity.setAddress(SEED_ADDRESS);
    entity.setCityState(SEED_CITY_STATE);
    entity.setUpdatedAt(updatedAt);
    return entity;
  }
}

package br.edu.ifpb.alumigest.settings.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.edu.ifpb.alumigest.settings.domain.CompanySettings;
import jakarta.persistence.EntityManager;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("CompanySettingsRepository — Persistência e Invariante Singleton no SGBD (US-50.1)")
class CompanySettingsRepositoryTest {

  private static final String COMPANY_NAME = "Alumiportas LTDA";
  private static final String TRADE_NAME = "Alumiportas Esquadrias e Vidros";
  private static final String VALID_CNPJ = "11.222.333/0001-81";
  private static final String PHONE = "(83) 99999-9999";
  private static final String ADDRESS = "Rua Principal, 100 - Centro";
  private static final String CITY_STATE = "Sousa - PB";

  @Autowired private CompanySettingsRepository companySettingsRepository;

  @Autowired private EntityManager entityManager;

  @Test
  @DisplayName("Deve persistir o singleton com SINGLETON_ID e recuperar com findSingletonForUpdate")
  void shouldPersistAndRetrieveSingletonWithPessimisticLock() {
    CompanySettings settings = buildValidEntity();
    CompanySettings saved = companySettingsRepository.saveAndFlush(settings);
    entityManager.clear();

    assertThat(saved.getId()).isEqualTo(CompanySettings.SINGLETON_ID);
    assertThat(saved.getUpdatedAt()).isNotNull();

    Optional<CompanySettings> readOnly = companySettingsRepository.findFirstBySingletonLockTrue();
    assertThat(readOnly).isPresent();
    assertThat(readOnly.get().getCompanyName()).isEqualTo(COMPANY_NAME);

    Optional<CompanySettings> locked = companySettingsRepository.findSingletonForUpdate();
    assertThat(locked).isPresent();
    locked.get().setTradeName("Alumiportas Filial");
    companySettingsRepository.saveAndFlush(locked.get());
    entityManager.clear();

    CompanySettings reloaded =
        companySettingsRepository.findFirstBySingletonLockTrue().orElseThrow();
    assertThat(reloaded.getTradeName()).isEqualTo("Alumiportas Filial");
  }

  @Test
  @DisplayName("Deve lançar DataIntegrityViolationException ao forçar inserção de segundo registro")
  void shouldRejectSecondRowWithDataIntegrityViolationException() {
    CompanySettings first = buildValidEntity();
    companySettingsRepository.saveAndFlush(first);
    entityManager.clear();

    CompanySettings second = buildValidEntity();
    second.setId(UUID.randomUUID());
    second.setCompanyName("Segunda Empresa Indevida LTDA");

    assertThatThrownBy(() -> companySettingsRepository.saveAndFlush(second))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  @Test
  @DisplayName("Deve rejeitar tentativa de burlar a trava singleton definindo singletonLock = false")
  void shouldRejectFalseSingletonLockViaDatabaseCheckConstraint() {
    CompanySettings bypassed = buildValidEntity();
    bypassed.setId(UUID.randomUUID());
    bypassed.setSingletonLock(false);

    assertThatThrownBy(() -> companySettingsRepository.saveAndFlush(bypassed))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  private static CompanySettings buildValidEntity() {
    CompanySettings settings = new CompanySettings();
    settings.setCompanyName(COMPANY_NAME);
    settings.setTradeName(TRADE_NAME);
    settings.setCnpj(VALID_CNPJ);
    settings.setStateRegistration("Isento");
    settings.setPhone(PHONE);
    settings.setEmail("contato@alumiportas.com.br");
    settings.setZipCode("58800-000");
    settings.setAddress(ADDRESS);
    settings.setCityState(CITY_STATE);
    return settings;
  }
}

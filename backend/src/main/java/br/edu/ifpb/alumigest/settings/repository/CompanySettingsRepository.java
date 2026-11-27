package br.edu.ifpb.alumigest.settings.repository;

import br.edu.ifpb.alumigest.settings.domain.CompanySettings;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para persistência e bloqueio pessimista do registro singleton de
 * configurações institucionais da empresa.
 */
@Repository
public interface CompanySettingsRepository extends JpaRepository<CompanySettings, UUID> {

  /**
   * Recupera o registro singleton ativo da empresa para leitura.
   *
   * @return registro singleton institucional, se existir
   */
  Optional<CompanySettings> findFirstBySingletonLockTrue();

  /**
   * Recupera o registro singleton aplicando bloqueio pessimista de escrita para serializar
   * atualizações concorrentes.
   *
   * @return registro singleton institucional bloqueado para atualização, se existir
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT c FROM CompanySettings c WHERE c.singletonLock = true")
  Optional<CompanySettings> findSingletonForUpdate();
}

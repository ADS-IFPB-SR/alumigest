package br.edu.ifpb.alumigest.auth.repository;

import br.edu.ifpb.alumigest.auth.domain.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA das contas de acesso (US-48).
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

  /**
   * Busca a conta ativa pelo e-mail, ignorando maiúsculas/minúsculas.
   *
   * @param email e-mail de login
   * @return conta ativa correspondente, se existir
   */
  Optional<User> findByEmailIgnoreCaseAndIsActiveTrue(String email);
}

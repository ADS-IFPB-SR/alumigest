package br.edu.ifpb.alumigest.auth.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.edu.ifpb.alumigest.auth.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepository [US-48.1] - Persistência e consultas de contas")
class UserRepositoryTest {

  private static final String HASH = "$2a$10$/5bXcTnnK5DvLJae6OU7VewnqXdf43xbIAxq7Q79e44qyEc4cjmue";

  @Autowired
  private UserRepository userRepository;

  @Test
  @DisplayName("Deve persistir conta com id e timestamps gerados e buscar por e-mail ativo")
  void shouldPersistAndFindActiveByEmail() {
    userRepository.saveAndFlush(new User("Operador AlumiGest", "admin@alumigest.com", HASH));

    User found = userRepository.findByEmailIgnoreCaseAndIsActiveTrue("admin@alumigest.com")
        .orElseThrow();

    assertThat(found.getId()).isNotNull();
    assertThat(found.getName()).isEqualTo("Operador AlumiGest");
    assertThat(found.getPasswordHash()).isEqualTo(HASH);
    assertThat(found.isActive()).isTrue();
    assertThat(found.getCreatedAt()).isNotNull();
    assertThat(found.getUpdatedAt()).isNotNull();
  }

  @Test
  @DisplayName("Deve buscar o e-mail ignorando maiúsculas e minúsculas")
  void shouldFindIgnoringCase() {
    userRepository.saveAndFlush(new User("Operador", "admin@alumigest.com", HASH));

    assertThat(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("ADMIN@AlumiGest.COM"))
        .isPresent();
  }

  @Test
  @DisplayName("Não deve retornar conta inativa")
  void shouldNotReturnInactiveAccount() {
    User inactive = new User("Inativo", "inativo@alumigest.com", HASH);
    org.springframework.test.util.ReflectionTestUtils.setField(inactive, "isActive", false);
    userRepository.saveAndFlush(inactive);

    assertThat(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("inativo@alumigest.com"))
        .isEmpty();
    assertThat(userRepository.findAll()).hasSize(1);
  }

  @Test
  @DisplayName("Deve retornar vazio para e-mail não cadastrado")
  void shouldReturnEmptyForUnknownEmail() {
    assertThat(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("nao@existe.com")).isEmpty();
  }

  @Test
  @DisplayName("Deve impedir e-mails duplicados, inclusive com variação de maiúsculas")
  void shouldRejectDuplicateEmail() {
    userRepository.saveAndFlush(new User("Operador", "admin@alumigest.com", HASH));
    User duplicate = new User("Outro", "ADMIN@alumigest.com", HASH);

    assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
        .isInstanceOf(DataIntegrityViolationException.class);
  }
}

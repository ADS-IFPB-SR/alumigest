package br.edu.ifpb.alumigest.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

@DisplayName("User [US-48.1] - Entidade da conta do operador")
class UserTest {

  @Test
  @DisplayName("Deve criar conta ativa normalizando e-mail (trim + minúsculas) e nome")
  void shouldCreateActiveAccountWithNormalizedFields() {
    User user = new User("  Operador  ", "  Admin@AlumiGest.COM ", " $2a$10$hash ");

    assertThat(user.getName()).isEqualTo("Operador");
    assertThat(user.getEmail()).isEqualTo("admin@alumigest.com");
    assertThat(user.getPasswordHash()).isEqualTo("$2a$10$hash");
    assertThat(user.isActive()).isTrue();
  }

  @Test
  @DisplayName("Deve preencher timestamps no ciclo de vida e atualizar updatedAt")
  void shouldManageTimestamps() {
    User user = new User("Operador", "admin@alumigest.com", "$2a$10$hash");

    user.onCreate();
    assertThat(user.getCreatedAt()).isNotNull();
    assertThat(user.getUpdatedAt()).isEqualTo(user.getCreatedAt());

    var createdAt = user.getCreatedAt();
    user.onUpdate();
    assertThat(user.getCreatedAt()).isEqualTo(createdAt);
    assertThat(user.getUpdatedAt()).isAfterOrEqualTo(createdAt);
  }

  @Test
  @DisplayName("Deve rejeitar nome, e-mail ou hash nulos/vazios")
  void shouldRejectBlankFields() {
    assertThatThrownBy(() -> new User(null, "a@b.com", "hash"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new User("Nome", " ", "hash"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new User("Nome", "a@b.com", ""))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  @DisplayName("Deve comparar contas apenas por id persistido")
  void shouldCompareById() {
    User a = new User("A", "a@alumigest.com", "hash");
    User b = new User("B", "b@alumigest.com", "hash");
    UUID id = UUID.randomUUID();

    assertThat(a)
        .isNotEqualTo(b)
        .isNotEqualTo(null);
    ReflectionTestUtils.setField(a, "id", id);
    ReflectionTestUtils.setField(b, "id", id);

    assertThat(a)
        .isEqualTo(b)
        .hasSameHashCodeAs(b);
  }
}

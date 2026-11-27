package br.edu.ifpb.alumigest.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.dto.AuthUserResponse;
import br.edu.ifpb.alumigest.auth.dto.LoginRequest;
import br.edu.ifpb.alumigest.auth.dto.LoginResponse;
import br.edu.ifpb.alumigest.auth.exception.InvalidCredentialsException;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService [US-48.2] - Autenticação e consulta do operador")
class AuthServiceTest {

  private static final String DUMMY_HASH = "$2a$10$dummyTimingGuardHashValueForTests00000000000";
  private static final String USER_HASH = "$2a$10$storedBcryptHashValueForActiveOperator000000";

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtService jwtService;

  private AuthService authService;
  private User activeUser;
  private UUID userId;

  @BeforeEach
  void setUp() {
    when(passwordEncoder.encode(anyString())).thenReturn(DUMMY_HASH);
    authService = new AuthService(userRepository, passwordEncoder, jwtService);

    userId = UUID.randomUUID();
    activeUser = new User("Operador AlumiGest", "admin@alumigest.com", USER_HASH);
    ReflectionTestUtils.setField(activeUser, "id", userId);
  }

  @Nested
  @DisplayName("Login (POST /api/v1/auth/login)")
  class LoginTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve autenticar operador ativo com credenciais válidas"
            + " e emitir JWT Bearer")
    void shouldAuthenticateActiveUserWithValidCredentials() {
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("admin@alumigest.com"))
          .thenReturn(Optional.of(activeUser));
      when(passwordEncoder.matches("SenhaForte@2026", USER_HASH)).thenReturn(true);
      when(jwtService.generateToken(activeUser)).thenReturn("jwt.signed.token");
      when(jwtService.getExpiration()).thenReturn(Duration.ofHours(8));

      LoginResponse response =
          authService.login(new LoginRequest("  ADMIN@AlumiGest.com  ", "SenhaForte@2026"));

      assertThat(response.token()).isEqualTo("jwt.signed.token");
      assertThat(response.tokenType()).isEqualTo("Bearer");
      assertThat(response.expiresIn()).isEqualTo(28_800L);
      assertThat(response.user()).isEqualTo(
          new AuthUserResponse(userId, "Operador AlumiGest", "admin@alumigest.com"));
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve recusar e-mail inexistente ou conta inativa com mensagem"
            + " uniforme e equalização de tempo")
    void shouldRejectUnknownOrInactiveUserWithUniformMessage() {
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("desconhecido@alumigest.com"))
          .thenReturn(Optional.empty());
      when(passwordEncoder.matches("QualquerSenha", DUMMY_HASH)).thenReturn(false);

      LoginRequest request = new LoginRequest("desconhecido@alumigest.com", "QualquerSenha");

      assertThatThrownBy(() -> authService.login(request))
          .isInstanceOf(InvalidCredentialsException.class)
          .hasMessage("E-mail ou senha inválidos");
      verify(passwordEncoder).matches("QualquerSenha", DUMMY_HASH);
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve recusar senha incorreta com a mesma mensagem uniforme")
    void shouldRejectWrongPasswordWithUniformMessage() {
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("admin@alumigest.com"))
          .thenReturn(Optional.of(activeUser));
      when(passwordEncoder.matches("SenhaErrada", USER_HASH)).thenReturn(false);

      LoginRequest request = new LoginRequest("admin@alumigest.com", "SenhaErrada");

      assertThatThrownBy(() -> authService.login(request))
          .isInstanceOf(InvalidCredentialsException.class)
          .hasMessage("E-mail ou senha inválidos");
    }
  }

  @Nested
  @DisplayName("Operador autenticado (GET /api/v1/auth/me)")
  class AuthenticatedUserTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve retornar dados públicos do operador ativo normalizando"
            + " o e-mail")
    void shouldReturnActiveAuthenticatedUser() {
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("admin@alumigest.com"))
          .thenReturn(Optional.of(activeUser));

      AuthUserResponse user = authService.getAuthenticatedUser("  Admin@AlumiGest.com ");

      assertThat(user.id()).isEqualTo(userId);
      assertThat(user.name()).isEqualTo("Operador AlumiGest");
      assertThat(user.email()).isEqualTo("admin@alumigest.com");
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    @DisplayName(
        "[Análise de Valor Limite] Deve lançar InvalidTokenException quando o e-mail do"
            + " contexto for nulo ou em branco")
    void shouldRejectBlankEmail(String email) {
      assertThatThrownBy(() -> authService.getAuthenticatedUser(email))
          .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve lançar InvalidTokenException quando a conta for desativada"
            + " ou não existir mais")
    void shouldRejectWhenUserNotActiveOrMissing() {
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("inativo@alumigest.com"))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> authService.getAuthenticatedUser("inativo@alumigest.com"))
          .isInstanceOf(InvalidTokenException.class);
    }
  }
}

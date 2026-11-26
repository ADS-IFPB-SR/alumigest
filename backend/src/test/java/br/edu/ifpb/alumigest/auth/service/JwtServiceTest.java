package br.edu.ifpb.alumigest.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.edu.ifpb.alumigest.auth.config.JwtProperties;
import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

@DisplayName("JwtService [US-48.1] - Emissão e validação de JWT HMAC-SHA256")
class JwtServiceTest {

  private static final String SECRET = "alumigest-unit-test-secret-key-0123456789-abcdef";
  private static final Instant T0 = Instant.parse("2026-11-26T12:00:00Z");

  private JwtProperties properties;
  private User user;
  private UUID userId;

  @BeforeEach
  void setUp() {
    properties = new JwtProperties();
    properties.setSecret(SECRET);
    userId = UUID.randomUUID();
    user = new User("Operador AlumiGest", "Admin@AlumiGest.com", "$2a$10$hash");
    ReflectionTestUtils.setField(user, "id", userId);
  }

  private JwtService serviceAt(Instant instant) {
    return new JwtService(properties, Clock.fixed(instant, ZoneOffset.UTC));
  }

  @Nested
  @DisplayName("Geração e extração")
  class GenerationTests {

    @Test
    @DisplayName("Deve gerar token compacto de 3 partes com subject igual ao e-mail normalizado")
    void shouldGenerateTokenWithEmailAsSubject() {
      JwtService service = serviceAt(T0);

      String token = service.generateToken(user);

      assertThat(token.split("\\.")).hasSize(3);
      assertThat(service.extractSubject(token)).isEqualTo("admin@alumigest.com");
      assertThat(service.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Deve emitir claims auxiliares uid e name sem expor o hash da senha")
    void shouldEmitAuxiliaryClaimsWithoutPasswordHash() {
      JwtService service = serviceAt(T0);

      String token = service.generateToken(user);
      String payload = new String(
          java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

      assertThat(payload)
          .contains("\"uid\":\"" + userId + "\"")
          .contains("\"name\":\"Operador AlumiGest\"")
          .doesNotContain("$2a$")
          .doesNotContain("hash");
    }

    @Test
    @DisplayName("Deve assinar o token com HS256")
    void shouldSignWithHs256() {
      String token = serviceAt(T0).generateToken(user);
      String header = new String(
          java.util.Base64.getUrlDecoder().decode(token.split("\\.")[0]), StandardCharsets.UTF_8);

      assertThat(header).contains("\"alg\":\"HS256\"");
    }

    @Test
    @DisplayName("Deve aplicar validade padrão de 8 horas")
    void shouldApplyDefaultEightHoursExpiration() {
      JwtService service = serviceAt(T0);

      String token = service.generateToken(user);

      assertThat(service.getExpiration()).isEqualTo(Duration.ofHours(8));
      assertThat(service.extractExpiration(token)).isEqualTo(T0.plus(Duration.ofHours(8)));
    }

    @Test
    @DisplayName("Deve respeitar validade customizada configurada")
    void shouldHonorCustomExpiration() {
      properties.setExpiration(Duration.ofMinutes(30));
      JwtService service = serviceAt(T0);

      String token = service.generateToken(user);

      assertThat(service.extractExpiration(token)).isEqualTo(T0.plus(Duration.ofMinutes(30)));
    }

    @Test
    @DisplayName("Deve emitir token mesmo para conta ainda não persistida (sem id)")
    void shouldGenerateTokenForTransientUser() {
      User transientUser = new User("Novo", "novo@alumigest.com", "$2a$10$hash");
      JwtService service = serviceAt(T0);

      String token = service.generateToken(transientUser);

      assertThat(service.extractSubject(token)).isEqualTo("novo@alumigest.com");
    }

    @Test
    @DisplayName("Deve rejeitar emissão para conta nula")
    void shouldRejectNullUser() {
      JwtService service = serviceAt(T0);

      assertThatThrownBy(() -> service.generateToken(null))
          .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Deve usar o relógio do sistema no construtor padrão")
    void shouldUseSystemClockByDefault() {
      JwtService service = new JwtService(properties);

      String token = service.generateToken(user);

      assertThat(service.isTokenValid(token)).isTrue();
      assertThat(service.extractExpiration(token)).isAfter(Instant.now());
    }
  }

  @Nested
  @DisplayName("Expiração (valor limite)")
  class ExpirationTests {

    @Test
    @DisplayName("Deve aceitar o token 1 segundo antes de expirar")
    void shouldAcceptTokenJustBeforeExpiration() {
      String token = serviceAt(T0).generateToken(user);
      JwtService later = serviceAt(T0.plus(Duration.ofHours(8)).minusSeconds(1));

      assertThat(later.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Deve rejeitar o token expirado e lançar InvalidTokenException na extração")
    void shouldRejectExpiredToken() {
      String token = serviceAt(T0).generateToken(user);
      JwtService later = serviceAt(T0.plus(Duration.ofHours(8)).plusSeconds(1));

      assertThat(later.isTokenValid(token)).isFalse();
      assertThatThrownBy(() -> later.extractSubject(token))
          .isInstanceOf(InvalidTokenException.class);
      assertThatThrownBy(() -> later.extractExpiration(token))
          .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    @DisplayName("Deve rejeitar token assinado sem claim de expiração")
    void shouldRejectTokenWithoutExpirationClaim() {
      SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
      String tokenWithoutExp = Jwts.builder()
          .subject("admin@alumigest.com")
          .claim(Claims.ISSUED_AT, T0.getEpochSecond())
          .signWith(key, Jwts.SIG.HS256)
          .compact();

      assertThat(serviceAt(T0).isTokenValid(tokenWithoutExp)).isFalse();
    }
  }

  @Nested
  @DisplayName("Assinatura e integridade")
  class SignatureTests {

    @Test
    @DisplayName("Deve rejeitar token assinado com outro segredo")
    void shouldRejectTokenSignedWithDifferentSecret() {
      JwtProperties other = new JwtProperties();
      other.setSecret("another-secret-key-with-more-than-32-bytes-0123456789");
      String foreignToken =
          new JwtService(other, Clock.fixed(T0, ZoneOffset.UTC)).generateToken(user);
      JwtService service = serviceAt(T0);

      assertThat(service.isTokenValid(foreignToken)).isFalse();
      assertThatThrownBy(() -> service.extractSubject(foreignToken))
          .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    @DisplayName("Deve rejeitar token com payload adulterado")
    void shouldRejectTamperedPayload() {
      JwtService service = serviceAt(T0);
      String[] parts = service.generateToken(user).split("\\.");
      String forgedPayload = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
          "{\"sub\":\"intruso@evil.com\",\"exp\":9999999999}".getBytes(StandardCharsets.UTF_8));
      String tampered = parts[0] + "." + forgedPayload + "." + parts[2];

      assertThat(service.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("Deve rejeitar token assinado com HS384 mesmo usando o mesmo segredo")
    void shouldRejectNonHs256Algorithm() {
      SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
      String hs384Token = Jwts.builder()
          .subject("admin@alumigest.com")
          .claim(Claims.ISSUED_AT, T0.getEpochSecond())
          .claim(Claims.EXPIRATION, T0.plusSeconds(3600).getEpochSecond())
          .signWith(key, Jwts.SIG.HS384)
          .compact();

      assertThat(serviceAt(T0).isTokenValid(hs384Token)).isFalse();
    }

    @Test
    @DisplayName("Deve rejeitar token sem assinatura (alg none)")
    void shouldRejectUnsignedToken() {
      String unsigned = Jwts.builder()
          .subject("admin@alumigest.com")
          .claim(Claims.EXPIRATION, T0.plusSeconds(3600).getEpochSecond())
          .compact();

      assertThat(serviceAt(T0).isTokenValid(unsigned)).isFalse();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "abc", "a.b.c", "não-é-jwt"})
    @DisplayName("Deve rejeitar tokens nulos, vazios ou malformados")
    void shouldRejectMalformedTokens(String token) {
      JwtService service = serviceAt(T0);

      assertThat(service.isTokenValid(token)).isFalse();
      assertThatThrownBy(() -> service.extractSubject(token))
          .isInstanceOf(InvalidTokenException.class);
    }
  }

  @Nested
  @DisplayName("Configuração inválida")
  class ConfigurationTests {

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    @DisplayName("Deve falhar quando o segredo estiver ausente")
    void shouldFailWhenSecretMissing(String secret) {
      properties.setSecret(secret);

      assertThatThrownBy(() -> new JwtService(properties))
          .isInstanceOf(IllegalStateException.class)
          .hasMessageContaining("JWT_SECRET");
    }

    @Test
    @DisplayName("Deve falhar quando o segredo tiver menos de 32 bytes")
    void shouldFailWhenSecretTooShort() {
      properties.setSecret("0123456789abcdef0123456789abcde");

      assertThatThrownBy(() -> new JwtService(properties))
          .isInstanceOf(IllegalStateException.class)
          .hasMessageContaining("32 bytes");
    }

    @Test
    @DisplayName("Deve aceitar segredo com exatamente 32 bytes")
    void shouldAcceptSecretWithExactly32Bytes() {
      properties.setSecret("0123456789abcdef0123456789abcdef");

      JwtService service = new JwtService(properties);

      assertThat(service.isTokenValid(service.generateToken(user))).isTrue();
    }

    @Test
    @DisplayName("Deve falhar quando a validade for nula, zero ou negativa")
    void shouldFailWhenExpirationNotPositive() {
      properties.setExpiration(Duration.ZERO);
      assertThatThrownBy(() -> new JwtService(properties))
          .isInstanceOf(IllegalStateException.class);

      properties.setExpiration(Duration.ofMinutes(-5));
      assertThatThrownBy(() -> new JwtService(properties))
          .isInstanceOf(IllegalStateException.class);

      properties.setExpiration(null);
      assertThatThrownBy(() -> new JwtService(properties))
          .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Deve rejeitar propriedades ou relógio nulos")
    void shouldRejectNullDependencies() {
      Clock utcClock = Clock.systemUTC();

      assertThatThrownBy(() -> new JwtService(null, utcClock))
          .isInstanceOf(NullPointerException.class);
      assertThatThrownBy(() -> new JwtService(properties, null))
          .isInstanceOf(NullPointerException.class);
    }
  }
}

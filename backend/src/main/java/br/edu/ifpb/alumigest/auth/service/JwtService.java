package br.edu.ifpb.alumigest.auth.service;

import br.edu.ifpb.alumigest.auth.config.JwtProperties;
import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Serviço de emissão e validação de tokens JWT assinados com HMAC-SHA256 (US-48.1).
 *
 * <p>O {@code subject} do token é o e-mail da conta; {@code uid} e {@code name} são emitidos como
 * claims auxiliares. Apenas o algoritmo HS256 é aceito na validação.
 */
@Service
public class JwtService {

  /** Tamanho mínimo do segredo em bytes (256 bits) exigido pelo HMAC-SHA256. */
  static final int MIN_SECRET_BYTES = 32;

  static final String CLAIM_USER_ID = "uid";
  static final String CLAIM_NAME = "name";
  private static final String ALGORITHM_HS256 = "HS256";

  private final SecretKey signingKey;
  private final Duration expiration;
  private final Clock clock;

  @Autowired
  public JwtService(JwtProperties properties) {
    this(properties, Clock.systemUTC());
  }

  /**
   * Construtor com relógio injetável (utilizado para testar expiração de forma determinística).
   *
   * @param properties propriedades do JWT (segredo e validade)
   * @param clock relógio de referência para emissão e validação
   */
  public JwtService(JwtProperties properties, Clock clock) {
    Objects.requireNonNull(properties, "As propriedades JWT são obrigatórias.");
    this.clock = Objects.requireNonNull(clock, "O relógio é obrigatório.");
    this.signingKey = buildSigningKey(properties.getSecret());
    this.expiration = requirePositive(properties.getExpiration());
  }

  /**
   * Emite um token JWT assinado para a conta informada.
   *
   * @param user conta autenticada
   * @return token JWT compacto (header.payload.signature)
   */
  public String generateToken(User user) {
    Objects.requireNonNull(user, "A conta é obrigatória para emissão do token.");
    Instant now = clock.instant();
    return Jwts.builder()
        .subject(user.getEmail())
        .claim(CLAIM_USER_ID, user.getId() != null ? user.getId().toString() : null)
        .claim(CLAIM_NAME, user.getName())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(expiration)))
        .signWith(signingKey, Jwts.SIG.HS256)
        .compact();
  }

  /**
   * Extrai o subject (e-mail da conta) de um token válido.
   *
   * @param token token JWT compacto
   * @return subject do token
   * @throws InvalidTokenException se o token for inválido, expirado ou adulterado
   */
  public String extractSubject(String token) {
    return parseClaims(token).getSubject();
  }

  /**
   * Extrai a data de expiração de um token válido.
   *
   * @param token token JWT compacto
   * @return instante de expiração
   * @throws InvalidTokenException se o token for inválido, expirado ou adulterado
   */
  public Instant extractExpiration(String token) {
    return parseClaims(token).getExpiration().toInstant();
  }

  /**
   * Indica se o token possui assinatura válida e não está expirado.
   *
   * @param token token JWT compacto
   * @return {@code true} se válido; {@code false} caso contrário (sem lançar exceção)
   */
  public boolean isTokenValid(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (InvalidTokenException e) {
      return false;
    }
  }

  /**
   * Validade configurada para os tokens emitidos.
   *
   * @return duração de validade
   */
  public Duration getExpiration() {
    return expiration;
  }

  private Claims parseClaims(String token) {
    if (token == null || token.isBlank()) {
      throw new InvalidTokenException("O token JWT é obrigatório.");
    }
    try {
      Jws<Claims> jws = Jwts.parser()
          .verifyWith(signingKey)
          .clock(() -> Date.from(clock.instant()))
          .build()
          .parseSignedClaims(token);
      if (!ALGORITHM_HS256.equals(jws.getHeader().getAlgorithm())) {
        throw new InvalidTokenException("Algoritmo de assinatura do token não suportado.");
      }
      return jws.getPayload();
    } catch (JwtException | IllegalArgumentException e) {
      throw new InvalidTokenException("Token JWT inválido ou expirado.", e);
    }
  }

  private static SecretKey buildSigningKey(String secret) {
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("O segredo JWT (JWT_SECRET) não foi configurado.");
    }
    byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
    if (bytes.length < MIN_SECRET_BYTES) {
      throw new IllegalStateException(
          "O segredo JWT deve possuir no mínimo " + MIN_SECRET_BYTES + " bytes (256 bits).");
    }
    return Keys.hmacShaKeyFor(bytes);
  }

  private static Duration requirePositive(Duration value) {
    if (value == null || value.isZero() || value.isNegative()) {
      throw new IllegalStateException("A validade do token JWT deve ser positiva.");
    }
    return value;
  }
}

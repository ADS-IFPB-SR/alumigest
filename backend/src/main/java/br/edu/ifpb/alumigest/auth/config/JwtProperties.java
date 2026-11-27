package br.edu.ifpb.alumigest.auth.config;

import jakarta.validation.constraints.NotBlank;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Propriedades de configuração do JWT (prefixo {@code security.jwt}).
 *
 * <p>O segredo HMAC jamais possui valor padrão em {@code application.yml}: deve ser informado via
 * variável de ambiente {@code JWT_SECRET} (ou pelo perfil {@code dev}/{@code test}). A validade do
 * token é de 8 horas por padrão e pode ser alterada via {@code JWT_EXPIRATION}.
 */
@Component
@Validated
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {

  /** Validade padrão do token (RNF-006). */
  public static final Duration DEFAULT_EXPIRATION = Duration.ofHours(8);

  @NotBlank(message = "O segredo JWT (security.jwt.secret / JWT_SECRET) é obrigatório")
  private String secret;

  private Duration expiration = DEFAULT_EXPIRATION;

  public String getSecret() {
    return secret;
  }

  public void setSecret(String secret) {
    this.secret = secret;
  }

  public Duration getExpiration() {
    return expiration;
  }

  public void setExpiration(Duration expiration) {
    this.expiration = expiration;
  }
}

package br.edu.ifpb.alumigest.auth.dto;

import br.edu.ifpb.alumigest.auth.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

/**
 * Projeção pública e segura dos dados do operador autenticado (jamais inclui hash de senha).
 *
 * @param id identificador único da conta
 * @param name nome de exibição do operador
 * @param email e-mail normalizado do operador
 */
@Schema(description = "Dados públicos do operador autenticado")
public record AuthUserResponse(
    @Schema(description = "Identificador UUID do operador")
    UUID id,

    @Schema(description = "Nome do operador", example = "Operador AlumiGest")
    String name,

    @Schema(description = "E-mail do operador", example = "admin@alumigest.com")
    String email
) {

  /**
   * Converte a entidade {@link User} para a resposta pública de autenticação.
   *
   * @param user entidade persistida
   * @return representação segura sem dados sensíveis
   */
  public static AuthUserResponse from(User user) {
    return new AuthUserResponse(user.getId(), user.getName(), user.getEmail());
  }
}

package br.edu.ifpb.alumigest.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Resposta de autenticação bem-sucedida contendo o token JWT e os dados do operador (US-48.2).
 *
 * @param token token JWT assinado (HS256)
 * @param tokenType esquema de autenticação ({@code Bearer})
 * @param expiresIn validade do token em segundos
 * @param user dados públicos do operador autenticado
 */
@Schema(description = "Resposta de autenticação contendo o token JWT Bearer")
public record LoginResponse(
    @Schema(description = "Token JWT assinado")
    String token,

    @Schema(description = "Tipo do token de autenticação", example = "Bearer")
    String tokenType,

    @Schema(description = "Tempo de validade do token em segundos", example = "28800")
    long expiresIn,

    @Schema(description = "Dados do operador autenticado")
    AuthUserResponse user
) {
}

package br.edu.ifpb.alumigest.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Payload de autenticação do operador (US-48.2).
 *
 * @param email e-mail de acesso do operador
 * @param password senha em texto puro enviada sobre TLS (jamais logada)
 */
@Schema(description = "Credenciais de acesso para autenticação do operador")
public record LoginRequest(
    @Schema(description = "E-mail cadastrado do operador", example = "admin@alumigest.com")
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    String email,

    @Schema(description = "Senha do operador", example = "AlumiGest@2026")
    @NotBlank(message = "A senha é obrigatória")
    String password
) {
}

package br.edu.ifpb.alumigest.auth.controller;

import br.edu.ifpb.alumigest.auth.dto.AuthUserResponse;
import br.edu.ifpb.alumigest.auth.dto.LoginRequest;
import br.edu.ifpb.alumigest.auth.dto.LoginResponse;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import br.edu.ifpb.alumigest.auth.service.AuthService;
import br.edu.ifpb.alumigest.common.config.OpenApiConfig;
import br.edu.ifpb.alumigest.common.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints REST de autenticação stateless via JWT (US-48.2).
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Endpoints de login e consulta da sessão JWT")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  /**
   * Autentica o operador e retorna um token JWT Bearer.
   *
   * @param request credenciais de acesso
   * @return resposta 200 OK com token e dados básicos do operador
   */
  @PostMapping("/login")
  @SecurityRequirements
  @Operation(
      summary = "Autenticar operador",
      description = "Valida e-mail e senha do operador e emite um token JWT Bearer.")
  @ApiResponse(responseCode = "200", description = "Autenticação realizada com sucesso")
  @ApiResponse(
      responseCode = "400",
      description = "Erro de validação nos campos informados",
      content = @Content(
          mediaType = MediaType.APPLICATION_JSON_VALUE,
          schema = @Schema(implementation = ErrorResponse.class)))
  @ApiResponse(
      responseCode = "401",
      description = "Credenciais inválidas",
      content = @Content(
          mediaType = MediaType.APPLICATION_JSON_VALUE,
          schema = @Schema(implementation = ErrorResponse.class)))
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  /**
   * Retorna os dados básicos do operador autenticado no contexto atual.
   *
   * @param authentication contexto de autenticação preenchido pelo filtro JWT
   * @return dados públicos do operador autenticado
   */
  @GetMapping("/me")
  @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH_SCHEME)
  @Operation(
      summary = "Consultar operador autenticado",
      description = "Retorna os dados básicos do operador associado ao token JWT enviado.")
  @ApiResponse(responseCode = "200", description = "Dados do operador retornados com sucesso")
  @ApiResponse(
      responseCode = "401",
      description = "Token ausente, inválido ou expirado",
      content = @Content(
          mediaType = MediaType.APPLICATION_JSON_VALUE,
          schema = @Schema(implementation = ErrorResponse.class)))
  public ResponseEntity<AuthUserResponse> me(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new InvalidTokenException("Autenticação necessária.");
    }
    return ResponseEntity.ok(authService.getAuthenticatedUser(authentication.getName()));
  }
}

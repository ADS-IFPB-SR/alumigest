package br.edu.ifpb.alumigest.auth.security;

import br.edu.ifpb.alumigest.common.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * Ponto de entrada REST para requisições não autenticadas ou com token JWT inválido/expirado.
 *
 * <p>Retorna HTTP 401 Unauthorized com payload JSON padronizado ({@link ErrorResponse}), sem expor
 * stack traces ou detalhes internos de autenticação.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

  static final String DEFAULT_UNAUTHORIZED_MESSAGE =
      "Autenticação necessária. Informe um token Bearer válido.";

  private final ObjectMapper objectMapper;

  public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException {
    String message = resolveMessage(request);
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    response.setStatus(status.value());
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

    ErrorResponse body = ErrorResponse.of(
        status.value(),
        status.getReasonPhrase(),
        message,
        request.getRequestURI()
    );
    objectMapper.writeValue(response.getWriter(), body);
  }

  private static String resolveMessage(HttpServletRequest request) {
    Object attr = request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE);
    if (attr instanceof String customMessage && !customMessage.isBlank()) {
      return customMessage;
    }
    return DEFAULT_UNAUTHORIZED_MESSAGE;
  }
}

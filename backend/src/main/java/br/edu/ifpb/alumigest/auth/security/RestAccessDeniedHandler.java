package br.edu.ifpb.alumigest.auth.security;

import br.edu.ifpb.alumigest.common.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/**
 * Handler REST para acessos negados (HTTP 403 Forbidden) com resposta JSON padronizada.
 */
public class RestAccessDeniedHandler implements AccessDeniedHandler {

  static final String DEFAULT_FORBIDDEN_MESSAGE = "Acesso negado ao recurso solicitado.";

  private final ObjectMapper objectMapper;

  public RestAccessDeniedHandler(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void handle(
      HttpServletRequest request,
      HttpServletResponse response,
      AccessDeniedException accessDeniedException)
      throws IOException {
    HttpStatus status = HttpStatus.FORBIDDEN;
    response.setStatus(status.value());
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

    ErrorResponse body = ErrorResponse.of(
        status.value(),
        status.getReasonPhrase(),
        DEFAULT_FORBIDDEN_MESSAGE,
        request.getRequestURI()
    );
    objectMapper.writeValue(response.getWriter(), body);
  }
}

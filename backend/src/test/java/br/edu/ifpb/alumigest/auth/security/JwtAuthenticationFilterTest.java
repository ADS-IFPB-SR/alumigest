package br.edu.ifpb.alumigest.auth.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import br.edu.ifpb.alumigest.auth.service.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
@DisplayName("Segurança JWT [US-48.2] - Filtro, EntryPoint e AccessDeniedHandler")
class JwtAuthenticationFilterTest {

  @Mock
  private JwtService jwtService;

  @Mock
  private UserRepository userRepository;

  private JwtAuthenticationFilter filter;
  private FilterChain filterChain;
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    SecurityContextHolder.clearContext();
    filter = new JwtAuthenticationFilter(jwtService, userRepository);
    filterChain = mock(FilterChain.class);
    objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Nested
  @DisplayName("JwtAuthenticationFilter")
  class FilterTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve autenticar no SecurityContext quando token Bearer"
            + " for válido e conta estiver ativa")
    void shouldAuthenticateValidBearerTokenForActiveUser() throws Exception {
      User user = new User("Operador", "admin@alumigest.com", "$2a$10$hash");
      when(jwtService.extractSubject("valid.jwt.token")).thenReturn("admin@alumigest.com");
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("admin@alumigest.com"))
          .thenReturn(Optional.of(user));

      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer valid.jwt.token");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
      assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
          .isEqualTo("admin@alumigest.com");
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE)).isNull();
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve ignorar requisição sem header Authorization ou com"
            + " esquema diferente de Bearer")
    void shouldPassThroughWithoutBearerHeader() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/health");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE)).isNull();
      verify(jwtService, never()).extractSubject(org.mockito.ArgumentMatchers.anyString());
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Análise de Valor Limite] Deve marcar erro de token quando header Bearer estiver vazio")
    void shouldMarkErrorWhenBearerTokenIsBlank() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer    ");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
          .isEqualTo(JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve limpar contexto e sinalizar erro para token inválido ou expirado")
    void shouldClearContextOnInvalidToken() throws Exception {
      when(jwtService.extractSubject("expired.token"))
          .thenThrow(new InvalidTokenException("Token JWT inválido ou expirado."));

      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer expired.token");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
          .isEqualTo(JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve rejeitar token válido cuja conta foi desativada ou removida")
    void shouldRejectValidTokenForInactiveUser() throws Exception {
      when(jwtService.extractSubject("inactive.user.token")).thenReturn("inativo@alumigest.com");
      when(userRepository.findByEmailIgnoreCaseAndIsActiveTrue("inativo@alumigest.com"))
          .thenReturn(Optional.empty());

      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer inactive.user.token");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
          .isEqualTo(JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve rejeitar token com subject vazio")
    void shouldRejectTokenWithBlankSubject() throws Exception {
      when(jwtService.extractSubject("blank.sub.token")).thenReturn("   ");

      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer blank.sub.token");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
      assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
          .isEqualTo(JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
      verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve preservar autenticação já existente no SecurityContext")
    void shouldPreserveExistingAuthentication() throws Exception {
      UsernamePasswordAuthenticationToken existing = new UsernamePasswordAuthenticationToken(
          "already@alumigest.com", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
      SecurityContextHolder.getContext().setAuthentication(existing);

      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer ignored.token");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, filterChain);

      assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
      verify(jwtService, never()).extractSubject(org.mockito.ArgumentMatchers.anyString());
      verify(filterChain).doFilter(request, response);
    }
  }

  @Nested
  @DisplayName("EntryPoint 401 e AccessDeniedHandler 403")
  class ErrorHandlerTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] RestAuthenticationEntryPoint deve retornar 401 JSON"
            + " padronizado com mensagem padrão quando sem atributo de erro")
    void entryPointShouldReturnDefaultUnauthorizedJson() throws Exception {
      RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);
      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/clients");
      MockHttpServletResponse response = new MockHttpServletResponse();

      entryPoint.commence(request, response, new BadCredentialsException("internal detail"));

      assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
      assertThat(response.getContentType()).startsWith(MediaType.APPLICATION_JSON_VALUE);
      JsonNode body = objectMapper.readTree(response.getContentAsString());
      assertThat(body.get("status").asInt()).isEqualTo(401);
      assertThat(body.get("error").asText()).isEqualTo("Unauthorized");
      assertThat(body.get("message").asText())
          .isEqualTo(RestAuthenticationEntryPoint.DEFAULT_UNAUTHORIZED_MESSAGE);
      assertThat(body.get("path").asText()).isEqualTo("/api/v1/clients");
      assertThat(response.getContentAsString()).doesNotContain("internal detail");
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] RestAuthenticationEntryPoint deve usar mensagem segura do"
            + " filtro quando token for inválido ou expirado")
    void entryPointShouldUseCustomTokenErrorMessage() throws Exception {
      RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);
      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
      request.setAttribute(
          JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE,
          JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
      MockHttpServletResponse response = new MockHttpServletResponse();

      entryPoint.commence(request, response, new BadCredentialsException("stack"));

      JsonNode body = objectMapper.readTree(response.getContentAsString());
      assertThat(body.get("status").asInt()).isEqualTo(401);
      assertThat(body.get("message").asText())
          .isEqualTo(JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] RestAccessDeniedHandler deve retornar 403 JSON padronizado")
    void accessDeniedHandlerShouldReturnForbiddenJson() throws Exception {
      RestAccessDeniedHandler handler = new RestAccessDeniedHandler(objectMapper);
      MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/v1/admin");
      MockHttpServletResponse response = new MockHttpServletResponse();

      handler.handle(request, response, new AccessDeniedException("denied"));

      assertThat(response.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
      assertThat(response.getContentType()).startsWith(MediaType.APPLICATION_JSON_VALUE);
      JsonNode body = objectMapper.readTree(response.getContentAsString());
      assertThat(body.get("status").asInt()).isEqualTo(403);
      assertThat(body.get("error").asText()).isEqualTo("Forbidden");
      assertThat(body.get("message").asText())
          .isEqualTo(RestAccessDeniedHandler.DEFAULT_FORBIDDEN_MESSAGE);
      assertThat(body.get("path").asText()).isEqualTo("/api/v1/admin");
    }
  }
}

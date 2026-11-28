package br.edu.ifpb.alumigest.auth.security;

import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import br.edu.ifpb.alumigest.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro stateless de autenticação via JWT Bearer (US-48.2).
 *
 * <p>Intencionalmente não anotado com {@code @Component}: é instanciado dentro da
 * {@code SecurityConfig} para evitar registro duplicado no container de servlets e preservar a
 * isolação dos testes {@code @WebMvcTest}.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  public static final String AUTH_ERROR_ATTRIBUTE = "alumigest.auth.error";
  static final String INVALID_TOKEN_MESSAGE = "Token JWT inválido ou expirado.";
  private static final String BEARER_PREFIX = "Bearer ";

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {
    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(BEARER_PREFIX.length()).trim();
    if (token.isEmpty()) {
      markInvalidToken(request);
      filterChain.doFilter(request, response);
      return;
    }

    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      authenticateWithToken(token, request);
    }

    filterChain.doFilter(request, response);
  }

  private void authenticateWithToken(String token, HttpServletRequest request) {
    try {
      String email = jwtService.extractSubject(token);
      if (email == null || email.isBlank()) {
        markInvalidToken(request);
        return;
      }

      Optional<User> activeUser = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email);
      if (activeUser.isEmpty()) {
        log.debug("Token JWT rejeitado: conta inexistente ou inativa.");
        markInvalidToken(request);
        return;
      }

      User user = activeUser.get();
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              user.getEmail(),
              null,
              List.of(new SimpleGrantedAuthority("ROLE_USER")));
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (InvalidTokenException ex) {
      log.debug("Token JWT inválido ou expirado na requisição {}.", request.getRequestURI());
      markInvalidToken(request);
    }
  }

  private static void markInvalidToken(HttpServletRequest request) {
    SecurityContextHolder.clearContext();
    request.setAttribute(AUTH_ERROR_ATTRIBUTE, INVALID_TOKEN_MESSAGE);
  }
}

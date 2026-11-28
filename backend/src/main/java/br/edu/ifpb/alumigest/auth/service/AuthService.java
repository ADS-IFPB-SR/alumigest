package br.edu.ifpb.alumigest.auth.service;

import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.dto.AuthUserResponse;
import br.edu.ifpb.alumigest.auth.dto.LoginRequest;
import br.edu.ifpb.alumigest.auth.dto.LoginResponse;
import br.edu.ifpb.alumigest.auth.exception.InvalidCredentialsException;
import br.edu.ifpb.alumigest.auth.exception.InvalidTokenException;
import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço de autenticação do operador único do AlumiGest (US-48.2).
 *
 * <p>Garante resposta uniforme ({@code E-mail ou senha inválidos}) para e-mail inexistente, conta
 * inativa ou senha incorreta, sem jamais registrar senhas ou hashes em logs.
 */
@Service
public class AuthService {

  public static final String TOKEN_TYPE_BEARER = "Bearer";

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final String dummyPasswordHash;

  /**
   * Cria o serviço de autenticação.
   *
   * @param userRepository repositório de contas de acesso
   * @param passwordEncoder codificador BCrypt
   * @param jwtService emissor de tokens JWT
   */
  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.dummyPasswordHash = passwordEncoder.encode("timing-guard-" + UUID.randomUUID());
  }

  /**
   * Valida as credenciais informadas e emite um token JWT assinado.
   *
   * @param request credenciais de login
   * @return resposta contendo token JWT, tipo, validade em segundos e dados públicos do operador
   * @throws InvalidCredentialsException se o e-mail não existir, a conta estiver inativa ou a senha
   *     não conferir
   */
  @Transactional(readOnly = true)
  public LoginResponse login(LoginRequest request) {
    String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
    Optional<User> userOpt = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(normalizedEmail);

    if (userOpt.isEmpty()) {
      if (dummyPasswordHash != null) {
        passwordEncoder.matches(request.password(), dummyPasswordHash);
      }
      log.warn("Tentativa de autenticação recusada: credenciais inválidas.");
      throw new InvalidCredentialsException();
    }

    User user = userOpt.get();
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Tentativa de autenticação recusada: credenciais inválidas.");
      throw new InvalidCredentialsException();
    }

    String token = jwtService.generateToken(user);
    long expiresIn = jwtService.getExpiration().toSeconds();
    return new LoginResponse(token, TOKEN_TYPE_BEARER, expiresIn, AuthUserResponse.from(user));
  }

  /**
   * Recupera os dados públicos do operador autenticado a partir do subject (e-mail) do token.
   *
   * @param email e-mail extraído do {@code SecurityContext}
   * @return dados públicos do operador ativo
   * @throws InvalidTokenException se o e-mail estiver vazio ou a conta não estiver ativa
   */
  @Transactional(readOnly = true)
  public AuthUserResponse getAuthenticatedUser(String email) {
    if (email == null || email.isBlank()) {
      throw new InvalidTokenException("Sessão inválida ou expirada.");
    }
    String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
    return userRepository
        .findByEmailIgnoreCaseAndIsActiveTrue(normalizedEmail)
        .map(AuthUserResponse::from)
        .orElseThrow(() -> new InvalidTokenException("Sessão inválida ou usuário inativo."));
  }
}

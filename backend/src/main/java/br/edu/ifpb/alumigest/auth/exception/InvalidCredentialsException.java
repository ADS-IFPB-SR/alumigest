package br.edu.ifpb.alumigest.auth.exception;

/**
 * Lançada quando a autenticação falha por e-mail inexistente, conta inativa ou senha incorreta.
 *
 * <p>Mantém mensagem uniforme para evitar enumeração de usuários.
 */
public class InvalidCredentialsException extends RuntimeException {

  public static final String DEFAULT_MESSAGE = "E-mail ou senha inválidos";

  public InvalidCredentialsException() {
    super(DEFAULT_MESSAGE);
  }

  public InvalidCredentialsException(String message) {
    super(message);
  }
}

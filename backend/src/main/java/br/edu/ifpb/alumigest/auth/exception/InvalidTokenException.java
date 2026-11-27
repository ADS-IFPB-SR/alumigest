package br.edu.ifpb.alumigest.auth.exception;

/**
 * Lançada quando um token JWT é nulo, malformado, expirado, adulterado ou assinado com algoritmo
 * ou segredo inesperado.
 */
public class InvalidTokenException extends RuntimeException {

  public InvalidTokenException(String message) {
    super(message);
  }

  public InvalidTokenException(String message, Throwable cause) {
    super(message, cause);
  }
}

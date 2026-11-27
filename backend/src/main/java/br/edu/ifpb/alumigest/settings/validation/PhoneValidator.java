package br.edu.ifpb.alumigest.settings.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validador dedicado para números de telefone comerciais e WhatsApp brasileiros ({@link
 * ValidPhone}).
 *
 * <p>Valores nulos ou em branco retornam {@code true} para delegar a obrigatoriedade a {@code
 * @NotBlank} sem gerar erros duplicados. Para textos preenchidos, aceita exclusivamente dígitos
 * ASCII ({@code '0'..'9'}) e separadores de formatação ({@code ' '}, {@code '-'}, {@code '('},
 * {@code ')'}, além de {@code '+'} apenas na primeira posição após {@code trim()}), exigindo entre
 * 8 e 13 dígitos numéricos.
 */
public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {

  private static final int MIN_DIGITS = 8;
  private static final int MAX_DIGITS = 13;
  private static final String ALLOWED_SEPARATORS = " -()";

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null || value.isBlank()) {
      return true;
    }
    int digitCount = countDigitsIfCharsValid(value.trim());
    return digitCount >= MIN_DIGITS && digitCount <= MAX_DIGITS;
  }

  private static int countDigitsIfCharsValid(String trimmed) {
    int digitCount = 0;
    for (int i = 0; i < trimmed.length(); i++) {
      char ch = trimmed.charAt(i);
      if (isAsciiDigit(ch)) {
        digitCount++;
      } else if (!isAllowedFormattingChar(ch, i)) {
        return -1;
      }
    }
    return digitCount;
  }

  private static boolean isAsciiDigit(char ch) {
    return ch >= '0' && ch <= '9';
  }

  private static boolean isAllowedFormattingChar(char ch, int index) {
    return (ch == '+' && index == 0) || ALLOWED_SEPARATORS.indexOf(ch) >= 0;
  }
}

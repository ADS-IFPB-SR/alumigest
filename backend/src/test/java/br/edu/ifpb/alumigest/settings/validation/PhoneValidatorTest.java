package br.edu.ifpb.alumigest.settings.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("PhoneValidator — Testes Unitários de Validação de Telefone (US-50.1)")
class PhoneValidatorTest {

  private final PhoneValidator validator = new PhoneValidator();

  @ParameterizedTest(name = "Deve aceitar nulo/branco ou formato válido [{index}]: ''{0}''")
  @NullAndEmptySource
  @ValueSource(
      strings = {
        "   ",
        "35210000",
        "3521-0000",
        "99999-9999",
        "(83) 3521-0000",
        "(83) 99999-9999",
        "83999999999",
        "+55 83 3521-0000",
        "+55 (83) 99999-9999",
        "  +55 83 99999-9999  ",
        "5583999999999"
      })
  @DisplayName(
      "Deve aceitar valores em branco e telefones brasileiros válidos entre 8 e 13 dígitos")
  void shouldAcceptBlankAndValidBrazilianPhoneFormats(String candidate) {
    assertThat(validator.isValid(candidate, null)).isTrue();
  }

  @ParameterizedTest(name = "Deve rejeitar formato inválido [{index}]: ''{0}''")
  @ValueSource(
      strings = {
        "1234567",
        "+1234567",
        "12345678901234",
        "+55 (83) 99999-99990",
        "tel-abc",
        "(83) 99999/9999",
        "(83) 99999.9999",
        "83+99999-9999",
        "(83) +99999-9999",
        "--------"
      })
  @DisplayName(
      "Deve rejeitar telefones fora da faixa de dígitos ou com caracteres não permitidos")
  void shouldRejectInvalidPhoneFormats(String candidate) {
    assertThat(validator.isValid(candidate, null)).isFalse();
  }
}

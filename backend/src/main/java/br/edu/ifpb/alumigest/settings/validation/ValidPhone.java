package br.edu.ifpb.alumigest.settings.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Restrição Jakarta Bean Validation para validação de formato de telefone comercial ou WhatsApp.
 */
@Documented
@Constraint(validatedBy = PhoneValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhone {

  /**
   * Mensagem padrão retornada quando o telefone informado possui formato inválido.
   *
   * @return mensagem de erro de validação
   */
  String message() default "Telefone com formato inválido";

  /**
   * Grupos de validação aplicáveis à restrição.
   *
   * @return grupos de validação
   */
  Class<?>[] groups() default {};

  /**
   * Metadados associados ao payload da restrição.
   *
   * @return classes de payload
   */
  Class<? extends Payload>[] payload() default {};
}

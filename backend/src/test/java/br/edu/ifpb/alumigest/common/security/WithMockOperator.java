package br.edu.ifpb.alumigest.common.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.security.test.context.support.WithMockUser;

/**
 * Meta-anotação de teste que autentica o contexto de segurança com o operador padrão do AlumiGest.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@WithMockUser(username = "admin@alumigest.com")
public @interface WithMockOperator {
}

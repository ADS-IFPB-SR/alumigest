package br.edu.ifpb.alumigest.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando ocorre um conflito de dados (HTTP 409 Conflict),
 * como duplicação de chave única (ex: CPF/CNPJ já cadastrado).
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}

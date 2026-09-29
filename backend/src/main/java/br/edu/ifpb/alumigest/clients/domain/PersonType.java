package br.edu.ifpb.alumigest.clients.domain;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Enumeração que define o tipo de pessoa do cliente (Física ou Jurídica).
 */
@Schema(description = "Tipo de Pessoa do Cliente")
public enum PersonType {
    FISICA("Pessoa Física"),
    JURIDICA("Pessoa Jurídica");

    private final String description;

    PersonType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

package br.edu.ifpb.alumigest.catalog.domain;

/**
 * Unidade de medida comercial para itens do catálogo de materiais.
 */
public enum UnitMeasure {
    M2("Metro Quadrado"),
    METRO("Metro Linear"),
    BARRA_3M("Barra de 3.00 Metros"),
    BARRA_6M("Barra de 6.00 Metros"),
    UN("Unidade"),
    PAR("Par"),
    KG("Quilograma"),
    LITRO("Litro");

    private final String description;

    UnitMeasure(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

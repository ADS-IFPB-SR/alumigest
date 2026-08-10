package br.edu.ifpb.alumigest.catalog.domain;

/**
 * Estratégia de cálculo matemático para orçamentos e consumo de materiais.
 */
public enum CalculationType {
    SQUARE_METER("Metro Quadrado (m²) - Vidros, Espelhos, Películas, MDF"),
    LINEAR_METER("Metro Linear (m) - Perfis de Alumínio, Puxadores, Fitas"),
    UNIT("Unidade (UN) - Fechaduras, Puxadores Pontuais, Chapas Inteiras"),
    PAIR("Par (PAR) - Dobradiças, Rodízios"),
    WEIGHT_KG("Quilograma (kg) - Insumos a granel");

    private final String description;

    CalculationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

package br.edu.ifpb.alumigest.catalog.domain;

/**
 * Categorias de insumos necessárias para a montagem da esquadria e venda avulsa.
 */
public enum MaterialCategoryType {
    GLASS,
    PROFILE,
    HARDWARE,
    ROLLERS,
    FILM;

    /**
     * Retorna o código correspondente do grupo na tabela tb_material_groups.
     */
    public String getGroupCode() {
        return switch (this) {
            case GLASS -> "VIDRO";
            case PROFILE -> "ALUMINIO";
            case HARDWARE, ROLLERS -> "FERRAGEM";
            case FILM -> "PELICULA";
        };
    }

    /**
     * Mapeia o código do grupo na tabela para o enum correspondente.
     */
    public static MaterialCategoryType fromGroupCode(String groupCode) {
        if (groupCode == null) {
            return null;
        }
        return switch (groupCode.toUpperCase()) {
            case "VIDRO" -> GLASS;
            case "ALUMINIO" -> PROFILE;
            case "PELICULA" -> FILM;
            case "FERRAGEM" -> HARDWARE;
            default -> null;
        };
    }

    /**
     * Faz o parse flexível de string para o enum, aceitando aliases comuns (ex: ALUMINUM -> PROFILE).
     */
    public static MaterialCategoryType fromString(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String clean = raw.trim().toUpperCase();
        if ("ALUMINUM".equals(clean) || "ALUMINIO".equals(clean) || "PROFILE".equals(clean)) {
            return PROFILE;
        }
        if ("GLASS".equals(clean) || "VIDRO".equals(clean)) {
            return GLASS;
        }
        if ("FILM".equals(clean) || "PELICULA".equals(clean)) {
            return FILM;
        }
        if ("HARDWARE".equals(clean) || "FERRAGEM".equals(clean)) {
            return HARDWARE;
        }
        if ("ROLLERS".equals(clean) || "RODIZIO".equals(clean) || "RODIZIOS".equals(clean)) {
            return ROLLERS;
        }
        throw new IllegalArgumentException(
            "Categoria de material inválida: '" + raw + "'. Valores aceitos: GLASS, PROFILE, ALUMINUM, FILM, HARDWARE"
        );
    }
}


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

    private static final String GROUP_VIDRO = "VIDRO";
    private static final String GROUP_ALUMINIO = "ALUMINIO";
    private static final String GROUP_FERRAGEM = "FERRAGEM";
    private static final String GROUP_PELICULA = "PELICULA";

    /**
     * Retorna o código correspondente do grupo na tabela tb_material_groups.
     */
    public String getGroupCode() {
        return switch (this) {
            case GLASS -> GROUP_VIDRO;
            case PROFILE -> GROUP_ALUMINIO;
            case HARDWARE, ROLLERS -> GROUP_FERRAGEM;
            case FILM -> GROUP_PELICULA;
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
            case GROUP_VIDRO -> GLASS;
            case GROUP_ALUMINIO -> PROFILE;
            case GROUP_PELICULA -> FILM;
            case GROUP_FERRAGEM -> HARDWARE;
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
        if ("ALUMINUM".equals(clean) || GROUP_ALUMINIO.equals(clean) || "PROFILE".equals(clean)) {
            return PROFILE;
        }
        if ("GLASS".equals(clean) || GROUP_VIDRO.equals(clean)) {
            return GLASS;
        }
        if ("FILM".equals(clean) || GROUP_PELICULA.equals(clean)) {
            return FILM;
        }
        if ("HARDWARE".equals(clean) || GROUP_FERRAGEM.equals(clean)) {
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


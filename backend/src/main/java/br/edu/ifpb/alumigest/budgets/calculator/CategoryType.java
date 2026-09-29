package br.edu.ifpb.alumigest.budgets.calculator;

public enum CategoryType {
    GLASS("VIDRO"),
    PROFILE("ALUMINIO", "ALUMINUM"),
    HARDWARE("FERRAGEM", "ROLLERS"),
    FILM("PELICULA");

    private final String[] aliases;
    private static final java.util.Map<String, CategoryType> LOOKUP = new java.util.HashMap<>();

    static {
        for (CategoryType type : values()) {
            LOOKUP.put(type.name(), type);
            for (String alias : type.aliases) {
                LOOKUP.put(alias.toUpperCase(), type);
            }
        }
    }

    CategoryType(String... aliases) {
        this.aliases = aliases;
    }

    public static CategoryType parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return LOOKUP.get(raw.trim().toUpperCase());
    }
}

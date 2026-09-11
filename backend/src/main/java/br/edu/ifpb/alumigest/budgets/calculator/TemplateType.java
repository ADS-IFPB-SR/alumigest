package br.edu.ifpb.alumigest.budgets.calculator;

public enum TemplateType {

    // Linha Correr
    SLIDING_1_LEAF("SLIDING_DOOR_1F", "SLIDING_1F"),
    SLIDING_2_LEAF("SLIDING_DOOR_2F", "SLIDING_2F", "SLIDING"),
    SLIDING_3_LEAF("SLIDING_DOOR_3F", "SLIDING_3F"),
    SLIDING_4_LEAF("SLIDING_DOOR_4F", "SLIDING_4F"),

    // Linha Giro
    SWING_1_LEAF("SWING_DOOR_1F", "SWING_1F", "SWING"),
    SWING_2_LEAF("SWING_DOOR_2F", "SWING_2F"),

    // Linha Basculante/Maxim-ar
    MAX_AR_WINDOW_1_LEAF("AWNING_WINDOW_1F", "TILT"),
    MAX_AR_WINDOW_INVERSE_1_LEAF("AWNING_WINDOW_1F_INV"),

    // Linha Gaveta
    DRAWER_FRONT("FRONT_DRAWER", "DRAWER"),

    // Fixos
    FIXED_PANEL("FIXED");

    private final String[] aliases;
    private static final java.util.Map<String, TemplateType> LOOKUP = new java.util.HashMap<>();

    static {
        for (TemplateType type : values()) {
            LOOKUP.put(type.name(), type);
            for (String alias : type.aliases) {
                LOOKUP.put(alias.toUpperCase(), type);
            }
        }
    }

    TemplateType(String... aliases) {
        this.aliases = aliases;
    }

    public static TemplateType parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return LOOKUP.get(raw.trim().toUpperCase());
    }

    public static TemplateType from(String raw) {
        return parse(raw);
    }
}

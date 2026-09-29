package br.edu.ifpb.alumigest.catalog.domain;

/**
 * Modelos de templates de esquadrias homologados para o gerador SVG paramétrico da Alumiportas.
 * Inclui aliases e legados para garantir 100% de retrocompatibilidade com dados já salvos no banco.
 */
public enum DoorTemplateType {
    // 10 Modelos Homologados Oficiais
    SLIDING_DOOR_1F,
    SLIDING_DOOR_2F,
    SLIDING_DOOR_3F,
    SLIDING_DOOR_4F,
    SWING_DOOR_1F,
    SWING_DOOR_2F,
    AWNING_WINDOW_1F,
    AWNING_WINDOW_1F_INV,
    FRONT_DRAWER,
    FIXED_PANEL,

    // Aliases e nomes legados para retrocompatibilidade
    SWING,
    SLIDING,
    TILT,
    DRAWER,
    DRAWER_FRONT,
    MAXIM_AR_WINDOW,
    PIVOTING_DOOR,
    SLIDING_WINDOW_2F,
    SLIDING_WINDOW_4F,
    GLASS_BOX_FRONTAL,
    GLASS_BOX_CORNER,
    FIXED_GLASS_FACADE;

    /**
     * Retorna o nome do grupo canônico da esquadria:
     * Portas, Janelas, Box ou Móveis / Painéis.
     */
    public String getGroupName() {
        return switch (this) {
            case SWING, SWING_DOOR_1F, SWING_DOOR_2F, PIVOTING_DOOR,
                 SLIDING, SLIDING_DOOR_2F, SLIDING_DOOR_3F, SLIDING_DOOR_4F -> "Portas";
            case TILT, AWNING_WINDOW_1F, AWNING_WINDOW_1F_INV, MAXIM_AR_WINDOW, SLIDING_WINDOW_2F, SLIDING_WINDOW_4F -> "Janelas";
            case SLIDING_DOOR_1F, GLASS_BOX_FRONTAL, GLASS_BOX_CORNER -> "Box";
            case FRONT_DRAWER, DRAWER_FRONT, DRAWER, FIXED_PANEL, FIXED_GLASS_FACADE -> "Móveis / Painéis";
        };
    }
}

package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registro de estratégias técnicas de usinagem (Registry Pattern) para resolução dinâmica
 * e extensível da representação de esquadrias no PDF da Ficha Técnica (US-11.2 / #347).
 */
public final class TechnicalMachiningRegistry {

    private static final TechnicalMachiningRegistry INSTANCE = new TechnicalMachiningRegistry();

    private final Map<String, TechnicalMachiningStrategy> strategies = new ConcurrentHashMap<>();
    private final TechnicalMachiningStrategy fallbackStrategy = new FallbackMachiningStrategy();

    private TechnicalMachiningRegistry() {
        registerDefaultStrategies();
    }

    public static TechnicalMachiningRegistry getInstance() {
        return INSTANCE;
    }

    private static final String KEY_SLIDING_DOOR_2F = "SLIDING_DOOR_2F";

    private void registerDefaultStrategies() {
        TechnicalMachiningStrategy swing1F = new SwingSingleLeafMachiningStrategy();
        TechnicalMachiningStrategy swing2F = new SwingDoubleLeafMachiningStrategy();
        TechnicalMachiningStrategy sliding1F = new SlidingMachiningStrategy(1);
        TechnicalMachiningStrategy sliding2F = new SlidingMachiningStrategy(2);
        TechnicalMachiningStrategy sliding3F = new SlidingMachiningStrategy(3);
        TechnicalMachiningStrategy sliding4F = new SlidingMachiningStrategy(4);
        TechnicalMachiningStrategy awning = new AwningMachiningStrategy(false);
        TechnicalMachiningStrategy awningInv = new AwningMachiningStrategy(true);
        TechnicalMachiningStrategy drawer = new DrawerMachiningStrategy();
        TechnicalMachiningStrategy fixed = new FixedPanelMachiningStrategy();

        // 1. Linha Giro
        register("SWING_1_LEAF", swing1F);
        register("SWING_DOOR_1F", swing1F);
        register("SWING_1F", swing1F);
        register("SWING", swing1F);
        register("GIRO", swing1F);
        register("PORTA_GIRO", swing1F);

        register("SWING_2_LEAF", swing2F);
        register("SWING_DOOR_2F", swing2F);
        register("SWING_2F", swing2F);
        register("GIRO_2F", swing2F);
        register("GIRO (2 FOLHAS)", swing2F);
        register("PORTA_GIRO_DUPLA", swing2F);

        // 2. Linha Correr
        register("SLIDING_1_LEAF", sliding1F);
        register("SLIDING_DOOR_1F", sliding1F);
        register("SLIDING_1F", sliding1F);
        register("CORRER (1 FOLHA)", sliding1F);

        register("SLIDING_2_LEAF", sliding2F);
        register(KEY_SLIDING_DOOR_2F, sliding2F);
        register("SLIDING_2F", sliding2F);
        register("SLIDING", sliding2F);
        register("CORRER", sliding2F);
        register("CORRER (2 FOLHAS)", sliding2F);
        register("SLIDING_WINDOW_2F", sliding2F);

        register("SLIDING_3_LEAF", sliding3F);
        register("SLIDING_DOOR_3F", sliding3F);
        register("SLIDING_3F", sliding3F);
        register("CORRER (3 FOLHAS)", sliding3F);

        register("SLIDING_4_LEAF", sliding4F);
        register("SLIDING_DOOR_4F", sliding4F);
        register("SLIDING_4F", sliding4F);
        register("CORRER (4 FOLHAS)", sliding4F);
        register("SLIDING_WINDOW_4F", sliding4F);

        // 3. Linha Basculante / Maxim-ar
        register("MAX_AR_WINDOW_1_LEAF", awning);
        register("AWNING_WINDOW_1F", awning);
        register("AWNING_WINDOW", awning);
        register("AWNING", awning);
        register("BASCULANTE", awning);
        register("MAXIM_AR", awning);
        register("TILT", awning);

        register("MAX_AR_WINDOW_INVERSE_1_LEAF", awningInv);
        register("AWNING_WINDOW_1F_INV", awningInv);
        register("BASCULANTE INVERTIDO", awningInv);

        // 4. Linha Gaveta
        register("DRAWER_FRONT", drawer);
        register("FRONT_DRAWER", drawer);
        register("DRAWER", drawer);
        register("GAVETA", drawer);
        register("FRENTE DE GAVETA", drawer);

        // 5. Fixos
        register("FIXED_PANEL", fixed);
        register("FIXED_GLASS_FACADE", fixed);
        register("FIXED", fixed);
        register("FIXO", fixed);
    }

    /**
     * Registra uma estratégia para uma chave específica (case-insensitive).
     */
    public void register(String key, TechnicalMachiningStrategy strategy) {
        if (key != null && !key.isBlank() && strategy != null) {
            strategies.put(key.trim().toUpperCase(Locale.ROOT), strategy);
        }
    }

    /**
     * Remove o registro de uma estratégia customizada.
     */
    public void unregister(String key) {
        if (key != null) {
            strategies.remove(key.trim().toUpperCase(Locale.ROOT));
        }
    }

    /**
     * Verifica se existe estratégia cadastrada para a chave.
     */
    public boolean hasStrategy(String key) {
        if (key == null || key.isBlank()) {
            return false;
        }
        return strategies.containsKey(key.trim().toUpperCase(Locale.ROOT));
    }

    /**
     * Obtém a estratégia adequada para a tipologia com resolução em múltiplos níveis:
     * 1. Consulta por chave exata/alias
     * 2. Consulta pelo enum {@link TemplateType}
     * 3. Fallback inteligente por palavras-chave
     * 4. Fallback padrão seguro
     */
    public TechnicalMachiningStrategy getStrategy(String templateType) {
        if (templateType == null || templateType.isBlank()) {
            return fallbackStrategy;
        }

        String normalized = templateType.trim().toUpperCase(Locale.ROOT);
        TechnicalMachiningStrategy strategy = strategies.get(normalized);
        if (strategy != null) {
            return strategy;
        }

        // Tenta resolver via enum TemplateType
        TemplateType parsed = TemplateType.parse(templateType);
        if (parsed != null) {
            strategy = strategies.get(parsed.name());
            if (strategy != null) {
                return strategy;
            }
        }

        strategy = resolveKeywordFallback(normalized);
        return strategy != null ? strategy : fallbackStrategy;
    }

    private TechnicalMachiningStrategy resolveKeywordFallback(String normalized) {
        if (containsAny(normalized, "GAVETA", "DRAWER")) {
            return strategies.get("FRONT_DRAWER");
        }
        if (containsAny(normalized, "MAXIM", "BASCULANTE", "AWNING", "TILT")) {
            return strategies.get("AWNING_WINDOW_1F");
        }
        if (containsAny(normalized, "4F", "4_LEAF", "4 FOLHAS")) {
            return strategies.get("SLIDING_DOOR_4F");
        }
        if (containsAny(normalized, "3F", "3_LEAF", "3 FOLHAS")) {
            return strategies.get("SLIDING_DOOR_3F");
        }
        if (containsAny(normalized, "2F", "2_LEAF", "2 FOLHAS")) {
            return containsAny(normalized, "GIRO", "SWING")
                    ? strategies.get("SWING_DOOR_2F")
                    : strategies.get(KEY_SLIDING_DOOR_2F);
        }
        if (containsAny(normalized, "FIXO", "FIXED")) {
            return strategies.get("FIXED_PANEL");
        }
        if (containsAny(normalized, "SLIDING", "CORRER")) {
            return strategies.get(KEY_SLIDING_DOOR_2F);
        }
        return null;
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}


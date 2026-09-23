package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registro dinâmico e extensível de estratégias de desenho para miniaturas de esquadrias (Padrão Registry + Strategy).
 *
 * <p>Implementa o Princípio Aberto/Fechado (OCP - SOLID):
 * <ul>
 *   <li><b>Adicionar template:</b> basta chamar {@link #register(String, TemplateThumbnailStrategy)} sem alterar nenhuma classe.</li>
 *   <li><b>Excluir template:</b> basta desregistrar ou ignorar o template; o registro devolve com segurança a {@link FallbackThumbnailStrategy}.</li>
 *   <li><b>Editar template:</b> as propriedades visuais dinâmicas são injetadas em tempo de execução via {@link TemplateVisualContext}.</li>
 * </ul>
 * </p>
 */
public final class TemplateThumbnailRegistry {

    private static final TemplateThumbnailRegistry INSTANCE = new TemplateThumbnailRegistry();

    private final Map<String, TemplateThumbnailStrategy> strategies = new ConcurrentHashMap<>();
    private final TemplateThumbnailStrategy fallbackStrategy = new FallbackThumbnailStrategy();

    private TemplateThumbnailRegistry() {
        registrarModelosHomologados();
    }

    public static TemplateThumbnailRegistry getInstance() {
        return INSTANCE;
    }

    /**
     * Registra uma estratégia de renderização para uma chave de tipologia.
     *
     * @param templateKey código ou alias do template (ex: "SLIDING_DOOR_2F")
     * @param strategy    instância da estratégia correspondente
     */
    public void register(String templateKey, TemplateThumbnailStrategy strategy) {
        if (templateKey != null && !templateKey.isBlank() && strategy != null) {
            strategies.put(normalizarChave(templateKey), strategy);
        }
    }

    /**
     * Remove o registro de um template (simulando descontinuação/exclusão).
     *
     * @param templateKey código ou alias do template
     */
    public void unregister(String templateKey) {
        if (templateKey != null) {
            strategies.remove(normalizarChave(templateKey));
        }
    }

    /**
     * Recupera a estratégia vinculada ao template.
     * Caso o template seja nulo, desconhecido ou tenha sido excluído, retorna a estratégia de fallback segura.
     *
     * @param rawTemplateKey identificador do template
     * @return estratégia registrada ou fallback padrão
     */
    public TemplateThumbnailStrategy getStrategy(String rawTemplateKey) {
        if (rawTemplateKey == null || rawTemplateKey.isBlank()) {
            return fallbackStrategy;
        }
        return strategies.getOrDefault(normalizarChave(rawTemplateKey), fallbackStrategy);
    }

    public boolean hasStrategy(String rawTemplateKey) {
        if (rawTemplateKey == null || rawTemplateKey.isBlank()) {
            return false;
        }
        return strategies.containsKey(normalizarChave(rawTemplateKey));
    }

    public TemplateThumbnailStrategy getFallbackStrategy() {
        return fallbackStrategy;
    }

    private void registrarModelosHomologados() {
        TemplateThumbnailStrategy sliding1 = new SlidingThumbnailStrategy(1);
        TemplateThumbnailStrategy sliding2 = new SlidingThumbnailStrategy(2);
        TemplateThumbnailStrategy sliding3 = new SlidingThumbnailStrategy(3);
        TemplateThumbnailStrategy sliding4 = new SlidingThumbnailStrategy(4);

        TemplateThumbnailStrategy swing1 = new SwingDoorThumbnailStrategy(1);
        TemplateThumbnailStrategy swing2 = new SwingDoorThumbnailStrategy(2);

        TemplateThumbnailStrategy awning = new AwningWindowThumbnailStrategy(false);
        TemplateThumbnailStrategy awningInv = new AwningWindowThumbnailStrategy(true);

        TemplateThumbnailStrategy drawer = new DrawerThumbnailStrategy();
        TemplateThumbnailStrategy fixed = new PanelFixedThumbnailStrategy();

        // ── Linha Correr (1 a 4 folhas) ──────────────────────────────────────
        register("SLIDING_DOOR_1F", sliding1);
        register("SLIDING_1F", sliding1);
        register("SLIDING_1_LEAF", sliding1);

        register("SLIDING_DOOR_2F", sliding2);
        register("SLIDING_2F", sliding2);
        register("SLIDING_2_LEAF", sliding2);
        register("SLIDING", sliding2);
        register("SLIDING_WINDOW_2F", sliding2);

        register("SLIDING_DOOR_3F", sliding3);
        register("SLIDING_3F", sliding3);
        register("SLIDING_3_LEAF", sliding3);

        register("SLIDING_DOOR_4F", sliding4);
        register("SLIDING_4F", sliding4);
        register("SLIDING_4_LEAF", sliding4);
        register("SLIDING_WINDOW_4F", sliding4);

        // ── Linha Giro (1 e 2 folhas) ────────────────────────────────────────
        register("SWING_DOOR_1F", swing1);
        register("SWING_1F", swing1);
        register("SWING_1_LEAF", swing1);
        register("SWING", swing1);
        register("PIVOTING_DOOR", swing1);

        register("SWING_DOOR_2F", swing2);
        register("SWING_2F", swing2);
        register("SWING_2_LEAF", swing2);

        // ── Linha Maxim-Ar / Basculante ─────────────────────────────────────
        register("AWNING_WINDOW_1F", awning);
        register("MAX_AR_WINDOW_1_LEAF", awning);
        register("TILT", awning);
        register("MAXIM_AR_WINDOW", awning);

        register("AWNING_WINDOW_1F_INV", awningInv);
        register("MAX_AR_WINDOW_INVERSE_1_LEAF", awningInv);

        // ── Linha Gaveta ────────────────────────────────────────────────────
        register("FRONT_DRAWER", drawer);
        register("DRAWER_FRONT", drawer);
        register("DRAWER", drawer);

        // ── Linha Painel Fixo / Fachada ─────────────────────────────────────
        register("FIXED_PANEL", fixed);
        register("FIXED", fixed);
        register("FIXED_GLASS_FACADE", fixed);
        register("GLASS_BOX_FRONTAL", fixed);
        register("GLASS_BOX_CORNER", fixed);
    }

    private static String normalizarChave(String key) {
        return key.trim().toUpperCase(Locale.ROOT);
    }
}

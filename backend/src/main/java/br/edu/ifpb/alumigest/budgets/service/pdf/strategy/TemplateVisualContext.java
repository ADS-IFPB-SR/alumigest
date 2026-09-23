package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import java.awt.Color;

/**
 * Contexto visual imutável contendo a paleta de cores e propriedades
 * estéticas resolvidas dinamicamente para a renderização vetorial da esquadria.
 *
 * <p>Alinhado rigorosamente com as paletas do gerador SVG paramétrico do frontend.</p>
 */
public record TemplateVisualContext(
        Color frameFill,
        Color frameStroke,
        Color glassFill,
        Color fixedGlassFill,
        Color dividerColor,
        Color indicatorColor,
        float aspectRatio,
        boolean hasGlass
) {
    // ── Valores Padrão (Fallback Seguro) ──────────────────────────────────
    public static final Color DEFAULT_FRAME_FILL = new Color(55, 71, 101);     // #374765
    public static final Color DEFAULT_FRAME_STROKE = new Color(27, 43, 72);    // #1b2b48
    public static final Color DEFAULT_GLASS_FILL = new Color(197, 220, 245);   // #c5dcf5
    public static final Color DEFAULT_FIXED_GLASS = new Color(216, 234, 248);  // #d8eaf8
    public static final Color DEFAULT_DIVIDER = new Color(140, 145, 155);
    public static final Color DEFAULT_INDICATOR = new Color(100, 110, 125);

    public static TemplateVisualContext createDefault() {
        return new TemplateVisualContext(
                DEFAULT_FRAME_FILL,
                DEFAULT_FRAME_STROKE,
                DEFAULT_GLASS_FILL,
                DEFAULT_FIXED_GLASS,
                DEFAULT_DIVIDER,
                DEFAULT_INDICATOR,
                1.0f,
                true
        );
    }
}

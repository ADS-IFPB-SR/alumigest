package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.TemplateConfig;

import java.awt.Color;
import java.math.BigDecimal;
import java.util.Locale;

/**
 * Resolvedor dinâmico de contexto visual para miniaturas de esquadrias.
 *
 * <p>Extrai as cores do perfil de alumínio e do acabamento de vidro diretamente das
 * opções do orçamento ({@link BudgetItemOption}) e da configuração paramétrica do
 * produto ({@link TemplateConfig}), garantindo perfeita sincronia estética com o preview SVG.</p>
 */
public final class TemplateVisualContextResolver {

    private TemplateVisualContextResolver() {
        // Classe utilitária pura
    }

    /**
     * Resolve o contexto visual dinâmico a partir do {@link BudgetItem}.
     * Opera defensivamente: qualquer campo nulo ou ausente utiliza os valores padrão.
     *
     * @param item item do orçamento
     * @return contexto visual com cores reais e proporções
     */
    public static TemplateVisualContext resolve(BudgetItem item) {
        if (item == null) {
            return TemplateVisualContext.createDefault();
        }

        String rawAluminumColor = extrairCorAluminio(item);
        String rawGlassFinish = extrairAcabamentoVidro(item);

        Color frameFill = resolverCorPerfilFill(rawAluminumColor);
        Color frameStroke = resolverCorPerfilStroke(rawAluminumColor);

        Color glassFill = resolverCorVidroFill(rawGlassFinish);
        Color fixedGlassFill = resolverCorVidroFixo(rawGlassFinish);

        float aspectRatio = calcularProporcao(item.getWidthMm(), item.getHeightMm());
        boolean hasGlass = !isTemplateSemVidro(item.getTemplateType());

        return new TemplateVisualContext(
                frameFill,
                frameStroke,
                glassFill,
                fixedGlassFill,
                TemplateVisualContext.DEFAULT_DIVIDER,
                TemplateVisualContext.DEFAULT_INDICATOR,
                aspectRatio,
                hasGlass
        );
    }

    private static String extrairCorAluminio(BudgetItem item) {
        // 1. Prioridade: Opções de Materiais selecionadas no item (categoria PROFILE)
        if (item.getOptions() != null) {
            for (BudgetItemOption opt : item.getOptions()) {
                if (opt.getCategoryType() == MaterialCategoryType.PROFILE) {
                    if (opt.getSelectedColor() != null && !opt.getSelectedColor().isBlank()) {
                        return opt.getSelectedColor();
                    }
                    if (opt.getMaterialName() != null && !opt.getMaterialName().isBlank()) {
                        return opt.getMaterialName();
                    }
                }
            }
        }

        // 2. Segunda prioridade: Configuração paramétrica do produto vinculado
        if (item.getProduct() != null && item.getProduct().getTemplateConfig() != null) {
            TemplateConfig config = item.getProduct().getTemplateConfig();
            if (config.getAluminumColor() != null && !config.getAluminumColor().isBlank()) {
                return config.getAluminumColor();
            }
        }

        // 3. Terceira prioridade: JSON templateConfig do item
        String jsonConfig = item.getTemplateConfig();
        if (jsonConfig != null && jsonConfig.contains("aluminumColor")) {
            return extrairValorJson(jsonConfig, "aluminumColor");
        }

        return null;
    }

    private static String extrairAcabamentoVidro(BudgetItem item) {
        // 1. Prioridade: Opções de Materiais selecionadas no item (categoria GLASS ou FILM)
        if (item.getOptions() != null) {
            for (BudgetItemOption opt : item.getOptions()) {
                if (opt.getCategoryType() == MaterialCategoryType.GLASS || opt.getCategoryType() == MaterialCategoryType.FILM) {
                    if (opt.getSelectedColor() != null && !opt.getSelectedColor().isBlank()) {
                        return opt.getSelectedColor();
                    }
                    if (opt.getMaterialName() != null && !opt.getMaterialName().isBlank()) {
                        return opt.getMaterialName();
                    }
                }
            }
        }

        // 2. Segunda prioridade: Configuração paramétrica do produto vinculado
        if (item.getProduct() != null && item.getProduct().getTemplateConfig() != null) {
            TemplateConfig config = item.getProduct().getTemplateConfig();
            if (config.getGlassColor() != null && !config.getGlassColor().isBlank()) {
                return config.getGlassColor();
            }
        }

        // 3. Terceira prioridade: JSON templateConfig do item
        String jsonConfig = item.getTemplateConfig();
        if (jsonConfig != null) {
            if (jsonConfig.contains("glassFinish")) {
                return extrairValorJson(jsonConfig, "glassFinish");
            }
            if (jsonConfig.contains("glassColor")) {
                return extrairValorJson(jsonConfig, "glassColor");
            }
        }

        return null;
    }

    // ── Resolução de Paleta de Perfis ────────────────────────────────────

    private static Color resolverCorPerfilFill(String input) {
        if (input == null || input.isBlank()) {
            return TemplateVisualContext.DEFAULT_FRAME_FILL;
        }
        String n = input.toLowerCase(Locale.ROOT);
        if (n.contains("preto") || n.contains("black") || n.contains("#212121")) {
            return new Color(33, 33, 33);        // #212121
        }
        if (n.contains("branco") || n.contains("white") || n.contains("#ffffff")) {
            return new Color(248, 250, 252);    // #f8fafc
        }
        if (n.contains("bronze") || n.contains("champ") || n.contains("#8c6239")) {
            return new Color(120, 53, 15);      // #78350f
        }
        if (n.contains("dourad") || n.contains("gold") || n.contains("#d4af37")) {
            return new Color(180, 83, 9);       // #b45309
        }
        if (n.contains("cromad") || n.contains("inox") || n.contains("polid") || n.contains("#9e9e9e")) {
            return new Color(148, 163, 184);    // #94a3b8
        }
        if (n.contains("fosco") || n.contains("anodiz") || n.contains("#b0bec5")) {
            return new Color(71, 85, 105);      // #475569
        }
        return TemplateVisualContext.DEFAULT_FRAME_FILL;
    }

    private static Color resolverCorPerfilStroke(String input) {
        if (input == null || input.isBlank()) {
            return TemplateVisualContext.DEFAULT_FRAME_STROKE;
        }
        String n = input.toLowerCase(Locale.ROOT);
        if (n.contains("preto") || n.contains("black") || n.contains("#212121")) {
            return new Color(9, 9, 11);         // #09090b
        }
        if (n.contains("branco") || n.contains("white") || n.contains("#ffffff")) {
            return new Color(148, 163, 184);    // #94a3b8
        }
        if (n.contains("bronze") || n.contains("champ") || n.contains("#8c6239")) {
            return new Color(69, 26, 3);        // #451a03
        }
        if (n.contains("dourad") || n.contains("gold") || n.contains("#d4af37")) {
            return new Color(120, 53, 15);      // #78350f
        }
        if (n.contains("cromad") || n.contains("inox") || n.contains("polid") || n.contains("#9e9e9e")) {
            return new Color(71, 85, 105);      // #475569
        }
        if (n.contains("fosco") || n.contains("anodiz") || n.contains("#b0bec5")) {
            return new Color(30, 41, 59);       // #1e293b
        }
        return TemplateVisualContext.DEFAULT_FRAME_STROKE;
    }

    // ── Resolução de Paleta de Vidros ────────────────────────────────────

    private static Color resolverCorVidroFill(String input) {
        if (input == null || input.isBlank()) {
            return TemplateVisualContext.DEFAULT_GLASS_FILL;
        }
        String n = input.toLowerCase(Locale.ROOT);
        if (n.contains("fume") || n.contains("fumê") || n.contains("cinza") || n.contains("#595959")) {
            return new Color(100, 116, 139);    // #64748b
        }
        if (n.contains("verde") || n.contains("green") || n.contains("#e0f2f1")) {
            return new Color(167, 243, 208);    // #a7f3d0
        }
        if (n.contains("reflecta") || n.contains("bronze") || n.contains("#b87333")) {
            return new Color(254, 215, 170);    // #fed7aa
        }
        if (n.contains("canelad") || n.contains("textur") || n.contains("#e0e0e0")) {
            return new Color(241, 245, 249);    // #f1f5f9
        }
        return TemplateVisualContext.DEFAULT_GLASS_FILL;
    }

    private static Color resolverCorVidroFixo(String input) {
        if (input == null || input.isBlank()) {
            return TemplateVisualContext.DEFAULT_FIXED_GLASS;
        }
        String n = input.toLowerCase(Locale.ROOT);
        if (n.contains("fume") || n.contains("fumê") || n.contains("cinza") || n.contains("#595959")) {
            return new Color(71, 85, 105);      // #475569
        }
        if (n.contains("verde") || n.contains("green") || n.contains("#e0f2f1")) {
            return new Color(110, 231, 183);    // #6ee7b7
        }
        if (n.contains("reflecta") || n.contains("bronze") || n.contains("#b87333")) {
            return new Color(253, 186, 116);    // #fdba74
        }
        if (n.contains("canelad") || n.contains("textur") || n.contains("#e0e0e0")) {
            return new Color(226, 232, 240);    // #e2e8f0
        }
        return TemplateVisualContext.DEFAULT_FIXED_GLASS;
    }

    private static float calcularProporcao(BigDecimal widthMm, BigDecimal heightMm) {
        if (widthMm == null || heightMm == null || widthMm.signum() <= 0 || heightMm.signum() <= 0) {
            return 1.0f;
        }
        return widthMm.floatValue() / heightMm.floatValue();
    }

    private static boolean isTemplateSemVidro(String templateType) {
        if (templateType == null) return false;
        String t = templateType.toUpperCase(Locale.ROOT);
        return t.contains("DRAWER") || t.contains("GAVETA");
    }

    private static String extrairValorJson(String json, String key) {
        int idx = json.indexOf("\"" + key + "\"");
        if (idx == -1) return null;
        int colon = json.indexOf(':', idx);
        if (colon == -1) return null;
        int startQuote = json.indexOf('"', colon);
        if (startQuote == -1) return null;
        int endQuote = json.indexOf('"', startQuote + 1);
        if (endQuote == -1) return null;
        return json.substring(startQuote + 1, endQuote);
    }
}

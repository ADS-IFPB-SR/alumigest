package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Resolvedor de extração resiliente de especificações físicas e técnicas para itens
 * de pedidos de venda (Snapshot Técnico e Lock de Preços).
 *
 * <p>Responsável por consolidar cor do alumínio, acabamento de vidro, sentido de abertura
 * e ferragens a partir das opções do orçamento e configurações paramétricas JSONB.</p>
 */
public final class OrderItemSnapshotResolver {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private OrderItemSnapshotResolver() {
        // Construtor privado para classe utilitária
    }

    /**
     * Extrai a cor do perfil de alumínio a partir das opções de insumos ou da configuração JSONB.
     *
     * @param item item do orçamento de origem
     * @return cor do alumínio identificada ou null se não encontrada
     */
    public static String extractAluminumColor(BudgetItem item) {
        if (item == null) {
            return null;
        }

        String colorFromOption = extractAluminumColorFromOptions(item.getOptions());
        if (colorFromOption != null) {
            return colorFromOption;
        }

        String colorFromProduct = extractAluminumColorFromProduct(item.getProduct());
        if (colorFromProduct != null) {
            return colorFromProduct;
        }

        return extractJsonValue(item.getTemplateConfig(), "aluminumColor");
    }

    private static String extractAluminumColorFromOptions(List<BudgetItemOption> options) {
        if (options == null) {
            return null;
        }
        for (BudgetItemOption opt : options) {
            if (opt.getCategoryType() == MaterialCategoryType.PROFILE
                    && opt.getSelectedColor() != null
                    && !opt.getSelectedColor().isBlank()) {
                return opt.getSelectedColor();
            }
        }
        return null;
    }

    private static String extractAluminumColorFromProduct(Product product) {
        if (product == null || product.getTemplateConfig() == null) {
            return null;
        }
        String color = product.getTemplateConfig().getAluminumColor();
        return (color != null && !color.isBlank()) ? color : null;
    }

    /**
     * Extrai a especificação e acabamento do vidro a partir das opções ou da configuração JSONB.
     *
     * @param item item do orçamento de origem
     * @return tipo ou acabamento do vidro identificado ou null se não encontrado
     */
    public static String extractGlassType(BudgetItem item) {
        if (item == null) {
            return null;
        }

        String glassFromOption = extractGlassFromOptions(item.getOptions());
        if (glassFromOption != null) {
            return glassFromOption;
        }

        String glassFromProduct = extractGlassFromProduct(item.getProduct());
        if (glassFromProduct != null) {
            return glassFromProduct;
        }

        return extractGlassFromJson(item.getTemplateConfig());
    }

    private static String extractGlassFromOptions(List<BudgetItemOption> options) {
        if (options == null) {
            return null;
        }
        for (BudgetItemOption opt : options) {
            if (isGlassOption(opt)) {
                String desc = resolveGlassDescription(opt);
                if (desc != null) {
                    return desc;
                }
            }
        }
        return null;
    }

    private static String resolveGlassDescription(BudgetItemOption opt) {
        if (opt.getSelectedType() != null && !opt.getSelectedType().isBlank()) {
            return opt.getSelectedType();
        }
        if (opt.getMaterialName() != null && !opt.getMaterialName().isBlank()) {
            return opt.getMaterialName();
        }
        return null;
    }

    private static String extractGlassFromProduct(Product product) {
        if (product == null || product.getTemplateConfig() == null) {
            return null;
        }
        String glassColor = product.getTemplateConfig().getGlassColor();
        return (glassColor != null && !glassColor.isBlank()) ? glassColor : null;
    }

    private static String extractGlassFromJson(String jsonConfig) {
        String glassFinish = extractJsonValue(jsonConfig, "glassFinish");
        if (glassFinish != null && !glassFinish.isBlank()) {
            return glassFinish;
        }
        return extractJsonValue(jsonConfig, "glassColor");
    }

    /**
     * Extrai a orientação ou sentido de abertura da esquadria.
     *
     * @param item item do orçamento de origem
     * @return sentido de abertura identificado ou null
     */
    public static String extractOpeningDirection(BudgetItem item) {
        if (item == null) {
            return null;
        }

        String jsonConfig = item.getTemplateConfig();
        String opening = extractJsonValue(jsonConfig, "openingDirection");
        if (opening != null && !opening.isBlank()) {
            return opening;
        }

        String openingType = extractJsonValue(jsonConfig, "openingType");
        if (openingType != null && !openingType.isBlank()) {
            return openingType;
        }

        return extractJsonValue(jsonConfig, "direction");
    }

    /**
     * Extrai e consolida as ferragens e componentes acessórios associados à esquadria.
     *
     * @param item item do orçamento de origem
     * @return ferragens consolidadas em texto ou null
     */
    public static String extractHardware(BudgetItem item) {
        if (item == null) {
            return null;
        }

        Set<String> ferragensSet = new LinkedHashSet<>();
        appendHandleModel(item.getHandleConfig(), ferragensSet);
        collectHardwareFromOptions(item.getOptions(), ferragensSet);

        return ferragensSet.isEmpty() ? null : String.join(", ", ferragensSet);
    }

    private static void appendHandleModel(String handleConfig, Set<String> set) {
        String handleModel = extractJsonValue(handleConfig, "model");
        if (handleModel != null && !handleModel.isBlank()) {
            set.add("Puxador " + handleModel);
        }
    }

    private static void collectHardwareFromOptions(List<BudgetItemOption> options, Set<String> set) {
        if (options == null) {
            return;
        }
        for (BudgetItemOption opt : options) {
            if (isHardwareOrComponent(opt)) {
                set.add(formatHardwareDescription(opt));
            }
        }
    }

    private static String formatHardwareDescription(BudgetItemOption opt) {
        String desc = opt.getMaterialName();
        if (opt.getQuantity() != null && opt.getUnitMeasure() != null) {
            return desc + " (" + opt.getQuantity().stripTrailingZeros().toPlainString()
                    + " " + opt.getUnitMeasure() + ")";
        }
        return desc;
    }

    private static boolean isGlassOption(BudgetItemOption opt) {
        if (opt == null) {
            return false;
        }
        if (opt.getCategoryType() == MaterialCategoryType.GLASS) {
            return true;
        }
        String name = opt.getMaterialName();
        if (name == null) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.contains("vidro") || lower.contains("película") || lower.contains("pelicula");
    }

    private static boolean isHardwareOrComponent(BudgetItemOption opt) {
        if (opt == null) {
            return false;
        }
        MaterialCategoryType cat = opt.getCategoryType();
        if (cat == MaterialCategoryType.HARDWARE || cat == MaterialCategoryType.ROLLERS) {
            return true;
        }
        String name = opt.getMaterialName();
        if (name == null) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.contains("roldana") || lower.contains("fecho")
                || lower.contains("puxador") || lower.contains("fechadura")
                || lower.contains("guarnição") || lower.contains("guarnicao");
    }

    private static String extractJsonValue(String json, String key) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(json);
            if (root == null) {
                return null;
            }
            JsonNode node = root.get(key);
            return (node != null && !node.isNull()) ? node.asText() : null;
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

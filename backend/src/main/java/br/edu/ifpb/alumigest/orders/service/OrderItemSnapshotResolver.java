package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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

        // 1. Prioridade: Opções de insumo com categoria PROFILE
        if (item.getOptions() != null) {
            for (BudgetItemOption opt : item.getOptions()) {
                if (opt.getCategoryType() == MaterialCategoryType.PROFILE) {
                    if (opt.getSelectedColor() != null && !opt.getSelectedColor().isBlank()) {
                        return opt.getSelectedColor();
                    }
                }
            }
        }

        // 2. Prioridade: Configuração paramétrica de template do produto
        if (item.getProduct() != null && item.getProduct().getTemplateConfig() != null) {
            String color = item.getProduct().getTemplateConfig().getAluminumColor();
            if (color != null && !color.isBlank()) {
                return color;
            }
        }

        // 3. Prioridade: Campo aluminumColor dentro do JSON templateConfig
        return extractJsonValue(item.getTemplateConfig(), "aluminumColor");
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

        // 1. Prioridade: Opções de insumo com categoria GLASS ou menção a vidro/película
        if (item.getOptions() != null) {
            for (BudgetItemOption opt : item.getOptions()) {
                if (isGlassOption(opt)) {
                    if (opt.getSelectedType() != null && !opt.getSelectedType().isBlank()) {
                        return opt.getSelectedType();
                    }
                    if (opt.getMaterialName() != null && !opt.getMaterialName().isBlank()) {
                        return opt.getMaterialName();
                    }
                }
            }
        }

        // 2. Prioridade: Configuração paramétrica do produto
        if (item.getProduct() != null && item.getProduct().getTemplateConfig() != null) {
            String glassColor = item.getProduct().getTemplateConfig().getGlassColor();
            if (glassColor != null && !glassColor.isBlank()) {
                return glassColor;
            }
        }

        // 3. Prioridade: Campos do JSON templateConfig
        String jsonConfig = item.getTemplateConfig();
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

        List<String> ferragensList = new ArrayList<>();

        // 1. Extração do handleConfig (puxadores)
        String handleModel = extractJsonValue(item.getHandleConfig(), "model");
        if (handleModel != null && !handleModel.isBlank()) {
            ferragensList.add("Puxador " + handleModel);
        }

        // 2. Insumos com categoria HARDWARE / ROLLERS
        if (item.getOptions() != null) {
            for (BudgetItemOption opt : item.getOptions()) {
                if (isHardwareOrComponent(opt)) {
                    String desc = opt.getMaterialName();
                    if (opt.getQuantity() != null && opt.getUnitMeasure() != null) {
                        desc += " (" + opt.getQuantity().stripTrailingZeros().toPlainString()
                                + " " + opt.getUnitMeasure() + ")";
                    }
                    if (!ferragensList.contains(desc)) {
                        ferragensList.add(desc);
                    }
                }
            }
        }

        return ferragensList.isEmpty() ? null : String.join(", ", ferragensList);
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

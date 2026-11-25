package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.service.production.FrameCalculatorStrategy;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Motor de cálculo fabril padrão / fallback para esquadrias, espelhos, painéis fixos e vidros.
 * Garante que qualquer O.S. fature e processe lista de corte, vidros e componentes na Ficha Técnica.
 */
public class DefaultFrameCalculator implements FrameCalculatorStrategy {

    private static final String KEYWORD_MIRROR = "ESPELHO";
    private static final String KEYWORD_BOX = "BOX";
    private static final String KEYWORD_SWING = "GIRO";
    private static final String KEYWORD_PIVOT = "PIVOT";
    private static final String KEYWORD_MAXIM = "MAXIM";
    private static final String KEYWORD_BASCUL = "BASCUL";

    private static final String DEFAULT_COLOR = "Padrão";
    private static final String ANGLE_45 = "45°";
    private static final String ANGLE_90 = "90°";
    private static final String UNIT_UN = "UN";
    private static final String UNIT_MT = "MT";

    private enum FallbackFrameKind {
        MIRROR,
        BOX,
        SWING,
        AWNING,
        GENERIC
    }

    @Override
    public boolean supports(OrderItem item) {
        return true; // Fallback universal para qualquer item físico de O.S.
    }

    @Override
    public void calculateCuts(OrderItem item, ProductionSheetBuilder builder) {
        if (item == null || builder == null) {
            return;
        }

        int widthMm = defaultInt(item.getLarguraMm(), 0);
        int heightMm = defaultInt(item.getAlturaMm(), 0);
        int qty = resolveQuantity(item.getQuantidade());
        FallbackFrameKind kind = classifyFrame(resolveItemName(item));
        String color = firstNonBlank(item.getCorAluminio(), DEFAULT_COLOR);
        String glassType = firstNonBlank(item.getTipoVidro(), item.getDescricao());

        addGlassCuts(kind, glassType, widthMm, heightMm, qty, builder);
        addAluminumCuts(kind, color, widthMm, heightMm, qty, builder);
        addAccessories(kind, widthMm, heightMm, qty, builder);
    }

    private FallbackFrameKind classifyFrame(String normalizedName) {
        if (normalizedName.contains(KEYWORD_MIRROR)) {
            return FallbackFrameKind.MIRROR;
        }
        if (normalizedName.contains(KEYWORD_BOX)) {
            return FallbackFrameKind.BOX;
        }
        if (normalizedName.contains(KEYWORD_SWING) || normalizedName.contains(KEYWORD_PIVOT)) {
            return FallbackFrameKind.SWING;
        }
        if (normalizedName.contains(KEYWORD_MAXIM) || normalizedName.contains(KEYWORD_BASCUL)) {
            return FallbackFrameKind.AWNING;
        }
        return FallbackFrameKind.GENERIC;
    }

    private void addGlassCuts(
            FallbackFrameKind kind,
            String glassType,
            int widthMm,
            int heightMm,
            int qty,
            ProductionSheetBuilder builder) {
        if (isBlank(glassType)) {
            return;
        }

        switch (kind) {
            case BOX -> {
                int leafWidthMm = Math.max(0, (widthMm / 2) + 25);
                builder.addGlassCut(glassType + " (Folha Fixa)", leafWidthMm, heightMm, qty);
                builder.addGlassCut(glassType + " (Folha Móvel)", leafWidthMm, heightMm, qty);
            }
            case SWING -> builder.addGlassCut(
                    glassType, Math.max(0, widthMm - 80), Math.max(0, heightMm - 80), qty);
            case AWNING -> builder.addGlassCut(
                    glassType, Math.max(0, widthMm - 50), Math.max(0, heightMm - 50), qty);
            default -> builder.addGlassCut(glassType, widthMm, heightMm, qty);
        }
    }

    private void addAluminumCuts(
            FallbackFrameKind kind,
            String color,
            int widthMm,
            int heightMm,
            int qty,
            ProductionSheetBuilder builder) {
        int pairQty = 2 * qty;
        switch (kind) {
            case MIRROR -> {
                builder.addAluminumCut(
                        "MOLD-01",
                        profileDesc("Moldura / Perfil Superior e Inferior", color),
                        widthMm, ANGLE_45, pairQty);
                builder.addAluminumCut(
                        "MOLD-02",
                        profileDesc("Moldura / Perfil Lateral", color),
                        heightMm, ANGLE_45, pairQty);
            }
            case BOX -> {
                builder.addAluminumCut(
                        "BX-001", profileDesc("Trilho Superior Box", color), widthMm, ANGLE_90, qty);
                builder.addAluminumCut(
                        "BX-002", profileDesc("Guia Inferior Box", color), widthMm, ANGLE_90, qty);
                builder.addAluminumCut(
                        "BX-003", profileDesc("Perfil U Lateral", color), heightMm, ANGLE_90, pairQty);
            }
            case SWING -> {
                builder.addAluminumCut(
                        "BAT-01",
                        profileDesc("Batente / Marco Superior", color),
                        widthMm, ANGLE_90, qty);
                builder.addAluminumCut(
                        "BAT-02",
                        profileDesc("Batente / Marco Lateral", color),
                        heightMm, ANGLE_90, pairQty);
                builder.addAluminumCut(
                        "FOL-01",
                        profileDesc("Perfil Folha Superior/Inferior", color),
                        Math.max(0, widthMm - 60), ANGLE_45, pairQty);
                builder.addAluminumCut(
                        "FOL-02",
                        profileDesc("Perfil Folha Montante", color),
                        Math.max(0, heightMm - 40), ANGLE_45, pairQty);
            }
            case AWNING -> {
                builder.addAluminumCut(
                        "MX-001",
                        profileDesc("Marco Superior/Inferior", color),
                        widthMm, ANGLE_90, pairQty);
                builder.addAluminumCut(
                        "MX-002", profileDesc("Marco Lateral", color), heightMm, ANGLE_90, pairQty);
                builder.addAluminumCut(
                        "MX-003",
                        profileDesc("Quadro Móvel Superior/Inferior", color),
                        Math.max(0, widthMm - 30), ANGLE_45, pairQty);
                builder.addAluminumCut(
                        "MX-004",
                        profileDesc("Quadro Móvel Lateral", color),
                        Math.max(0, heightMm - 30), ANGLE_45, pairQty);
            }
            default -> {
                builder.addAluminumCut(
                        "EST-001",
                        profileDesc("Perfil Estrutural Superior/Inferior", color),
                        widthMm, ANGLE_90, pairQty);
                builder.addAluminumCut(
                        "EST-002",
                        profileDesc("Perfil Estrutural Lateral", color),
                        heightMm, ANGLE_90, pairQty);
            }
        }
    }

    private void addAccessories(
            FallbackFrameKind kind,
            int widthMm,
            int heightMm,
            int qty,
            ProductionSheetBuilder builder) {
        switch (kind) {
            case MIRROR -> {
                builder.addAccessory(
                        "FIX-ESP", "Botão Francês / Fixador de Espelho", 4 * qty, UNIT_UN);
                builder.addAccessory(
                        "SIL-001", "Silicone Neutro Especial para Espelhos", Math.max(1, qty), "TB");
            }
            case BOX -> {
                builder.addAccessory("KIT-BOX", "Kit Ferragens Box de Correr", qty, "CJ");
                builder.addAccessory("ROLD-BX", "Roldanas Excêntricas Box", 2 * qty, UNIT_UN);
                builder.addAccessory(
                        "VED-001",
                        "Batedores e Borracha de Vedação",
                        Math.max(1, (heightMm * 2 * qty) / 1000),
                        UNIT_MT);
            }
            case SWING -> {
                builder.addAccessory("DOBR-01", "Dobradiça / Pivô com Rolamento", 3 * qty, UNIT_UN);
                builder.addAccessory("FECH-01", "Fechadura / Puxador Tubular", qty, UNIT_UN);
            }
            case AWNING -> {
                builder.addAccessory(
                        "BRAC-01", "Braço Articulado Inox Maxim-Ar", 2 * qty, UNIT_UN);
                builder.addAccessory("FECH-02", "Fecho Alavanca Maxim-Ar", qty, UNIT_UN);
            }
            default -> {
                builder.addAccessory("KIT-FIX", "Kit de Fixação, Parafusos e Buchas", qty, "KIT");
                builder.addAccessory(
                        "CAL-001",
                        "Calços de Assentamento e Borracha",
                        Math.max(1, ((widthMm + heightMm) * 2 * qty) / 1000),
                        UNIT_MT);
            }
        }
    }

    private String resolveItemName(OrderItem item) {
        String productName = item.getProduct() != null ? item.getProduct().getName() : null;
        return Stream.of(productName, item.getDescricao(), item.getTipoVidro())
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "))
                .toUpperCase(Locale.ROOT);
    }

    private static int defaultInt(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private static int resolveQuantity(Integer quantity) {
        return (quantity != null && quantity > 0) ? quantity : 1;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String firstNonBlank(String primary, String fallback) {
        return !isBlank(primary) ? primary : fallback;
    }

    private static String profileDesc(String label, String color) {
        return label + " (" + color + ")";
    }
}


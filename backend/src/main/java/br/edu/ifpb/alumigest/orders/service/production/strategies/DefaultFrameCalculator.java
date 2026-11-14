package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.service.production.FrameCalculatorStrategy;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;

/**
 * Motor de cálculo fabril padrão / fallback para esquadrias, espelhos, painéis fixos e vidros.
 * Garante que qualquer O.S. fature e processe lista de corte, vidros e componentes na Ficha Técnica.
 */
public class DefaultFrameCalculator implements FrameCalculatorStrategy {

    private static final String ESPELHO = "ESPELHO";
    private static final String BOX = "BOX";
    private static final String GIRO = "GIRO";
    private static final String PIVOT = "PIVOT";
    private static final String MAXIM = "MAXIM";
    private static final String BASCUL = "BASCUL";

    @Override
    public boolean supports(OrderItem item) {
        return true; // Fallback universal para qualquer item físico de O.S.
    }

    @Override
    public void calculateCuts(OrderItem item, ProductionSheetBuilder builder) {
        if (item == null || builder == null) {
            return;
        }

        int w = item.getLarguraMm() != null ? item.getLarguraMm() : 0;
        int h = item.getAlturaMm() != null ? item.getAlturaMm() : 0;
        int qty = item.getQuantidade() != null && item.getQuantidade() > 0 ? item.getQuantidade() : 1;
        String desc = resolveItemName(item);
        String cor = item.getCorAluminio() != null && !item.getCorAluminio().isBlank()
                ? item.getCorAluminio() : "Padrão";

        String tipoVidro = item.getTipoVidro() != null && !item.getTipoVidro().isBlank()
                ? item.getTipoVidro() : item.getDescricao();

        if (tipoVidro != null && !tipoVidro.isBlank()) {
            calculateGlassCuts(desc, tipoVidro, w, h, qty, builder);
        }

        calculateAluminumCuts(desc, cor, w, h, qty, builder);
        calculateAccessories(desc, w, h, qty, builder);
    }

    private void calculateGlassCuts(String desc, String tipoVidro, int w, int h, int qty, ProductionSheetBuilder builder) {
        if (desc.contains(ESPELHO)) {
            builder.addGlassCut(tipoVidro, w, h, qty);
        } else if (desc.contains(BOX)) {
            int wFolha = Math.max(0, (w / 2) + 25);
            builder.addGlassCut(tipoVidro + " (Folha Fixa)", wFolha, h, qty);
            builder.addGlassCut(tipoVidro + " (Folha Móvel)", wFolha, h, qty);
        } else if (isGiroOrPivot(desc)) {
            builder.addGlassCut(tipoVidro, Math.max(0, w - 80), Math.max(0, h - 80), qty);
        } else if (isMaximOrBascul(desc)) {
            builder.addGlassCut(tipoVidro, Math.max(0, w - 50), Math.max(0, h - 50), qty);
        } else {
            builder.addGlassCut(tipoVidro, w, h, qty);
        }
    }

    private void calculateAluminumCuts(String desc, String cor, int w, int h, int qty, ProductionSheetBuilder builder) {
        if (desc.contains(ESPELHO)) {
            builder.addAluminumCut("MOLD-01", "Moldura / Perfil Superior e Inferior (" + cor + ")", w, "45°", 2 * qty);
            builder.addAluminumCut("MOLD-02", "Moldura / Perfil Lateral (" + cor + ")", h, "45°", 2 * qty);
        } else if (desc.contains(BOX)) {
            builder.addAluminumCut("BX-001", "Trilho Superior Box (" + cor + ")", w, "90°", qty);
            builder.addAluminumCut("BX-002", "Guia Inferior Box (" + cor + ")", w, "90°", qty);
            builder.addAluminumCut("BX-003", "Perfil U Lateral (" + cor + ")", h, "90°", 2 * qty);
        } else if (isGiroOrPivot(desc)) {
            builder.addAluminumCut("BAT-01", "Batente / Marco Superior (" + cor + ")", w, "90°", qty);
            builder.addAluminumCut("BAT-02", "Batente / Marco Lateral (" + cor + ")", h, "90°", 2 * qty);
            builder.addAluminumCut("FOL-01", "Perfil Folha Superior/Inferior (" + cor + ")", Math.max(0, w - 60), "45°", 2 * qty);
            builder.addAluminumCut("FOL-02", "Perfil Folha Montante (" + cor + ")", Math.max(0, h - 40), "45°", 2 * qty);
        } else if (isMaximOrBascul(desc)) {
            builder.addAluminumCut("MX-001", "Marco Superior/Inferior (" + cor + ")", w, "90°", 2 * qty);
            builder.addAluminumCut("MX-002", "Marco Lateral (" + cor + ")", h, "90°", 2 * qty);
            builder.addAluminumCut("MX-003", "Quadro Móvel Superior/Inferior (" + cor + ")", Math.max(0, w - 30), "45°", 2 * qty);
            builder.addAluminumCut("MX-004", "Quadro Móvel Lateral (" + cor + ")", Math.max(0, h - 30), "45°", 2 * qty);
        } else {
            builder.addAluminumCut("EST-001", "Perfil Estrutural Superior/Inferior (" + cor + ")", w, "90°", 2 * qty);
            builder.addAluminumCut("EST-002", "Perfil Estrutural Lateral (" + cor + ")", h, "90°", 2 * qty);
        }
    }

    private void calculateAccessories(String desc, int w, int h, int qty, ProductionSheetBuilder builder) {
        if (desc.contains(ESPELHO)) {
            builder.addAccessory("FIX-ESP", "Botão Francês / Fixador de Espelho", 4 * qty, "UN");
            builder.addAccessory("SIL-001", "Silicone Neutro Especial para Espelhos", Math.max(1, qty), "TB");
        } else if (desc.contains(BOX)) {
            builder.addAccessory("KIT-BOX", "Kit Ferragens Box de Correr", qty, "CJ");
            builder.addAccessory("ROLD-BX", "Roldanas Excêntricas Box", 2 * qty, "UN");
            builder.addAccessory("VED-001", "Batedores e Borracha de Vedação", Math.max(1, (h * 2 * qty) / 1000), "MT");
        } else if (isGiroOrPivot(desc)) {
            builder.addAccessory("DOBR-01", "Dobradiça / Pivô com Rolamento", 3 * qty, "UN");
            builder.addAccessory("FECH-01", "Fechadura / Puxador Tubular", qty, "UN");
        } else if (isMaximOrBascul(desc)) {
            builder.addAccessory("BRAC-01", "Braço Articulado Inox Maxim-Ar", 2 * qty, "UN");
            builder.addAccessory("FECH-02", "Fecho Alavanca Maxim-Ar", qty, "UN");
        } else {
            builder.addAccessory("KIT-FIX", "Kit de Fixação, Parafusos e Buchas", qty, "KIT");
            builder.addAccessory("CAL-001", "Calços de Assentamento e Borracha", Math.max(1, ((w + h) * 2 * qty) / 1000), "MT");
        }
    }

    private boolean isGiroOrPivot(String desc) {
        return desc.contains(GIRO) || desc.contains(PIVOT);
    }

    private boolean isMaximOrBascul(String desc) {
        return desc.contains(MAXIM) || desc.contains(BASCUL);
    }

    private String resolveItemName(OrderItem item) {
        StringBuilder sb = new StringBuilder();
        if (item.getProduct() != null && item.getProduct().getName() != null) {
            sb.append(item.getProduct().getName()).append(" ");
        }
        if (item.getDescricao() != null) {
            sb.append(item.getDescricao()).append(" ");
        }
        if (item.getTipoVidro() != null) {
            sb.append(item.getTipoVidro()).append(" ");
        }
        return sb.toString().toUpperCase();
    }
}

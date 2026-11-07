package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.service.production.FrameCalculatorStrategy;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;
import org.springframework.stereotype.Component;

@Component
public class SupremaSlidingWindowCalculator implements FrameCalculatorStrategy {

    private static final int FOLGA_ALTURA_FOLHAS_MM = 42;
    private static final int FOLGA_LARGURA_BORRACHA_VIDRO = 12;

    @Override
    public boolean supports(OrderItem item) {
        if (item == null) {
            return false;
        }
        String name = resolveItemName(item);
        return name.contains("JANELA") && name.contains("CORRER") && name.contains("SUPREMA");
    }

    private String resolveItemName(OrderItem item) {
        if (item.getProduct() != null && item.getProduct().getName() != null) {
            return item.getProduct().getName().toUpperCase();
        }
        if (item.getDescricao() != null) {
            return item.getDescricao().toUpperCase();
        }
        return "";
    }

    @Override
    public void calculateCuts(OrderItem item, ProductionSheetBuilder builder) {
        if (item == null || builder == null) {
            return;
        }

        int l = item.getLarguraMm() != null ? item.getLarguraMm() : 0;
        int a = item.getAlturaMm() != null ? item.getAlturaMm() : 0;
        int qty = item.getQuantidade() != null && item.getQuantidade() > 0 ? item.getQuantidade() : 1;

        // 1. O Marco
        builder.addAluminumCut("SU-001", "Marco Lateral", a, "90°", 2 * qty);
        builder.addAluminumCut("SU-002", "Marco Superior/Inferior", l, "90°", 2 * qty);

        // 2. As Folhas Móveis (Descontando as folgas)
        int alturaFolha = Math.max(0, a - FOLGA_ALTURA_FOLHAS_MM);
        int larguraFolha = Math.max(0, (l / 2) + 15); // transpasse

        builder.addAluminumCut("SU-039", "Perfil Montante", alturaFolha, "90°", 4 * qty);
        builder.addAluminumCut("SU-040", "Perfil Travessa", larguraFolha, "45°", 4 * qty);

        // 3. Vidros
        int alturaVidro = Math.max(0, alturaFolha - FOLGA_LARGURA_BORRACHA_VIDRO);
        int larguraVidro = Math.max(0, larguraFolha - FOLGA_LARGURA_BORRACHA_VIDRO);

        String tipoVidro = item.getTipoVidro() != null ? item.getTipoVidro() : "Incolor 8mm";
        builder.addGlassCut(tipoVidro, larguraVidro, alturaVidro, 2 * qty);

        // 4. Acessórios
        builder.addAccessory("ROL-112", "Roldana Dupla Suprema", 4 * qty, "UN");
        int borrachaMetros = Math.max(1, ((l + a) * 2 * qty) / 1000);
        builder.addAccessory("GUA-080", "Borracha de Cunha (Vidro)", borrachaMetros, "MT");
    }
}
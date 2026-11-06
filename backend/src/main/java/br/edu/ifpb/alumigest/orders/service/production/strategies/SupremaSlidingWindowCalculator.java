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
        if (item.getProduct() == null || item.getProduct().getName() == null) return false;
        String name = item.getProduct().getName().toUpperCase();
        return name.contains("JANELA") && name.contains("CORRER") && name.contains("SUPREMA");
    }

    @Override
    public void calculateCuts(OrderItem item, ProductionSheetBuilder builder) {
        int l = item.getLarguraMm();
        int a = item.getAlturaMm();
        int qty = item.getQuantidade();

        // 1. O Marco
        builder.addAluminumCut("SU-001", "Marco Lateral", a, "90°", 2 * qty);
        builder.addAluminumCut("SU-002", "Marco Superior/Inferior", l, "90°", 2 * qty);

        // 2. As Folhas Móveis (Descontando as folgas)
        int alturaFolha = a - FOLGA_ALTURA_FOLHAS_MM;
        int larguraFolha = (l / 2) + 15; // transpasse

        builder.addAluminumCut("SU-039", "Perfil Montante", alturaFolha, "90°", 4 * qty);
        builder.addAluminumCut("SU-040", "Perfil Travessa", larguraFolha, "45°", 4 * qty);

        // 3. Vidros
        int alturaVidro = alturaFolha - FOLGA_LARGURA_BORRACHA_VIDRO;
        int larguraVidro = larguraFolha - FOLGA_LARGURA_BORRACHA_VIDRO;

        String tipoVidro = item.getTipoVidro() != null ? item.getTipoVidro() : "Incolor 8mm";
        builder.addGlassCut(tipoVidro, larguraVidro, alturaVidro, 2 * qty);

        // 4. Acessórios
        builder.addAccessory("ROL-112", "Roldana Dupla Suprema", 4 * qty, "UN");
        builder.addAccessory("GUA-080", "Borracha de Cunha (Vidro)", ((l + a) * 2 * qty) / 1000, "MT");
    }
}
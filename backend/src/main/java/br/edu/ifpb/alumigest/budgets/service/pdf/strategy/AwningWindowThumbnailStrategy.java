package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de renderização vetorial para janelas Maxim-Ar / Basculantes (Awning),
 * suportando projeção padrão (abertura inferior) e invertida (abertura superior).
 */
public class AwningWindowThumbnailStrategy implements TemplateThumbnailStrategy {

    private final boolean inverted;

    public AwningWindowThumbnailStrategy(boolean inverted) {
        this.inverted = inverted;
    }

    @Override
    public void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height) {
        float margin = 4.5f;
        float areaX = margin;
        float areaY = margin;
        float areaW = width - (2 * margin);
        float areaH = height - (2 * margin);

        if (areaW <= 0 || areaH <= 0) return;

        // Vidro
        tpl.setColorFill(ctx.glassFill());
        tpl.rectangle(areaX + 0.8f, areaY + 0.8f, areaW - 1.6f, areaH - 1.6f);
        tpl.fill();

        // Moldura interna da folha
        tpl.setColorStroke(ctx.dividerColor());
        tpl.setLineWidth(0.75f);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Arco de basculamento
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.5f);
        tpl.setLineDash(2f, 2f, 0f);

        float centroX = areaX + (areaW / 2);
        float raio = Math.min(areaW * 0.35f, areaH * 0.35f);

        if (!inverted) {
            // Maxim-ar convencional: articulação superior, abre embaixo
            tpl.arc(centroX - raio, areaY, centroX + raio, areaY + 2 * raio, 0f, 180f);
        } else {
            // Maxim-ar invertido: articulação inferior, abre em cima
            tpl.arc(centroX - raio, areaY + areaH - 2 * raio, centroX + raio, areaY + areaH, 180f, 180f);
        }
        tpl.stroke();
        tpl.setLineDash(0f);

        // Fecho / Puxador
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(1.4f);
        float fechoY = !inverted ? areaY + 2.5f : areaY + areaH - 2.5f;
        tpl.moveTo(centroX - 3f, fechoY);
        tpl.lineTo(centroX + 3f, fechoY);
        tpl.stroke();
    }
}

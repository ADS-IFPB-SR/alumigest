package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de renderização vetorial para esquadrias da linha de correr (Sliding),
 * suportando de 1 a 4 folhas com setas indicativas de deslizamento e vidro dinâmico.
 */
public class SlidingThumbnailStrategy implements TemplateThumbnailStrategy {

    private final int leafCount;

    public SlidingThumbnailStrategy(int leafCount) {
        this.leafCount = Math.max(1, Math.min(leafCount, 4));
    }

    @Override
    public void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height) {
        float margin = 4.5f;
        float areaX = margin;
        float areaY = margin;
        float areaW = width - (2 * margin);
        float areaH = height - (2 * margin);

        if (areaW <= 0 || areaH <= 0) return;

        float leafW = areaW / leafCount;

        for (int i = 0; i < leafCount; i++) {
            float fx = areaX + (i * leafW);

            // Preenchimento de vidro dinâmico (alternando folha móvel e folha fixa)
            tpl.setColorFill(i % 2 == 0 ? ctx.glassFill() : ctx.fixedGlassFill());
            tpl.rectangle(fx + 0.8f, areaY + 0.8f, leafW - 1.6f, areaH - 1.6f);
            tpl.fill();

            // Caixilho da folha
            tpl.setColorStroke(ctx.dividerColor());
            tpl.setLineWidth(0.75f);
            tpl.rectangle(fx, areaY, leafW, areaH);
            tpl.stroke();

            // Seta indicativa de deslizamento
            desenharSetaDeslizamento(tpl, fx, areaY, leafW, areaH, i % 2 == 0, ctx);
        }
    }

    private void desenharSetaDeslizamento(PdfTemplate tpl, float fx, float fy, float fw, float fh,
                                         boolean paraDireita, TemplateVisualContext ctx) {
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.6f);

        float centerY = fy + (fh / 2);
        float arrowMargin = fw * 0.18f;
        float startX = fx + arrowMargin;
        float endX = fx + fw - arrowMargin;
        float arrowHead = Math.min(fw * 0.15f, 4f);

        tpl.moveTo(startX, centerY);
        tpl.lineTo(endX, centerY);
        tpl.stroke();

        float tipX = paraDireita ? endX : startX;
        float dir = paraDireita ? -1 : 1;

        tpl.moveTo(tipX, centerY);
        tpl.lineTo(tipX + dir * arrowHead, centerY + arrowHead);
        tpl.stroke();

        tpl.moveTo(tipX, centerY);
        tpl.lineTo(tipX + dir * arrowHead, centerY - arrowHead);
        tpl.stroke();
    }
}

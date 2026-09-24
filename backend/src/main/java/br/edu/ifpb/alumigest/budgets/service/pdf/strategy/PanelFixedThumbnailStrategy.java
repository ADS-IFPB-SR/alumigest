package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de renderização vetorial para painéis fixos e fachadas de vidro estrutural (Fixed Panel).
 * Exibe traçado técnico em diagonal cruzada indicando ausência de partes móveis.
 */
public class PanelFixedThumbnailStrategy implements TemplateThumbnailStrategy {

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

        // Moldura
        tpl.setColorStroke(ctx.dividerColor());
        tpl.setLineWidth(0.75f);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Linhas técnicas cruzadas ("X") indicando elemento fixo com stroke único
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.4f);
        tpl.setLineDash(3f, 3f, 0f);

        tpl.moveTo(areaX, areaY);
        tpl.lineTo(areaX + areaW, areaY + areaH);
        tpl.moveTo(areaX + areaW, areaY);
        tpl.lineTo(areaX, areaY + areaH);
        tpl.stroke();

        tpl.setLineDash(0f);
    }
}

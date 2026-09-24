package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de fallback resiliente acionada quando uma esquadria possui tipologia nula,
 * desconhecida, descontinuada ou excluída do catálogo.
 *
 * <p>Garante a regra de ouro do sistema: "o programa rode livremente e seja possível
 * excluir um template sem quebrar o código".</p>
 */
public class FallbackThumbnailStrategy implements TemplateThumbnailStrategy {

    @Override
    public void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height) {
        float margin = 4.5f;
        float areaX = margin;
        float areaY = margin;
        float areaW = width - (2 * margin);
        float areaH = height - (2 * margin);

        if (areaW <= 0 || areaH <= 0) {
            return;
        }

        // Fundo neutro
        tpl.setColorFill(ctx.glassFill());
        tpl.rectangle(areaX + 0.8f, areaY + 0.8f, areaW - 1.6f, areaH - 1.6f);
        tpl.fill();

        // Contorno
        tpl.setColorStroke(ctx.dividerColor());
        tpl.setLineWidth(0.6f);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Marca d'água técnica suave em tracejado (indicador de peça sob medida sem template específico)
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.4f);
        tpl.setLineDash(2f, 2f, 0f);

        float cx = areaX + areaW / 2;
        float cy = areaY + areaH / 2;
        float s = Math.min(areaW, areaH) * 0.25f;

        tpl.rectangle(cx - s, cy - s, 2 * s, 2 * s);
        tpl.stroke();
        tpl.setLineDash(0f);
    }
}

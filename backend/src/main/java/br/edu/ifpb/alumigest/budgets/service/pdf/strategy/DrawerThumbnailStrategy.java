package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de renderização vetorial para frentes de gaveta e painéis de marcenaria/alumínio (Drawer).
 * Renderiza painel opaco com puxador horizontal proporcional integrado.
 */
public class DrawerThumbnailStrategy implements TemplateThumbnailStrategy {

    @Override
    public void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height) {
        float margin = 4.5f;
        float areaX = margin;
        float areaY = margin;
        float areaW = width - (2 * margin);
        float areaH = height - (2 * margin);

        if (areaW <= 0 || areaH <= 0) return;

        // Superfície do painel (opaco com cor do acabamento de perfil)
        tpl.setColorFill(ctx.frameFill());
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.fill();

        // Borda perimetral
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(0.8f);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Puxador perfil horizontal central
        float puxadorW = areaW * 0.6f;
        float puxadorH = Math.min(areaH * 0.14f, 4.5f);
        float px = areaX + (areaW - puxadorW) / 2;
        float py = areaY + (areaH - puxadorH) / 2;

        tpl.setColorFill(ctx.dividerColor());
        tpl.rectangle(px, py, puxadorW, puxadorH);
        tpl.fill();

        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(0.5f);
        tpl.rectangle(px, py, puxadorW, puxadorH);
        tpl.stroke();
    }
}

package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de renderização vetorial para portas e portões de giro (Swing),
 * suportando 1 ou 2 folhas com arcos de projeção de abertura e puxadores.
 */
public class SwingDoorThumbnailStrategy implements TemplateThumbnailStrategy {

    private final int leafCount;

    public SwingDoorThumbnailStrategy(int leafCount) {
        this.leafCount = Math.max(1, Math.min(leafCount, 2));
    }

    @Override
    public void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height) {
        float margin = 4.5f;
        float areaX = margin;
        float areaY = margin;
        float areaW = width - (2 * margin);
        float areaH = height - (2 * margin);

        if (areaW <= 0 || areaH <= 0) return;

        if (leafCount == 1) {
            desenharGiroUmaFolha(tpl, areaX, areaY, areaW, areaH, ctx);
        } else {
            desenharGiroDuasFolhas(tpl, areaX, areaY, areaW, areaH, ctx);
        }
    }

    private void desenharGiroUmaFolha(PdfTemplate tpl, float x, float y, float w, float h, TemplateVisualContext ctx) {
        // Preenchimento de vidro
        tpl.setColorFill(ctx.glassFill());
        tpl.rectangle(x + 0.8f, y + 0.8f, w - 1.6f, h - 1.6f);
        tpl.fill();

        // Moldura da folha
        tpl.setColorStroke(ctx.dividerColor());
        tpl.setLineWidth(0.75f);
        tpl.rectangle(x, y, w, h);
        tpl.stroke();

        // Arco de abertura (linha tracejada)
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.5f);
        tpl.setLineDash(2f, 2f, 0f);

        float raio = Math.min(w * 0.7f, h * 0.4f);
        tpl.arc(x, y, x + 2 * raio, y + 2 * raio, 0f, 90f);
        tpl.stroke();
        tpl.setLineDash(0f); // Restaura linha contínua

        // Puxador vertical
        desenharPuxador(tpl, x + w - 4f, y + (h / 2) - 8f, 16f, ctx);
    }

    private void desenharGiroDuasFolhas(PdfTemplate tpl, float x, float y, float w, float h, TemplateVisualContext ctx) {
        float folhaW = w / 2;

        for (int i = 0; i < 2; i++) {
            float fx = x + (i * folhaW);

            // Vidro
            tpl.setColorFill(ctx.glassFill());
            tpl.rectangle(fx + 0.8f, y + 0.8f, folhaW - 1.6f, h - 1.6f);
            tpl.fill();

            // Moldura
            tpl.setColorStroke(ctx.dividerColor());
            tpl.setLineWidth(0.75f);
            tpl.rectangle(fx, y, folhaW, h);
            tpl.stroke();
        }

        // Arcos de abertura opostos
        tpl.setColorStroke(ctx.indicatorColor());
        tpl.setLineWidth(0.5f);
        tpl.setLineDash(2f, 2f, 0f);

        float raio = Math.min(folhaW * 0.8f, h * 0.35f);
        tpl.arc(x, y, x + 2 * raio, y + 2 * raio, 0f, 90f);
        tpl.stroke();
        tpl.arc(x + w - 2 * raio, y, x + w, y + 2 * raio, 90f, 90f);
        tpl.stroke();
        tpl.setLineDash(0f);

        // Puxadores centrais
        float centroX = x + folhaW;
        desenharPuxador(tpl, centroX - 3.5f, y + (h / 2) - 7f, 14f, ctx);
        desenharPuxador(tpl, centroX + 3.5f, y + (h / 2) - 7f, 14f, ctx);
    }

    private void desenharPuxador(PdfTemplate tpl, float px, float py, float len, TemplateVisualContext ctx) {
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(1.2f);
        tpl.moveTo(px, py);
        tpl.lineTo(px, py + len);
        tpl.stroke();
    }
}

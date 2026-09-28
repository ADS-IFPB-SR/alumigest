package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para esquadrias de correr (1, 2, 3 ou 4 folhas - SLIDING).
 * Renderiza caixilhos individuais sobrepostos com folgas e setas de deslizamento lateral.
 */
public class SlidingMachiningStrategy implements TechnicalMachiningStrategy {

    private final int leafCount;

    public SlidingMachiningStrategy(int leafCount) {
        this.leafCount = Math.clamp(leafCount, 1, 4);
    }

    @Override
    public void draw(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    ) {
        float innerOffset = TechnicalMachiningDrawingUtils.INNER_OFFSET;
        float innerX = startX + innerOffset;
        float innerY = startY + innerOffset;
        float innerW = drawW - (2 * innerOffset);
        float innerH = drawH - (2 * innerOffset);

        int leaves = ctx.getLeafCount() > 1 ? ctx.getLeafCount() : this.leafCount;
        leaves = Math.clamp(leaves, 1, 4);
        float leafW = innerW / leaves;

        // 1. Marco perimetral externo
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);

        // 2. Caixilhos individuais com folgas de usinagem e setas
        for (int i = 0; i < leaves; i++) {
            float fx = innerX + (i * leafW);

            tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_OUTER);
            tpl.setLineWidth(0.85f);
            tpl.rectangle(fx, innerY, leafW, innerH);
            tpl.stroke();

            tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_INNER);
            tpl.setLineWidth(0.5f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            tpl.rectangle(fx + 1.5f, innerY + 1.5f, leafW - 3f, innerH - 3f);
            tpl.stroke();
            tpl.setLineDash(0f);

            // Seta de deslizamento lateral com alternância de sentido
            TechnicalMachiningDrawingUtils.drawSlidingArrow(
                    tpl, fx, innerY, leafW, innerH, i % 2 == 0);
        }

        // 3. Puxador ou fecho concha na folha móvel
        if (ctx.hasHandle()) {
            TechnicalMachiningDrawingUtils.drawVerticalHandle(
                    tpl, ctx.handle(), startX, startY, drawW, drawH, canvasWidth);
        }
    }
}

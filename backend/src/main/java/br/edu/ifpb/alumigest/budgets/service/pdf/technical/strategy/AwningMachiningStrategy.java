package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para janelas Maxim-Ar / Basculantes (AWNING / TILT).
 * Renderiza folha projetante com arco vertical e fecho concha centralizado na base.
 */
public class AwningMachiningStrategy implements TechnicalMachiningStrategy {

    private final boolean inverted;

    public AwningMachiningStrategy(boolean inverted) {
        this.inverted = inverted;
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

        // 1. Marco externo perimetral
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);

        // 2. Caixilho interno da folha basculante
        tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_OUTER);
        tpl.setLineWidth(0.85f);
        tpl.rectangle(innerX, innerY, innerW, innerH);
        tpl.stroke();

        // 3. Linha interna pontilhada de folga de usinagem
        TechnicalMachiningDrawingUtils.drawInnerDashedClearance(
                tpl, startX, startY, drawW, drawH);

        // 4. Arco vertical pontilhado de projeção basculante externa
        tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_INNER);
        tpl.setLineWidth(0.5f);
        tpl.setLineDash(2f, 2f, 0f);

        float radiusY = Math.min(innerH * 0.40f, innerW * 0.35f);
        float centerX = innerX + (innerW / 2f);
        if (inverted) {
            tpl.arc(centerX - radiusY, innerY + innerH - (2 * radiusY),
                    centerX + radiusY, innerY + innerH, 180f, 180f);
        } else {
            tpl.arc(centerX - radiusY, innerY, centerX + radiusY, innerY + (2 * radiusY), 0f, 180f);
        }
        tpl.stroke();
        tpl.setLineDash(0f);

        // 5. Fecho concha / trinco centralizado na travessa inferior (ou superior se invertido)
        TechnicalMachiningDrawingUtils.drawBottomLatch(
                tpl, ctx.handle(), startX, startY, drawW);
    }
}

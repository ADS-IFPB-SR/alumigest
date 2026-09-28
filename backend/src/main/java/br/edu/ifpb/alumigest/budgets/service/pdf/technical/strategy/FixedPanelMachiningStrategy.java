package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para painéis fixos e fachadas (FIXED_PANEL / FIXED).
 * Renderiza marco com demarcação técnica em 'X' indicando ausência de componentes móveis.
 */
public class FixedPanelMachiningStrategy implements TechnicalMachiningStrategy {

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

        // 1. Marco perimetral
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);

        // 2. Folga interna pontilhada
        TechnicalMachiningDrawingUtils.drawInnerDashedClearance(
                tpl, startX, startY, drawW, drawH);

        // 3. Traçado técnico em 'X' pontilhado sutil indicando painel estático/fixo
        tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_INNER);
        tpl.setLineWidth(0.45f);
        tpl.setLineDash(2f, 2f, 0f);
        tpl.moveTo(innerX, innerY);
        tpl.lineTo(innerX + innerW, innerY + innerH);
        tpl.moveTo(innerX, innerY + innerH);
        tpl.lineTo(innerX + innerW, innerY);
        tpl.stroke();
        tpl.setLineDash(0f);
    }
}

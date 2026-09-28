package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para portas de giro duplas (2 folhas - SWING_2F).
 * Renderiza divisão central simétrica, dobradiças nas extremidades externas
 * e puxadores duplos de encontro central.
 */
public class SwingDoubleLeafMachiningStrategy implements TechnicalMachiningStrategy {

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
        float leafW = innerW / 2f;

        // 1. Marco perimetral externo
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);

        // 2. Caixilhos individuais das duas folhas móveis com folgas de usinagem
        for (int i = 0; i < 2; i++) {
            float fx = innerX + (i * leafW);

            // Caixilho sólido da folha
            tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_OUTER);
            tpl.setLineWidth(0.85f);
            tpl.rectangle(fx, innerY, leafW, innerH);
            tpl.stroke();

            // Folga interna pontilhada de cada folha
            tpl.setColorStroke(TechnicalMachiningDrawingUtils.COLOR_FRAME_INNER);
            tpl.setLineWidth(0.5f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            tpl.rectangle(fx + 1.5f, innerY + 1.5f, leafW - 3f, innerH - 3f);
            tpl.stroke();
            tpl.setLineDash(0f);
        }

        // 3. Arcos de abertura opostos (projeção para fora)
        TechnicalMachiningDrawingUtils.drawSwingOpeningArc(
                tpl, innerX, innerY, leafW, innerH, true);
        TechnicalMachiningDrawingUtils.drawSwingOpeningArc(
                tpl, innerX + leafW, innerY, leafW, innerH, false);

        // 4. Dobradiças externas (extremidade esquerda e extremidade direita)
        if (ctx.hasDrilling()) {
            float leftHoleX = innerX + 2.5f;
            float rightHoleX = innerX + innerW - 2.5f;
            TechnicalMachiningDrawingUtils.drawLateralDrillings(
                    tpl, ctx.drillingHoles(), leftHoleX, startY, drawH, true);
            TechnicalMachiningDrawingUtils.drawLateralDrillings(
                    tpl, ctx.drillingHoles(), rightHoleX, startY, drawH, false);
        }

        // 5. Puxadores no encontro central das duas folhas
        float centerX = innerX + leafW;
        TechnicalMachiningDrawingUtils.drawDoubleCentralHandles(
                tpl, ctx.handle(), centerX, startY, drawH);
    }
}

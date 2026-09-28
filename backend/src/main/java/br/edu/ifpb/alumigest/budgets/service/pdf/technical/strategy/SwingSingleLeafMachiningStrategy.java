package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para portas de giro de folha única (SWING_1F).
 */
public class SwingSingleLeafMachiningStrategy implements TechnicalMachiningStrategy {

    @Override
    public void draw(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    ) {
        // Marco e folga de usinagem
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);
        TechnicalMachiningDrawingUtils.drawInnerDashedClearance(
                tpl, startX, startY, drawW, drawH);

        // Lado da articulação e arco de abertura
        boolean onLeftSide = ctx.hasHandle()
                ? ctx.handle().onRightSide()
                : (ctx.isOpeningLeft() || ctx.openingDirection() == null);

        TechnicalMachiningDrawingUtils.drawSwingOpeningArc(
                tpl, startX, startY, drawW, drawH, onLeftSide);

        // Furações de dobradiça no lado da articulação
        if (ctx.hasDrilling()) {
            float holeX = onLeftSide
                    ? (startX + TechnicalMachiningDrawingUtils.INNER_OFFSET + 2.5f)
                    : (startX + drawW - TechnicalMachiningDrawingUtils.INNER_OFFSET - 2.5f);
            TechnicalMachiningDrawingUtils.drawLateralDrillings(
                    tpl, ctx.drillingHoles(), holeX, startY, drawH, onLeftSide);
        }

        // Puxador no lado oposto à articulação
        if (ctx.hasHandle()) {
            TechnicalMachiningDrawingUtils.drawVerticalHandle(
                    tpl, ctx.handle(), startX, startY, drawW, drawH, canvasWidth);
        }
    }
}

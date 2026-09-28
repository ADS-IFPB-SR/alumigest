package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem fallback para tipologias não catalogadas ou modelos sob medida genéricos.
 */
public class FallbackMachiningStrategy implements TechnicalMachiningStrategy {

    private final TechnicalMachiningStrategy delegate = new SwingSingleLeafMachiningStrategy();

    @Override
    public void draw(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    ) {
        delegate.draw(tpl, ctx, startX, startY, drawW, drawH, canvasWidth);
    }
}

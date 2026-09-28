package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Estratégia de usinagem para frentes de gaveta de alumínio/vidro (DRAWER / FRONT_DRAWER).
 * Renderiza painel horizontal com puxador perfil horizontal centralizado e sem furações de giro.
 */
public class DrawerMachiningStrategy implements TechnicalMachiningStrategy {

    @Override
    public void draw(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    ) {
        // 1. Marco perimetral
        TechnicalMachiningDrawingUtils.drawPerimeterFrame(tpl, startX, startY, drawW, drawH);

        // 2. Folga interna pontilhada
        TechnicalMachiningDrawingUtils.drawInnerDashedClearance(
                tpl, startX, startY, drawW, drawH);

        // 3. Puxador horizontal centralizado com cota descritiva
        TechnicalMachiningDrawingUtils.drawCentralHorizontalHandle(
                tpl, ctx.handle(), startX, startY, drawW, drawH);
    }
}

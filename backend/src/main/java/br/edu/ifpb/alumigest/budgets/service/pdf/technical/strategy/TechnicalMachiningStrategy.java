package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Contrato de estratégia (Strategy Pattern) para renderização vetorial técnica
 * do esquema de usinagem, furações e puxadores por tipologia de esquadria (US-11.2 / #347).
 */
@FunctionalInterface
public interface TechnicalMachiningStrategy {

    /**
     * Renderiza o esquema técnico completo da esquadria no template OpenPDF.
     *
     * @param tpl         template vetorial OpenPDF
     * @param ctx         contexto dimensional e paramétrico de usinagem
     * @param startX      coordenada X inicial da área de desenho
     * @param startY      coordenada Y inicial da área de desenho
     * @param drawW       largura útil do desenho em pontos
     * @param drawH       altura útil do desenho em pontos
     * @param canvasWidth largura total do canvas do template (para cotas na margem)
     */
    void draw(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    );
}

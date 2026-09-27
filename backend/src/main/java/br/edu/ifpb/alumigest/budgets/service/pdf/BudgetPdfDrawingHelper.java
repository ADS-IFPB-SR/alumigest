package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.DrillingHolePoint;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalHandle;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningResolver;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;

/**
 * Utilitário gráfico vetorial para renderização do esquema técnico de usinagem,
 * furações e puxadores na Ficha Técnica de Oficina (US-11.2).
 */
public final class BudgetPdfDrawingHelper {

    /** Dimensão padrão do esquema técnico de usinagem na Ficha Técnica (US-11.2). */
    public static final float DEFAULT_MACHINING_SIZE = 105f;

    private static final float INNER_OFFSET = 3.5f;
    private static final BaseFont BASE_FONT_HELVETICA;

    static {
        try {
            BASE_FONT_HELVETICA = BaseFont.createFont(
                    BaseFont.HELVETICA,
                    BaseFont.WINANSI,
                    BaseFont.NOT_EMBEDDED
            );
        } catch (Exception e) {
            throw new ExceptionInInitializerError("Falha ao inicializar fonte base OpenPDF para esquema técnico: " + e.getMessage());
        }
    }

    private BudgetPdfDrawingHelper() {
        throw new UnsupportedOperationException("Classe utilitária não pode ser instanciada.");
    }

    /**
     * Desenha o esquema técnico ampliado de usinagem, furações e puxador para a Ficha Técnica de Oficina (US-11.2).
     *
     * @param writer instância ativa do {@link PdfWriter}
     * @param item   item do orçamento contendo template, furações e puxador
     * @param width  largura da área técnica em pontos PDF
     * @param height altura da área técnica em pontos PDF
     * @return {@link Image} vetorial contendo o esquema cotado
     */
    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item, float width, float height) {
        if (writer == null) {
            throw new IllegalArgumentException("O PdfWriter não pode ser nulo.");
        }
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Largura e altura do esquema devem ser positivas.");
        }

        PdfContentByte directContent = writer.getDirectContent();
        PdfTemplate tpl = directContent.createTemplate(width, height);

        // 1. Fundo limpo
        tpl.setColorFill(Color.WHITE);
        tpl.rectangle(0, 0, width, height);
        tpl.fill();

        // 2. Contexto técnico normalizado
        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        // 3. Cálculo de proporção geométrica no bounding box com margens para cotas
        float marginX = 26.0f;
        float marginY = 10.0f;
        float availW = width - (2 * marginX);
        float availH = height - (2 * marginY);

        float aspect = ctx.getAspectRatio();
        float drawW;
        float drawH;
        if (aspect >= (availW / availH)) {
            drawW = availW;
            drawH = Math.min(availH, drawW / aspect);
        } else {
            drawH = availH;
            drawW = Math.min(availW, drawH * aspect);
        }

        float startX = marginX + (availW - drawW) / 2f;
        float startY = marginY + (availH - drawH) / 2f;

        // 4. Desenho dos componentes técnicos
        desenharMolduraTecnica(tpl, startX, startY, drawW, drawH);

        if (ctx.hasDrilling()) {
            desenharFuracoesUsinagem(tpl, ctx, startX, startY, drawW, drawH);
        }

        if (ctx.hasHandle()) {
            desenharPuxadorTecnico(tpl, ctx.handle(), startX, startY, drawW, drawH);
        }

        return Image.getInstance(tpl);
    }

    /**
     * Sobrecarga de conveniência que utiliza as dimensões canônicas da Ficha Técnica (105×105 pt).
     *
     * @param writer instância ativa do {@link PdfWriter}
     * @param item   item do orçamento contendo template, furações e puxador
     * @return {@link Image} vetorial contendo o esquema cotado
     */
    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item) {
        return desenharEsquemaUsinagem(writer, item, DEFAULT_MACHINING_SIZE, DEFAULT_MACHINING_SIZE);
    }

    private static void desenharMolduraTecnica(PdfTemplate tpl, float x, float y, float w, float h) {
        // Moldura externa da folha
        tpl.setColorStroke(new Color(51, 65, 85));
        tpl.setLineWidth(1.4f);
        tpl.rectangle(x, y, w, h);
        tpl.stroke();

        // Linha interna pontilhada de folga de usinagem
        tpl.setColorStroke(new Color(148, 163, 184));
        tpl.setLineWidth(0.6f);
        tpl.setLineDash(2f, 2f, 0f);
        tpl.rectangle(x + INNER_OFFSET, y + INNER_OFFSET, w - (2 * INNER_OFFSET), h - (2 * INNER_OFFSET));
        tpl.stroke();
        tpl.setLineDash(0f);
    }

    private static void desenharFuracoesUsinagem(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY, float drawW, float drawH
    ) {
        boolean onLeftSide = !ctx.isOpeningLeft();
        float furoX = onLeftSide ? (startX + INNER_OFFSET + 2.5f) : (startX + drawW - INNER_OFFSET - 2.5f);
        float cotaGuiaX = onLeftSide ? (startX - 5f) : (startX + drawW + 5f);
        int textAlign = onLeftSide ? PdfContentByte.ALIGN_RIGHT : PdfContentByte.ALIGN_LEFT;

        for (DrillingHolePoint furo : ctx.drillingHoles()) {
            float furoY = startY + INNER_OFFSET + furo.yRatio() * (drawH - (2 * INNER_OFFSET));

            // Círculo vermelho do furo
            tpl.setColorFill(new Color(220, 38, 38));
            tpl.setColorStroke(new Color(153, 27, 27));
            tpl.setLineWidth(0.8f);
            tpl.circle(furoX, furoY, 2.5f);
            tpl.fillStroke();

            // Linha guia pontilhada da cota
            tpl.setColorStroke(new Color(239, 68, 68, 180));
            tpl.setLineWidth(0.5f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            tpl.moveTo(furoX, furoY);
            tpl.lineTo(cotaGuiaX, furoY);
            tpl.stroke();
            tpl.setLineDash(0f);

            // Texto técnico da cota
            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
            tpl.setColorFill(new Color(71, 85, 105));
            tpl.showTextAligned(textAlign, furo.label(), cotaGuiaX + (onLeftSide ? -1.5f : 1.5f), furoY - 1.5f, 0f);
            tpl.endText();
        }
    }

    private static void desenharPuxadorTecnico(
            PdfTemplate tpl,
            TechnicalHandle puxador,
            float startX, float startY, float drawW, float drawH
    ) {
        float px = puxador.onRightSide()
                ? (startX + drawW - INNER_OFFSET - 2.5f)
                : (startX + INNER_OFFSET + 2.5f);

        float hDisponivel = drawH - (2 * INNER_OFFSET);
        float handleLen = Math.max(12f, hDisponivel * puxador.lengthRatio());
        float centerY = startY + INNER_OFFSET + (hDisponivel * puxador.centerYRatio());
        float py1 = centerY - (handleLen / 2f);
        float py2 = centerY + (handleLen / 2f);

        // Barra do puxador
        tpl.setColorStroke(new Color(30, 41, 59));
        tpl.setLineWidth(2.2f);
        tpl.moveTo(px, py1);
        tpl.lineTo(px, py2);
        tpl.stroke();

        // Suportes / fixações do puxador
        tpl.setLineWidth(0.8f);
        tpl.moveTo(px - 2f, py1);
        tpl.lineTo(px + 2f, py1);
        tpl.moveTo(px - 2f, py2);
        tpl.lineTo(px + 2f, py2);
        tpl.stroke();

        // Texto do puxador cotado
        float textX = puxador.onRightSide() ? (startX + drawW + 4f) : (startX - 4f);
        int align = puxador.onRightSide() ? PdfContentByte.ALIGN_LEFT : PdfContentByte.ALIGN_RIGHT;

        tpl.beginText();
        tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
        tpl.setColorFill(new Color(30, 41, 59));
        tpl.showTextAligned(align, puxador.label(), textX, centerY - 1.5f, 0f);
        tpl.endText();
    }
}

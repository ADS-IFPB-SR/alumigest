package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailRegistry;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailStrategy;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContextResolver;
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
 * Fachada unificada (Facade) do motor gráfico vetorial para PDFs do AlumiGest.
 *
 * <p>Responsável por:
 * <ul>
 *   <li>Renderização de miniaturas vetoriais de esquadrias para a Proposta Comercial (US-10.3).</li>
 *   <li>Renderização do esquema técnico cotado de usinagem, furações e puxadores para a Ficha Técnica de Oficina (US-11.2).</li>
 * </ul>
 * </p>
 */
public final class BudgetPdfDrawingHelper {

    /** Largura padrão da miniatura em pontos PDF (US-10.3). */
    public static final float DEFAULT_WIDTH = 60f;

    /** Altura padrão da miniatura em pontos PDF (US-10.3). */
    public static final float DEFAULT_HEIGHT = 70f;

    /** Dimensão padrão do esquema técnico de usinagem na Ficha Técnica (US-11.2). */
    public static final float DEFAULT_MACHINING_SIZE = 105f;

    /** Espessura do marco externo em pontos PDF. */
    private static final float ESPESSURA_MARCO = 1.8f;

    /** Offset de alinhamento perimetral do marco externo em pontos PDF. */
    private static final float OFFSET_MARCO = ESPESSURA_MARCO / 2f;

    /** Folga interna da linha de usinagem. */
    private static final float INNER_OFFSET = 3.5f;

    /** Cores constantes estáticas para renderização técnica. */
    private static final Color COLOR_MOLDURA_EXTERNA = new Color(51, 65, 85);
    private static final Color COLOR_MOLDURA_INTERNA = new Color(148, 163, 184);
    private static final Color COLOR_FURO_FILL       = new Color(220, 38, 38);
    private static final Color COLOR_FURO_STROKE     = new Color(153, 27, 27);
    private static final Color COLOR_COTA_GUIA       = new Color(239, 68, 68, 180);
    private static final Color COLOR_COTA_TEXTO      = new Color(71, 85, 105);
    private static final Color COLOR_PUXADOR         = new Color(30, 41, 59);

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

    // =========================================================================
    // Motor Gráfico Comercial: Miniaturas Vetoriais de Esquadrias (US-10.3)
    // =========================================================================

    /**
     * Desenha a miniatura vetorial da esquadria com base no item do orçamento e suas opções reais.
     *
     * @param writer instância ativa do {@link PdfWriter}
     * @param item   item do orçamento contendo template, dimensões e materiais
     * @param width  largura da miniatura em pontos PDF
     * @param height altura da miniatura em pontos PDF
     * @return {@link Image} vetorial pronta para uso em células de tabela do PDF
     */
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item, float width, float height) {
        if (writer == null) {
            throw new IllegalArgumentException("O PdfWriter não pode ser nulo.");
        }
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Largura e altura devem ser positivas.");
        }

        PdfContentByte directContent = writer.getDirectContent();
        PdfTemplate template = directContent.createTemplate(width, height);

        // 1. Resolução dinâmica de propriedades visuais (cores reais de perfil e vidro)
        TemplateVisualContext visualContext = TemplateVisualContextResolver.resolve(item);

        // 2. Marco/Caixilho perimetral externo com a cor real do alumínio
        desenharMarcoExterno(template, visualContext, width, height);

        // 3. Resolução da estratégia no Registry (resiliente contra exclusão de templates)
        String rawTemplateType = item != null ? item.getTemplateType() : null;
        TemplateThumbnailStrategy strategy = TemplateThumbnailRegistry.getInstance().getStrategy(rawTemplateType);

        // 4. Execução da estratégia vetorial
        strategy.draw(template, item, visualContext, width, height);

        return Image.getInstance(template);
    }

    /**
     * Sobrecarga de conveniência que utiliza as dimensões canônicas (60×70 pt).
     */
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item) {
        return desenharMiniaturaEsquadria(writer, item, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * Retorna a instância global do registro de estratégias para extensibilidade.
     */
    public static TemplateThumbnailRegistry getRegistry() {
        return TemplateThumbnailRegistry.getInstance();
    }

    private static void desenharMarcoExterno(PdfTemplate tpl, TemplateVisualContext ctx, float w, float h) {
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(ESPESSURA_MARCO);
        tpl.rectangle(OFFSET_MARCO, OFFSET_MARCO, w - ESPESSURA_MARCO, h - ESPESSURA_MARCO);
        tpl.stroke();
    }

    // =========================================================================
    // Motor Gráfico de Oficina: Esquema Cotado de Usinagem e Puxadores (US-11.2)
    // =========================================================================

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

        // 3. Determinação de margens dinâmicas baseadas nos componentes cotados
        float[] margens = calcularMargensLaterais(ctx);
        float[] bounds = calcularPosicionamentoDesenho(ctx, width, height, margens[0], margens[1]);
        float startX = bounds[0];
        float startY = bounds[1];
        float drawW = bounds[2];
        float drawH = bounds[3];

        // 4. Desenho dos componentes técnicos
        desenharMolduraTecnica(tpl, ctx, startX, startY, drawW, drawH);

        if (ctx.hasDrilling()) {
            desenharFuracoesUsinagem(tpl, ctx, startX, startY, drawW, drawH);
        }

        if (ctx.hasHandle()) {
            desenharPuxadorTecnico(tpl, ctx, startX, startY, drawW, drawH, width);
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

    private static float[] calcularMargensLaterais(TechnicalMachiningContext ctx) {
        boolean hasDrill = ctx.hasDrilling();
        boolean hasHandle = ctx.hasHandle();
        boolean isDoubleSwing = ctx.isDoubleSwingDoor();

        boolean handleOnRight = hasHandle && !isDoubleSwing && ctx.handle().onRightSide();
        boolean handleOnLeft = hasHandle && !isDoubleSwing && !ctx.handle().onRightSide();

        boolean drillOnLeft = hasDrill && (handleOnRight || isDoubleSwing
                || (!hasHandle && (ctx.isOpeningLeft() || ctx.openingDirection() == null)));
        boolean drillOnRight = hasDrill && !drillOnLeft;

        float marginLeft = 10.0f;
        if (drillOnLeft) {
            marginLeft = Math.max(marginLeft, 32.0f);
        }
        if (handleOnLeft) {
            marginLeft = Math.max(marginLeft, 44.0f);
        }

        float marginRight = 10.0f;
        if (drillOnRight) {
            marginRight = Math.max(marginRight, 32.0f);
        }
        if (handleOnRight) {
            marginRight = Math.max(marginRight, 44.0f);
        }

        return new float[]{marginLeft, marginRight};
    }

    private static float[] calcularPosicionamentoDesenho(
            TechnicalMachiningContext ctx, float width, float height, float marginLeft, float marginRight
    ) {
        float marginY = Math.min(8.0f, height * 0.08f);
        float availW = Math.max(10.0f, width - (marginLeft + marginRight));
        float availH = Math.max(10.0f, height - (2 * marginY));

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

        float startX = marginLeft + (availW - drawW) / 2f;
        float startY = marginY + (availH - drawH) / 2f;
        return new float[]{startX, startY, drawW, drawH};
    }

    private static void desenharMolduraTecnica(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float x, float y, float w, float h
    ) {
        // Moldura externa da folha
        tpl.setColorStroke(COLOR_MOLDURA_EXTERNA);
        tpl.setLineWidth(1.4f);
        tpl.rectangle(x, y, w, h);
        tpl.stroke();

        int leaves = ctx != null ? ctx.getLeafCount() : 1;
        boolean isDoubleSwing = ctx != null && ctx.isDoubleSwingDoor();

        if (leaves <= 1 && !isDoubleSwing) {
            // Linha interna pontilhada de folga de usinagem (folha única)
            tpl.setColorStroke(COLOR_MOLDURA_INTERNA);
            tpl.setLineWidth(0.6f);
            tpl.setLineDash(2f, 2f, 0f);
            tpl.rectangle(x + INNER_OFFSET, y + INNER_OFFSET, w - (2 * INNER_OFFSET), h - (2 * INNER_OFFSET));
            tpl.stroke();
            tpl.setLineDash(0f);
        } else if (isDoubleSwing) {
            // Divisão de folhas para porta de giro duplo (2 folhas com montante central de encontro)
            float innerOffset = INNER_OFFSET;
            float innerX = x + innerOffset;
            float innerY = y + innerOffset;
            float innerW = w - (2 * innerOffset);
            float innerH = h - (2 * innerOffset);
            float leafW = innerW / 2f;

            for (int i = 0; i < 2; i++) {
                float fx = innerX + (i * leafW);

                // Caixilho sólido da folha
                tpl.setColorStroke(COLOR_MOLDURA_EXTERNA);
                tpl.setLineWidth(0.85f);
                tpl.rectangle(fx, innerY, leafW, innerH);
                tpl.stroke();

                // Folga interna pontilhada de usinagem
                tpl.setColorStroke(COLOR_MOLDURA_INTERNA);
                tpl.setLineWidth(0.5f);
                tpl.setLineDash(1.5f, 1.5f, 0f);
                tpl.rectangle(fx + 1.5f, innerY + 1.5f, leafW - 3f, innerH - 3f);
                tpl.stroke();
                tpl.setLineDash(0f);
            }
        } else {
            // Divisão de folhas para tipologias de correr multifolhas (2F, 3F, 4F) - Task #342
            float innerOffset = INNER_OFFSET;
            float innerX = x + innerOffset;
            float innerY = y + innerOffset;
            float innerW = w - (2 * innerOffset);
            float innerH = h - (2 * innerOffset);
            float leafW = innerW / leaves;

            for (int i = 0; i < leaves; i++) {
                float fx = innerX + (i * leafW);

                // Caixilho sólido da folha
                tpl.setColorStroke(COLOR_MOLDURA_EXTERNA);
                tpl.setLineWidth(0.85f);
                tpl.rectangle(fx, innerY, leafW, innerH);
                tpl.stroke();

                // Folga interna pontilhada de usinagem
                tpl.setColorStroke(COLOR_MOLDURA_INTERNA);
                tpl.setLineWidth(0.5f);
                tpl.setLineDash(1.5f, 1.5f, 0f);
                tpl.rectangle(fx + 1.5f, innerY + 1.5f, leafW - 3f, innerH - 3f);
                tpl.stroke();
                tpl.setLineDash(0f);

                // Seta de deslizamento lateral alternada
                desenharSetaDeslizamento(tpl, fx, innerY, leafW, innerH, i % 2 == 0);
            }
        }
    }

    private static void desenharSetaDeslizamento(
            PdfTemplate tpl, float fx, float fy, float fw, float fh, boolean toRight
    ) {
        tpl.setColorStroke(COLOR_MOLDURA_INTERNA);
        tpl.setLineWidth(0.55f);

        float centerY = fy + (fh / 2f);
        float arrowMargin = fw * 0.20f;
        float startX = fx + arrowMargin;
        float endX = fx + fw - arrowMargin;
        float arrowHead = Math.min(fw * 0.15f, 3.2f);

        if (endX > startX) {
            tpl.moveTo(startX, centerY);
            tpl.lineTo(endX, centerY);

            float tipX = toRight ? endX : startX;
            float dir = toRight ? -1 : 1;

            tpl.moveTo(tipX + dir * arrowHead, centerY + arrowHead);
            tpl.lineTo(tipX, centerY);
            tpl.lineTo(tipX + dir * arrowHead, centerY - arrowHead);
            tpl.stroke();
        }
    }

    private static void desenharFuracoesUsinagem(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY, float drawW, float drawH
    ) {
        boolean onLeftSide = ctx.hasHandle()
                ? ctx.handle().onRightSide()
                : (ctx.isOpeningLeft() || ctx.openingDirection() == null);
        float furoX = onLeftSide ? (startX + INNER_OFFSET + 2.5f) : (startX + drawW - INNER_OFFSET - 2.5f);
        float cotaGuiaX = onLeftSide ? (startX - 3.5f) : (startX + drawW + 3.5f);
        int textAlign = onLeftSide ? PdfContentByte.ALIGN_RIGHT : PdfContentByte.ALIGN_LEFT;

        for (DrillingHolePoint furo : ctx.drillingHoles()) {
            float furoY = startY + INNER_OFFSET + furo.yRatio() * (drawH - (2 * INNER_OFFSET));

            // Círculo vermelho do furo
            tpl.setColorFill(COLOR_FURO_FILL);
            tpl.setColorStroke(COLOR_FURO_STROKE);
            tpl.setLineWidth(0.8f);
            tpl.circle(furoX, furoY, 2.5f);
            tpl.fillStroke();

            // Linha guia pontilhada da cota
            tpl.setColorStroke(COLOR_COTA_GUIA);
            tpl.setLineWidth(0.5f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            tpl.moveTo(furoX, furoY);
            tpl.lineTo(cotaGuiaX, furoY);
            tpl.stroke();
            tpl.setLineDash(0f);

            // Texto técnico da cota
            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
            tpl.setColorFill(COLOR_COTA_TEXTO);
            tpl.showTextAligned(textAlign, furo.label(), cotaGuiaX + (onLeftSide ? -1.5f : 1.5f), furoY - 1.5f, 0f);
            tpl.endText();
        }
    }

    private static void desenharPuxadorTecnico(
            PdfTemplate tpl,
            TechnicalMachiningContext ctx,
            float startX, float startY, float drawW, float drawH,
            float totalWidth
    ) {
        TechnicalHandle puxador = ctx.handle();
        if (puxador == null) {
            return;
        }
        boolean isDoubleSwing = ctx.isDoubleSwingDoor();

        float hDisponivel = drawH - (2 * INNER_OFFSET);
        float handleLen = Math.max(12f, hDisponivel * puxador.lengthRatio());
        float centerY = startY + INNER_OFFSET + (hDisponivel * puxador.centerYRatio());
        float py1 = centerY - (handleLen / 2f);
        float py2 = centerY + (handleLen / 2f);

        tpl.setColorStroke(COLOR_PUXADOR);

        float textX;
        int align;

        if (isDoubleSwing) {
            float centroX = startX + (drawW / 2f);
            float offsetPuxador = 3.0f;

            // Barra esquerda do puxador duplo central
            tpl.setLineWidth(1.8f);
            tpl.moveTo(centroX - offsetPuxador, py1);
            tpl.lineTo(centroX - offsetPuxador, py2);
            tpl.stroke();

            // Suportes da barra esquerda
            tpl.setLineWidth(0.7f);
            tpl.moveTo(centroX - offsetPuxador - 1.5f, py1);
            tpl.lineTo(centroX - offsetPuxador + 1.5f, py1);
            tpl.moveTo(centroX - offsetPuxador - 1.5f, py2);
            tpl.lineTo(centroX - offsetPuxador + 1.5f, py2);
            tpl.stroke();

            // Barra direita do puxador duplo central
            tpl.setLineWidth(1.8f);
            tpl.moveTo(centroX + offsetPuxador, py1);
            tpl.lineTo(centroX + offsetPuxador, py2);
            tpl.stroke();

            // Suportes da barra direita
            tpl.setLineWidth(0.7f);
            tpl.moveTo(centroX + offsetPuxador - 1.5f, py1);
            tpl.lineTo(centroX + offsetPuxador + 1.5f, py1);
            tpl.moveTo(centroX + offsetPuxador - 1.5f, py2);
            tpl.lineTo(centroX + offsetPuxador + 1.5f, py2);
            tpl.stroke();

            textX = centroX;
            align = PdfContentByte.ALIGN_CENTER;
            float maxAvailable = Math.max(drawW - 4.0f, 38.0f);
            desenharRotuloPuxadorComMascara(tpl, puxador.label(), textX, py1 - 7.0f, align, maxAvailable);
        } else {
            float px = puxador.onRightSide()
                    ? (startX + drawW - INNER_OFFSET - 2.5f)
                    : (startX + INNER_OFFSET + 2.5f);

            // Barra do puxador
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

            // Texto do puxador cotado na lateral
            textX = puxador.onRightSide() ? (startX + drawW + 3.5f) : (startX - 3.5f);
            align = puxador.onRightSide() ? PdfContentByte.ALIGN_LEFT : PdfContentByte.ALIGN_RIGHT;
            float maxAvailable = puxador.onRightSide() ? (totalWidth - textX - 1.5f) : (textX - 1.5f);
            desenharRotuloPuxadorComMascara(tpl, puxador.label(), textX, centerY, align, maxAvailable);
        }
    }

    private static void desenharRotuloPuxadorComMascara(
            PdfTemplate tpl,
            String label,
            float textX,
            float centerY,
            int align,
            float maxAvailable
    ) {

        float labelWidth = BASE_FONT_HELVETICA.getWidthPoint(label, 5.5f);
        boolean singleLine = labelWidth <= maxAvailable || !label.contains(" ");

        float padX = 2.2f;
        float padY = 1.4f;

        if (singleLine) {
            float textY = centerY - 1.5f;
            float boxW = labelWidth + (2 * padX);
            float boxH = 6.2f + (2 * padY);
            float boxX = switch (align) {
                case PdfContentByte.ALIGN_CENTER -> textX - (boxW / 2f);
                case PdfContentByte.ALIGN_LEFT -> textX - padX;
                default -> textX - labelWidth - padX;
            };
            float boxY = textY - 1.4f - padY;

            // Máscara de proteção branca (pill background)
            tpl.setColorFill(Color.WHITE);
            tpl.roundRectangle(boxX, boxY, boxW, boxH, 1.8f);
            tpl.fill();

            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
            tpl.setColorFill(COLOR_PUXADOR);
            tpl.showTextAligned(align, label, textX, textY, 0f);
            tpl.endText();
        } else {
            int splitIdx = label.contains(" (") ? label.indexOf(" (") : label.lastIndexOf(' ');
            String line1 = label.substring(0, splitIdx).trim();
            String line2 = label.substring(splitIdx).trim();

            float w1 = BASE_FONT_HELVETICA.getWidthPoint(line1, 5.5f);
            float w2 = BASE_FONT_HELVETICA.getWidthPoint(line2, 5.5f);
            float maxW = Math.max(w1, w2);

            float yLine1 = centerY + 2.0f;
            float yLine2 = centerY - 4.5f;

            float boxW = maxW + (2 * padX);
            float boxH = 12.8f + (2 * padY);
            float boxX = switch (align) {
                case PdfContentByte.ALIGN_CENTER -> textX - (boxW / 2f);
                case PdfContentByte.ALIGN_LEFT -> textX - padX;
                default -> textX - maxW - padX;
            };
            float boxY = yLine2 - 1.4f - padY;

            // Máscara de proteção branca (pill background)
            tpl.setColorFill(Color.WHITE);
            tpl.roundRectangle(boxX, boxY, boxW, boxH, 1.8f);
            tpl.fill();

            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
            tpl.setColorFill(COLOR_PUXADOR);
            tpl.showTextAligned(align, line1, textX, yLine1, 0f);
            tpl.showTextAligned(align, line2, textX, yLine2, 0f);
            tpl.endText();
        }
    }
}

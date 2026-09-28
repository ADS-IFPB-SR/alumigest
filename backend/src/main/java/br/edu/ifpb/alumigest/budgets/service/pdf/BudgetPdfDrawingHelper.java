package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailRegistry;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailStrategy;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContextResolver;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningResolver;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy.TechnicalMachiningRegistry;
import com.lowagie.text.Image;
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
 *   <li>Renderização do esquema técnico cotado de usinagem para a Ficha Técnica de Oficina (US-11.2).</li>
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
    public static final float FRAME_STROKE_WIDTH = 1.8f;

    /** Offset de alinhamento perimetral do marco externo em pontos PDF. */
    public static final float FRAME_OFFSET = FRAME_STROKE_WIDTH / 2f;

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
    public static Image drawWindowThumbnail(PdfWriter writer, BudgetItem item, float width, float height) {
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
        drawOuterFrame(template, visualContext, width, height);

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
    public static Image drawWindowThumbnail(PdfWriter writer, BudgetItem item) {
        return drawWindowThumbnail(writer, item, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * @deprecated Use {@link #drawWindowThumbnail(PdfWriter, BudgetItem, float, float)} em substituição.
     */
    @Deprecated(since = "1.0", forRemoval = false)
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item, float width, float height) {
        return drawWindowThumbnail(writer, item, width, height);
    }

    /**
     * @deprecated Use {@link #drawWindowThumbnail(PdfWriter, BudgetItem)} em substituição.
     */
    @Deprecated(since = "1.0", forRemoval = false)
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item) {
        return drawWindowThumbnail(writer, item, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * Retorna a instância global do registro de estratégias para extensibilidade.
     */
    public static TemplateThumbnailRegistry getRegistry() {
        return TemplateThumbnailRegistry.getInstance();
    }

    private static void drawOuterFrame(PdfTemplate tpl, TemplateVisualContext ctx, float w, float h) {
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(FRAME_STROKE_WIDTH);
        tpl.rectangle(FRAME_OFFSET, FRAME_OFFSET, w - FRAME_STROKE_WIDTH, h - FRAME_STROKE_WIDTH);
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
    public static Image drawMachiningScheme(PdfWriter writer, BudgetItem item, float width, float height) {
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
        float[] margens = calculateHorizontalMargins(ctx);
        float[] bounds = calculateDrawingBounds(ctx, width, height, margens[0], margens[1]);
        float startX = bounds[0];
        float startY = bounds[1];
        float drawW = bounds[2];
        float drawH = bounds[3];

        // 4. Delega a renderização técnica à estratégia especializada da tipologia
        TechnicalMachiningRegistry.getInstance()
                .getStrategy(ctx.templateType())
                .draw(tpl, ctx, startX, startY, drawW, drawH, width);

        return Image.getInstance(tpl);
    }

    /**
     * Sobrecarga de conveniência que utiliza as dimensões canônicas da Ficha Técnica (105×105 pt).
     *
     * @param writer instância ativa do {@link PdfWriter}
     * @param item   item do orçamento contendo template, furações e puxador
     * @return {@link Image} vetorial contendo o esquema cotado
     */
    public static Image drawMachiningScheme(PdfWriter writer, BudgetItem item) {
        return drawMachiningScheme(writer, item, DEFAULT_MACHINING_SIZE, DEFAULT_MACHINING_SIZE);
    }

    /**
     * @deprecated Use {@link #drawMachiningScheme(PdfWriter, BudgetItem, float, float)} instead.
     */
    @Deprecated(since = "1.0", forRemoval = false)
    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item, float width, float height) {
        return drawMachiningScheme(writer, item, width, height);
    }

    /**
     * @deprecated Use {@link #drawMachiningScheme(PdfWriter, BudgetItem)} instead.
     */
    @Deprecated(since = "1.0", forRemoval = false)
    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item) {
        return drawMachiningScheme(writer, item, DEFAULT_MACHINING_SIZE, DEFAULT_MACHINING_SIZE);
    }

    private static float[] calculateHorizontalMargins(TechnicalMachiningContext ctx) {
        boolean hasDrill = ctx.hasDrilling();
        boolean hasHandle = ctx.hasHandle();

        boolean handleOnRight = hasHandle && ctx.handle().onRightSide();
        boolean handleOnLeft = hasHandle && !ctx.handle().onRightSide();

        boolean drillOnLeft = hasDrill && (handleOnRight
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

    private static float[] calculateDrawingBounds(
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
}

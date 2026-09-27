package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailRegistry;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailStrategy;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContextResolver;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

/**
 * Fachada (Facade) do motor gráfico vetorial de miniaturas de esquadrias para PDFs do AlumiGest.
 *
 * <p>Responsável por criar o {@link PdfTemplate} vetorial com dimensões padronizadas
 * (padrão 60×70 pt) e delegar a renderização para a estratégia correspondente no
 * {@link TemplateThumbnailRegistry}, respeitando rigorosamente os princípios SOLID.</p>
 *
 * <ul>
 *   <li><b>Single Responsibility (SRP):</b> Esta classe apenas orquestra a criação do template e marco externo.</li>
 *   <li><b>Open/Closed (OCP):</b> Novos modelos podem ser adicionados no {@link TemplateThumbnailRegistry} sem alterar esta classe.</li>
 *   <li><b>Liskov Substitution (LSP) e Dependency Inversion (DIP):</b> Opera exclusivamente sobre a abstração {@link TemplateThumbnailStrategy}.</li>
 * </ul>
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

    private static final com.lowagie.text.pdf.BaseFont BASE_FONT_HELVETICA;

    static {
        try {
            BASE_FONT_HELVETICA = com.lowagie.text.pdf.BaseFont.createFont(
                    com.lowagie.text.pdf.BaseFont.HELVETICA,
                    com.lowagie.text.pdf.BaseFont.WINANSI,
                    com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED
            );
        } catch (Exception e) {
            throw new ExceptionInInitializerError("Falha ao inicializar fonte base OpenPDF para esquema técnico: " + e.getMessage());
        }
    }

    private BudgetPdfDrawingHelper() {
        throw new UnsupportedOperationException("Classe utilitária não pode ser instanciada.");
    }

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
        tpl.setColorFill(java.awt.Color.WHITE);
        tpl.rectangle(0, 0, width, height);
        tpl.fill();

        // 2. Contexto técnico normalizado
        br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext ctx =
                br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningResolver.resolve(item);

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
     */
    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item) {
        return desenharEsquemaUsinagem(writer, item, DEFAULT_MACHINING_SIZE, DEFAULT_MACHINING_SIZE);
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

    private static void desenharMolduraTecnica(PdfTemplate tpl, float x, float y, float w, float h) {
        // Moldura externa da folha
        tpl.setColorStroke(new java.awt.Color(51, 65, 85));
        tpl.setLineWidth(1.4f);
        tpl.rectangle(x, y, w, h);
        tpl.stroke();

        // Linha interna pontilhada de folga de usinagem
        float innerOffset = 3.5f;
        tpl.setColorStroke(new java.awt.Color(148, 163, 184));
        tpl.setLineWidth(0.6f);
        tpl.setLineDash(2f, 2f, 0f);
        tpl.rectangle(x + innerOffset, y + innerOffset, w - (2 * innerOffset), h - (2 * innerOffset));
        tpl.stroke();
        tpl.setLineDash(0f);
    }

    private static void desenharFuracoesUsinagem(
            PdfTemplate tpl,
            br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext ctx,
            float startX, float startY, float drawW, float drawH
    ) {
        float innerOffset = 3.5f;
        boolean onLeftSide = !ctx.isOpeningLeft();
        float furoX = onLeftSide ? (startX + innerOffset + 2.5f) : (startX + drawW - innerOffset - 2.5f);
        float cotaGuiaX = onLeftSide ? (startX - 5f) : (startX + drawW + 5f);
        int textAlign = onLeftSide ? PdfContentByte.ALIGN_RIGHT : PdfContentByte.ALIGN_LEFT;

        for (br.edu.ifpb.alumigest.budgets.service.pdf.technical.DrillingHolePoint furo : ctx.drillingHoles()) {
            float furoY = startY + innerOffset + furo.yRatio() * (drawH - (2 * innerOffset));

            // Círculo vermelho do furo
            tpl.setColorFill(new java.awt.Color(220, 38, 38));
            tpl.setColorStroke(new java.awt.Color(153, 27, 27));
            tpl.setLineWidth(0.8f);
            tpl.circle(furoX, furoY, 2.5f);
            tpl.fillStroke();

            // Linha guia pontilhada da cota
            tpl.setColorStroke(new java.awt.Color(239, 68, 68, 180));
            tpl.setLineWidth(0.5f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            tpl.moveTo(furoX, furoY);
            tpl.lineTo(cotaGuiaX, furoY);
            tpl.stroke();
            tpl.setLineDash(0f);

            // Texto técnico da cota
            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.5f);
            tpl.setColorFill(new java.awt.Color(71, 85, 105));
            tpl.showTextAligned(textAlign, furo.label(), cotaGuiaX + (onLeftSide ? -1.5f : 1.5f), furoY - 1.5f, 0f);
            tpl.endText();
        }
    }

    private static void desenharPuxadorTecnico(
            PdfTemplate tpl,
            br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalHandle puxador,
            float startX, float startY, float drawW, float drawH
    ) {
        float innerOffset = 3.5f;
        float px = puxador.onRightSide()
                ? (startX + drawW - innerOffset - 2.5f)
                : (startX + innerOffset + 2.5f);

        float hDisponivel = drawH - (2 * innerOffset);
        float handleLen = Math.max(12f, hDisponivel * puxador.lengthRatio());
        float centerY = startY + innerOffset + (hDisponivel * puxador.centerYRatio());
        float py1 = centerY - (handleLen / 2f);
        float py2 = centerY + (handleLen / 2f);

        // Barra do puxador
        tpl.setColorStroke(new java.awt.Color(30, 41, 59));
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
        tpl.setColorFill(new java.awt.Color(30, 41, 59));
        tpl.showTextAligned(align, puxador.label(), textX, centerY - 1.5f, 0f);
        tpl.endText();
    }
}

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

    /** Espessura do marco externo em pontos PDF. */
    private static final float ESPESSURA_MARCO = 1.8f;

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
     * Retorna a instância global do registro de estratégias para extensibilidade.
     */
    public static TemplateThumbnailRegistry getRegistry() {
        return TemplateThumbnailRegistry.getInstance();
    }

    private static void desenharMarcoExterno(PdfTemplate tpl, TemplateVisualContext ctx, float w, float h) {
        tpl.setColorStroke(ctx.frameStroke());
        tpl.setLineWidth(ESPESSURA_MARCO);
        float offset = ESPESSURA_MARCO / 2f;
        tpl.rectangle(offset, offset, w - ESPESSURA_MARCO, h - ESPESSURA_MARCO);
        tpl.stroke();
    }
}

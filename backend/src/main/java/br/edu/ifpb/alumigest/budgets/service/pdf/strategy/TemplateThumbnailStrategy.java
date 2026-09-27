package br.edu.ifpb.alumigest.budgets.service.pdf.strategy;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.pdf.PdfTemplate;

/**
 * Contrato de renderização vetorial para miniaturas de esquadrias no PDF.
 * Permite a extensão de novos modelos sem modificação das classes existentes (Princípio Aberto/Fechado - SOLID).
 */
public interface TemplateThumbnailStrategy {

    /**
     * Renderiza o interior vetorial da esquadria no {@link PdfTemplate} do OpenPDF.
     *
     * @param tpl    template gráfico vetorial do OpenPDF
     * @param item   item do orçamento contendo dimensões e configurações paramétricas
     * @param ctx    contexto visual resolvido dinamicamente (cores de alumínio e vidro)
     * @param width  largura da miniatura em pontos PDF
     * @param height altura da miniatura em pontos PDF
     */
    void draw(PdfTemplate tpl, BudgetItem item, TemplateVisualContext ctx, float width, float height);
}

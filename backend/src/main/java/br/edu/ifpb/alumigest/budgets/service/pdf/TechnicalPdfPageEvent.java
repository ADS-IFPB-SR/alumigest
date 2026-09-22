package br.edu.ifpb.alumigest.budgets.service.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;

/**
 * Evento de página para o PDF da Ficha Técnica de Oficina (US-11.1).
 * Implementa cabeçalho fabril repetido e rodapé minimalista com paginação limpa,
 * sem expor dados comerciais.
 */
public class TechnicalPdfPageEvent extends PdfPageEventHelper {

    private static final Font FONTE_RODAPE = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(100, 116, 139));
    private static final Font FONTE_CABECALHO_REPETIDO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(71, 85, 105));

    private final String codigoPedido;
    private final String nomeCliente;

    private PdfTemplate templateTotalPaginas;

    public TechnicalPdfPageEvent(String codigoPedido, String nomeCliente) {
        this.codigoPedido = codigoPedido != null ? codigoPedido : "";
        this.nomeCliente = nomeCliente != null ? nomeCliente : "";
    }

    @Override
    public void onOpenDocument(PdfWriter writer, Document document) {
        templateTotalPaginas = writer.getDirectContent().createTemplate(30, 16);
    }

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        PdfContentByte canvas = writer.getDirectContent();
        Rectangle paginaRect = document.getPageSize();

        float margemEsq = document.leftMargin();
        float margemDir = document.rightMargin();
        float yRodape = document.bottomMargin() - 15f;
        float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

        // Cabeçalho repetido a partir da página 2 para orientação técnica na fábrica
        if (writer.getPageNumber() > 1) {
            float yCabecalho = paginaRect.getHeight() - 20f;
            Phrase fraseCabecalho = new Phrase(
                    "Ficha de Usinagem e Corte  |  Pedido #" + codigoPedido + "  |  Obra: " + nomeCliente,
                    FONTE_CABECALHO_REPETIDO
            );
            ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT, fraseCabecalho, margemEsq, yCabecalho, 0);
        }

        // Rodapé minimalista acordado: "Ficha Técnica #XXXX • Página X de Y"
        String prefixo = "Ficha Técnica #" + codigoPedido + " • Página " + writer.getPageNumber() + " de ";
        float larguraPrefixo = FONTE_RODAPE.getBaseFont().getWidthPoint(prefixo, 8);
        float xInicio = margemEsq + (larguraPagina - (larguraPrefixo + 15)) / 2f;

        ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT, new Phrase(prefixo, FONTE_RODAPE), xInicio, yRodape, 0);
        canvas.addTemplate(templateTotalPaginas, xInicio + larguraPrefixo, yRodape - 1.5f);
    }

    @Override
    public void onCloseDocument(PdfWriter writer, Document document) {
        ColumnText.showTextAligned(
                templateTotalPaginas,
                Element.ALIGN_LEFT,
                new Phrase(String.valueOf(writer.getPageNumber() - 1), FONTE_RODAPE),
                0, 1.5f, 0
        );
    }
}

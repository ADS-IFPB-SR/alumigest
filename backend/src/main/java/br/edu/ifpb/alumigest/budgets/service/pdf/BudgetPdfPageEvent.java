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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class BudgetPdfPageEvent extends PdfPageEventHelper {

    private static final Font FONTE_RODAPE = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));

    private final String codigoOrcamento;
    private final String nomeCliente;
    private final String razaoSocialEmpresa;

    private PdfTemplate templateTotalPaginas;

    public BudgetPdfPageEvent(String codigoOrcamento, String nomeCliente, String razaoSocialEmpresa) {
        this.codigoOrcamento = codigoOrcamento != null ? codigoOrcamento : "";
        this.nomeCliente = nomeCliente != null ? nomeCliente : "";
        this.razaoSocialEmpresa = razaoSocialEmpresa != null ? razaoSocialEmpresa : "";
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
        float yRodape = document.bottomMargin() - 10f;
        float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

        adicionarCabecalhoRepetido(canvas, writer, paginaRect, margemEsq, margemDir);
        adicionarRodapeComPaginacao(canvas, writer, margemEsq, margemDir, yRodape, larguraPagina);
    }

    @Override
    public void onCloseDocument(PdfWriter writer, Document document) {
        ColumnText.showTextAligned(
                templateTotalPaginas,
                Element.ALIGN_LEFT,
                new Phrase(String.valueOf(writer.getPageNumber() - 1), FONTE_RODAPE),
                2, 2, 0
        );
    }

    private void adicionarCabecalhoRepetido(PdfContentByte canvas, PdfWriter writer,
                                             Rectangle paginaRect, float margemEsq, float margemDir) {
        if (writer.getPageNumber() <= 1) {
            return;
        }

        float yCabecalho = paginaRect.getHeight() - 20f;
        float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

        Phrase fraseCabecalho = new Phrase(
                "Orçamento #" + codigoOrcamento + "  |  Cliente: " + nomeCliente,
                FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120))
        );

        ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT, fraseCabecalho,
                margemEsq, yCabecalho, 0);

        Phrase fraseEmpresa = new Phrase(razaoSocialEmpresa,
                FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120)));

        ColumnText.showTextAligned(canvas, Element.ALIGN_RIGHT, fraseEmpresa,
                margemEsq + larguraPagina, yCabecalho, 0);
    }

    private void adicionarRodapeComPaginacao(PdfContentByte canvas, PdfWriter writer,
                                              float margemEsq, float margemDir,
                                              float yRodape, float larguraPagina) {
        String dataHoraGeracao = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
                new Phrase("Gerado em: " + dataHoraGeracao, FONTE_RODAPE),
                margemEsq, yRodape, 0);

        ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                new Phrase(razaoSocialEmpresa + " — Documento confidencial", FONTE_RODAPE),
                margemEsq + (larguraPagina / 2f), yRodape, 0);

        Phrase fraseNumero = new Phrase("Página " + writer.getPageNumber() + " de ", FONTE_RODAPE);
        float xDireita = margemEsq + larguraPagina;
        float xInicioTexto = xDireita - 60f;

        ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
                fraseNumero, xInicioTexto, yRodape, 0);

        canvas.addTemplate(templateTotalPaginas, xInicioTexto + 48f, yRodape);
    }
}

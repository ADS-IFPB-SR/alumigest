package br.edu.ifpb.alumigest.orders.service.pdf;

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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Evento de ciclo de vida de página OpenPDF para comprovante de Pedido de Venda.
 * Responsável por:
 * 1. Cabeçalho repetido em páginas subsequentes (página > 1);
 * 2. Rodapé padronizado em todas as páginas com numeração dinâmica ("Página X de Y"),
 *    código do pedido, data de geração e identificação da empresa.
 * Cenário 3 da US-16 (#140).
 */
public class OrderPdfPageEvent extends PdfPageEventHelper {

  private static final Font FONTE_RODAPE =
      FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
  private static final Font FONTE_CABECALHO =
      FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
  private static final Color COR_LINHA = new Color(225, 230, 235);

  private final String codigoPedido;
  private final String nomeCliente;
  private final String razaoSocialEmpresa;

  private PdfTemplate templateTotalPaginas;

  /**
   * Construtor do evento de página para comprovante de pedido.
   *
   * @param codigoPedido código oficial da ordem de serviço/pedido
   * @param nomeCliente nome do cliente vinculado
   * @param razaoSocialEmpresa razão social institucional da empresa
   */
  public OrderPdfPageEvent(String codigoPedido, String nomeCliente, String razaoSocialEmpresa) {
    this.codigoPedido = codigoPedido != null ? codigoPedido : "";
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
    float rodapeY = document.bottomMargin() - 25f;
    float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

    adicionarCabecalhoRepetido(canvas, writer, paginaRect, margemEsq, margemDir);
    adicionarRodapeComPaginacao(canvas, writer, margemEsq, rodapeY, larguraPagina);
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

    float cabecalhoY = paginaRect.getHeight() - 25f;
    float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

    Phrase fraseCabecalho = new Phrase(
        "Pedido de Venda #" + codigoPedido + "  |  Cliente: " + nomeCliente,
        FONTE_CABECALHO
    );

    ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT, fraseCabecalho,
        margemEsq, cabecalhoY, 0);

    Phrase fraseEmpresa = new Phrase(razaoSocialEmpresa, FONTE_CABECALHO);

    ColumnText.showTextAligned(canvas, Element.ALIGN_RIGHT, fraseEmpresa,
        margemEsq + larguraPagina, cabecalhoY, 0);

    canvas.saveState();
    canvas.setColorStroke(COR_LINHA);
    canvas.setLineWidth(0.5f);
    canvas.moveTo(margemEsq, cabecalhoY - 4f);
    canvas.lineTo(margemEsq + larguraPagina, cabecalhoY - 4f);
    canvas.stroke();
    canvas.restoreState();
  }

  private void adicionarRodapeComPaginacao(PdfContentByte canvas, PdfWriter writer,
                                            float margemEsq,
                                            float rodapeY, float larguraPagina) {
    float linhaY = rodapeY + 12f;
    canvas.saveState();
    canvas.setColorStroke(COR_LINHA);
    canvas.setLineWidth(0.5f);
    canvas.moveTo(margemEsq, linhaY);
    canvas.lineTo(margemEsq + larguraPagina, linhaY);
    canvas.stroke();
    canvas.restoreState();

    String dataHoraGeracao = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo"))
        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

    String textoPedido = "Pedido " + codigoPedido + "  |  Gerado em: " + dataHoraGeracao;
    ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
        new Phrase(textoPedido, FONTE_RODAPE),
        margemEsq, rodapeY, 0);

    String textoEmpresa = razaoSocialEmpresa + " — Comprovante Oficial de Venda";
    ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
        new Phrase(textoEmpresa, FONTE_RODAPE),
        margemEsq + (larguraPagina / 2f), rodapeY, 0);

    Phrase fraseNumero = new Phrase("Página " + writer.getPageNumber() + " de ", FONTE_RODAPE);
    float pontoDireita = margemEsq + larguraPagina;
    float inicioTextoX = pontoDireita - 60f;

    ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
        fraseNumero, inicioTextoX, rodapeY, 0);

    canvas.addTemplate(templateTotalPaginas, inicioTextoX + 48f, rodapeY);
  }
}

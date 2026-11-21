package br.edu.ifpb.alumigest.partsale.service.pdf;

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
import java.util.Objects;

/**
 * Evento de ciclo de vida de página OpenPDF para Orçamento de Venda Avulsa de Partes (US-46.4).
 *
 * <p>Responsável pelo cabeçalho repetido a partir da segunda página e pelo rodapé padronizado
 * com data de geração, identificação do documento e numeração dinâmica ("Página X de Y").
 */
public class PartSalePdfPageEvent extends PdfPageEventHelper {

  private static final ZoneId ZONE_SAO_PAULO = ZoneId.of("America/Sao_Paulo");
  private static final DateTimeFormatter FORMATTER_RODAPE =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  private static final Font FONTE_RODAPE =
      FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
  private static final Font FONTE_CABECALHO =
      FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
  private static final Color COR_LINHA = new Color(225, 230, 235);

  private final String codigoVenda;
  private final String nomeCliente;
  private final String razaoSocialEmpresa;

  private PdfTemplate templateTotalPaginas;

  /**
   * Construtor do evento de página para venda avulsa.
   *
   * @param codigoVenda código oficial da venda ou cotação
   * @param nomeCliente nome do cliente vinculado
   * @param razaoSocialEmpresa razão social institucional da empresa
   */
  public PartSalePdfPageEvent(String codigoVenda, String nomeCliente, String razaoSocialEmpresa) {
    this.codigoVenda = Objects.requireNonNullElse(codigoVenda, "").trim();
    this.nomeCliente = Objects.requireNonNullElse(nomeCliente, "").trim();
    this.razaoSocialEmpresa = Objects.requireNonNullElse(razaoSocialEmpresa, "").trim();
  }

  @Override
  public void onOpenDocument(PdfWriter writer, Document document) {
    templateTotalPaginas = writer.getDirectContent().createTemplate(35, 16);
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

  private void adicionarCabecalhoRepetido(
      PdfContentByte canvas,
      PdfWriter writer,
      Rectangle paginaRect,
      float margemEsq,
      float margemDir
  ) {
    if (writer.getPageNumber() <= 1) {
      return;
    }

    float cabecalhoY = paginaRect.getHeight() - 25f;
    float larguraPagina = paginaRect.getWidth() - margemEsq - margemDir;

    String textoCodigo = codigoVenda.isBlank() ? "Venda Avulsa" : "Venda Avulsa #" + codigoVenda;
    String textoCliente = nomeCliente.isBlank()
        ? ""
        : "  |  Cliente: " + truncarTexto(nomeCliente, 36);
    Phrase fraseCabecalho = new Phrase(textoCodigo + textoCliente, FONTE_CABECALHO);

    ColumnText.showTextAligned(
        canvas, Element.ALIGN_LEFT, fraseCabecalho,
        margemEsq, cabecalhoY, 0
    );

    Phrase fraseEmpresa = new Phrase(truncarTexto(razaoSocialEmpresa, 40), FONTE_CABECALHO);

    ColumnText.showTextAligned(
        canvas, Element.ALIGN_RIGHT, fraseEmpresa,
        margemEsq + larguraPagina, cabecalhoY, 0
    );

    canvas.saveState();
    canvas.setColorStroke(COR_LINHA);
    canvas.setLineWidth(0.5f);
    canvas.moveTo(margemEsq, cabecalhoY - 4f);
    canvas.lineTo(margemEsq + larguraPagina, cabecalhoY - 4f);
    canvas.stroke();
    canvas.restoreState();
  }

  private void adicionarRodapeComPaginacao(
      PdfContentByte canvas,
      PdfWriter writer,
      float margemEsq,
      float rodapeY,
      float larguraPagina
  ) {
    float linhaY = rodapeY + 12f;
    canvas.saveState();
    canvas.setColorStroke(COR_LINHA);
    canvas.setLineWidth(0.5f);
    canvas.moveTo(margemEsq, linhaY);
    canvas.lineTo(margemEsq + larguraPagina, linhaY);
    canvas.stroke();
    canvas.restoreState();

    String dataHoraGeracao = ZonedDateTime.now(ZONE_SAO_PAULO).format(FORMATTER_RODAPE);
    ColumnText.showTextAligned(
        canvas, Element.ALIGN_LEFT,
        new Phrase("Gerado em: " + dataHoraGeracao, FONTE_RODAPE),
        margemEsq, rodapeY, 0
    );

    String textoCentro = formatarTextoCentroRodape();
    ColumnText.showTextAligned(
        canvas, Element.ALIGN_CENTER,
        new Phrase(textoCentro, FONTE_RODAPE),
        margemEsq + (larguraPagina / 2f), rodapeY, 0
    );

    Phrase fraseNumero = new Phrase("Página " + writer.getPageNumber() + " de ", FONTE_RODAPE);
    float pontoDireita = margemEsq + larguraPagina;
    float inicioTextoX = pontoDireita - 72f;

    ColumnText.showTextAligned(
        canvas, Element.ALIGN_LEFT,
        fraseNumero, inicioTextoX, rodapeY, 0
    );

    canvas.addTemplate(templateTotalPaginas, inicioTextoX + 54f, rodapeY);
  }

  private String formatarTextoCentroRodape() {
    String empresa = truncarTexto(razaoSocialEmpresa, 38);
    if (!empresa.isBlank() && !codigoVenda.isBlank()) {
      return empresa + " — #" + codigoVenda;
    }
    if (!empresa.isBlank()) {
      return empresa;
    }
    if (!codigoVenda.isBlank()) {
      return "Venda Avulsa #" + codigoVenda;
    }
    return "Orçamento de Venda Avulsa";
  }

  private String truncarTexto(String texto, int limiteMaximo) {
    if (texto == null || texto.length() <= limiteMaximo) {
      return texto != null ? texto : "";
    }
    return texto.substring(0, limiteMaximo - 3) + "...";
  }
}

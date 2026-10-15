package br.edu.ifpb.alumigest.orders.service.pdf;

import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Renderizador de apresentação responsável por transformar um snapshot {@link ThermalLabelData}
 * em componentes visuais de tabela OpenPDF formatados para impressão térmica (100mm x 60mm).
 * US-17.1 — Camada de apresentação especializada em layout térmico industrial (#448).
 */
@Component
public class ThermalLabelPdfRenderer {

    private static final Logger log = LoggerFactory.getLogger(ThermalLabelPdfRenderer.class);

    private static final DateTimeFormatter FORMATTER_DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Font FONTE_EMPRESA =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.0f, new Color(71, 85, 105));
    private static final Font FONTE_CLIENTE =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(15, 23, 42));
    private static final Font FONTE_CODIGO_OS =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.0f, new Color(15, 23, 42));
    private static final Font FONTE_BADGE =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.5f, Color.WHITE);

    private static final Font FONTE_DESCRICAO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(15, 23, 42));
    private static final Font FONTE_GRUPO_LINHA =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.0f, new Color(30, 41, 59));

    private static final Font FONTE_MEDIDAS_TITULO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 5.0f, new Color(71, 85, 105));
    private static final Font FONTE_MEDIDAS_VALOR =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12.0f, new Color(2, 6, 23));

    private static final Font FONTE_SPEC_ROTULO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 5.5f, new Color(100, 116, 139));
    private static final Font FONTE_SPEC_VALOR =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.5f, new Color(15, 23, 42));

    private static final Font FONTE_RODAPE_ROTULO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 5.5f, new Color(100, 116, 139));
    private static final Font FONTE_RODAPE_VALOR =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.0f, new Color(15, 23, 42));

    private static final Color COR_BORDA_CARD = new Color(15, 23, 42);
    private static final Color COR_DIVISORIA = new Color(226, 232, 240);
    private static final Color COR_FUNDO_MEDIDAS = new Color(241, 245, 249);
    private static final Color COR_FUNDO_BADGE = new Color(15, 23, 42);
    private static final Color COR_FUNDO_PILL = new Color(241, 245, 249);

    /**
     * Renderiza o card completo da etiqueta térmica a partir do snapshot de dados.
     *
     * @param data          dados da etiqueta
     * @param larguraUtilPt largura disponível na página
     * @return tabela OpenPDF configurada para não quebrar entre páginas
     */
    public PdfPTable renderLabelCard(ThermalLabelData data, float larguraUtilPt) {
        PdfPTable card = new PdfPTable(1);
        card.setTotalWidth(larguraUtilPt);
        card.setLockedWidth(true);
        card.setKeepTogether(true);

        // 1. Linha do Cabeçalho
        PdfPCell c1 = criarLinhaCard(Rectangle.TOP | Rectangle.LEFT | Rectangle.RIGHT);
        c1.setPaddingTop(2.0f);
        c1.setPaddingBottom(1.0f);
        c1.addElement(construirCabecalho(data));
        card.addCell(c1);

        // 2. Linha de Descrição e Linha
        PdfPCell c2 = criarLinhaCard(Rectangle.LEFT | Rectangle.RIGHT);
        c2.setPaddingTop(0.5f);
        c2.setPaddingBottom(1.0f);
        c2.addElement(construirLinhaDescricao(data));
        card.addCell(c2);

        // 3. Linha das Medidas Nominais
        PdfPCell c3 = criarLinhaCard(Rectangle.LEFT | Rectangle.RIGHT);
        c3.setPaddingTop(0.5f);
        c3.setPaddingBottom(1.0f);
        c3.addElement(construirBlocoMedidas(data));
        card.addCell(c3);

        // 4. Linha de Especificações Técnicas (Cor e Vidro)
        PdfPCell c4 = criarLinhaCard(Rectangle.LEFT | Rectangle.RIGHT);
        c4.setPaddingTop(0.5f);
        c4.setPaddingBottom(0.5f);
        c4.addElement(construirBlocoEspecificacoes(data));
        card.addCell(c4);

        // 5. Linha de Localização / Ambiente
        PdfPCell c5 = criarLinhaCard(Rectangle.LEFT | Rectangle.RIGHT);
        c5.setPaddingTop(0.5f);
        c5.setPaddingBottom(1.0f);
        c5.addElement(construirBlocoLocalAmbiente(data));
        card.addCell(c5);

        // 6. Linha do Rodapé Limpo
        PdfPCell c6 = criarLinhaCard(Rectangle.BOTTOM | Rectangle.LEFT | Rectangle.RIGHT);
        c6.setPaddingTop(0.5f);
        c6.setPaddingBottom(2.0f);
        c6.addElement(construirRodape(data));
        card.addCell(c6);

        return card;
    }

    private PdfPCell criarLinhaCard(int bordas) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(bordas);
        cell.setBorderWidth(1.0f);
        cell.setBorderColor(COR_BORDA_CARD);
        cell.setPaddingLeft(4.5f);
        cell.setPaddingRight(4.5f);
        return cell;
    }

    private PdfPTable construirCabecalho(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        try {
            table.setWidths(new float[]{62f, 38f});
        } catch (DocumentException e) {
            log.warn("Erro ao definir larguras do cabeçalho da etiqueta", e);
        }

        // Coluna Esquerda: Razão Social e Nome do Cliente
        PdfPCell cellEsq = new PdfPCell();
        cellEsq.setBorder(Rectangle.NO_BORDER);
        cellEsq.setPadding(0);
        cellEsq.addElement(new Phrase(data.companyName(), FONTE_EMPRESA));
        cellEsq.addElement(new Phrase("CLIENTE: " + data.customerName(), FONTE_CLIENTE));
        table.addCell(cellEsq);

        // Coluna Direita: Código da OS e Badge da Peça Física
        PdfPCell cellDir = new PdfPCell();
        cellDir.setBorder(Rectangle.NO_BORDER);
        cellDir.setPadding(0);
        cellDir.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph pCodigo = new Paragraph(data.orderCode(), FONTE_CODIGO_OS);
        pCodigo.setLeading(8.0f);
        pCodigo.setAlignment(Element.ALIGN_RIGHT);
        cellDir.addElement(pCodigo);

        String badgeTexto = String.format(Locale.ROOT, "Item %02d | Peça %02d/%02d",
                data.itemIndex(), data.pieceNumber(), data.totalPieces());
        PdfPTable badgeTable = new PdfPTable(1);
        badgeTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        badgeTable.setWidthPercentage(95);

        PdfPCell badgeCell = new PdfPCell(new Phrase(badgeTexto, FONTE_BADGE));
        badgeCell.setBackgroundColor(COR_FUNDO_BADGE);
        badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        badgeCell.setPaddingTop(1.0f);
        badgeCell.setPaddingBottom(1.5f);
        badgeCell.setBorder(Rectangle.NO_BORDER);
        badgeTable.addCell(badgeCell);

        cellDir.addElement(badgeTable);
        table.addCell(cellDir);

        return table;
    }

    private PdfPTable construirLinhaDescricao(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        try {
            table.setWidths(new float[]{76f, 24f});
        } catch (DocumentException e) {
            log.warn("Erro ao definir larguras da descrição da esquadria", e);
        }

        PdfPCell cellDesc = new PdfPCell();
        cellDesc.setBorder(Rectangle.NO_BORDER);
        cellDesc.setPadding(0);
        cellDesc.addElement(new Phrase(data.description(), FONTE_DESCRICAO));
        table.addCell(cellDesc);

        PdfPCell cellLinha = new PdfPCell();
        cellLinha.setBorder(Rectangle.NO_BORDER);
        cellLinha.setPadding(0);
        cellLinha.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPTable pillTable = new PdfPTable(1);
        pillTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        pillTable.setWidthPercentage(100);

        PdfPCell pillCell = new PdfPCell(new Phrase(data.lineOrGroup(), FONTE_GRUPO_LINHA));
        pillCell.setBackgroundColor(COR_FUNDO_PILL);
        pillCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        pillCell.setPaddingTop(1.0f);
        pillCell.setPaddingBottom(1.0f);
        pillCell.setBorder(Rectangle.BOX);
        pillCell.setBorderWidth(0.5f);
        pillCell.setBorderColor(COR_DIVISORIA);
        pillTable.addCell(pillCell);

        cellLinha.addElement(pillTable);
        table.addCell(cellLinha);

        return table;
    }

    private PdfPTable construirBlocoMedidas(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COR_FUNDO_MEDIDAS);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderWidth(0.7f);
        cell.setBorderColor(COR_BORDA_CARD);
        cell.setPaddingTop(1.0f);
        cell.setPaddingBottom(1.5f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph titulo = new Paragraph("MEDIDAS NOMINAIS (L x A)", FONTE_MEDIDAS_TITULO);
        titulo.setLeading(5.5f);
        titulo.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(titulo);

        String medidasTexto = String.format(Locale.ROOT, "%d x %d mm",
                data.widthMm(), data.heightMm());
        Paragraph valor = new Paragraph(medidasTexto, FONTE_MEDIDAS_VALOR);
        valor.setLeading(12.0f);
        valor.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(valor);

        table.addCell(cell);
        return table;
    }

    private PdfPTable construirBlocoEspecificacoes(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        try {
            table.setWidths(new float[]{50f, 50f});
        } catch (DocumentException e) {
            log.warn("Erro ao definir larguras de especificações", e);
        }

        PdfPCell cellCor = new PdfPCell();
        cellCor.setBorder(Rectangle.NO_BORDER);
        cellCor.setPadding(0);
        Phrase phraseCor = new Phrase();
        phraseCor.add(new Phrase("COR: ", FONTE_SPEC_ROTULO));
        phraseCor.add(new Phrase(data.aluminumColor(), FONTE_SPEC_VALOR));
        cellCor.addElement(phraseCor);
        table.addCell(cellCor);

        PdfPCell cellVidro = new PdfPCell();
        cellVidro.setBorder(Rectangle.NO_BORDER);
        cellVidro.setPadding(0);
        Phrase phraseVidro = new Phrase();
        phraseVidro.add(new Phrase("VIDRO: ", FONTE_SPEC_ROTULO));
        phraseVidro.add(new Phrase(data.glassType(), FONTE_SPEC_VALOR));
        cellVidro.addElement(phraseVidro);
        table.addCell(cellVidro);

        return table;
    }

    private PdfPTable construirBlocoLocalAmbiente(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0);

        Phrase phrase = new Phrase();
        phrase.add(new Phrase("LOCAL / OBS: ", FONTE_SPEC_ROTULO));
        phrase.add(new Phrase(data.environmentOrLocation(), FONTE_SPEC_VALOR));
        cell.addElement(phrase);

        table.addCell(cell);
        return table;
    }

    private PdfPTable construirRodape(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        try {
            table.setWidths(new float[]{36f, 34f, 30f});
        } catch (DocumentException e) {
            log.warn("Erro ao definir larguras do rodapé da etiqueta", e);
        }

        // Coluna 1: Código do Item
        PdfPCell cellItem = new PdfPCell();
        cellItem.setBorder(Rectangle.TOP);
        cellItem.setBorderWidth(0.8f);
        cellItem.setBorderColor(COR_BORDA_CARD);
        cellItem.setPaddingTop(1.5f);
        cellItem.setPaddingBottom(0);

        Phrase phraseItem = new Phrase();
        phraseItem.add(new Phrase("CÓD: ", FONTE_RODAPE_ROTULO));
        phraseItem.add(new Phrase(data.itemCode(), FONTE_RODAPE_VALOR));
        cellItem.addElement(phraseItem);
        table.addCell(cellItem);

        // Coluna 2: Data de Emissão
        PdfPCell cellData = new PdfPCell();
        cellData.setBorder(Rectangle.TOP);
        cellData.setBorderWidth(0.8f);
        cellData.setBorderColor(COR_BORDA_CARD);
        cellData.setPaddingTop(1.5f);
        cellData.setPaddingBottom(0);

        Phrase phraseData = new Phrase();
        phraseData.add(new Phrase("DATA: ", FONTE_RODAPE_ROTULO));
        phraseData.add(new Phrase(data.issueDate().format(FORMATTER_DATA), FONTE_RODAPE_VALOR));
        cellData.addElement(phraseData);
        table.addCell(cellData);

        // Coluna 3: Carimbo do Sistema
        PdfPCell cellMarca = new PdfPCell();
        cellMarca.setBorder(Rectangle.TOP);
        cellMarca.setBorderWidth(0.8f);
        cellMarca.setBorderColor(COR_BORDA_CARD);
        cellMarca.setPaddingTop(1.5f);
        cellMarca.setPaddingBottom(0);
        cellMarca.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph paragrafoMarca = new Paragraph("ALUMIGEST ERP", FONTE_RODAPE_ROTULO);
        paragrafoMarca.setLeading(6.5f);
        paragrafoMarca.setAlignment(Element.ALIGN_RIGHT);
        cellMarca.addElement(paragrafoMarca);
        table.addCell(cellMarca);

        return table;
    }
}

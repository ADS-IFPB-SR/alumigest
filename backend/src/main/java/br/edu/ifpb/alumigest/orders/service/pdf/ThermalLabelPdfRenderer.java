package br.edu.ifpb.alumigest.orders.service.pdf;

import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPCellEvent;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPTableEvent;
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
        card.setTableEvent(new BordaArredondadaCardEvent(6.0f, COR_BORDA_CARD, 1.0f));

        // 1. Linha do Cabeçalho com borda inferior
        PdfPCell c1 = criarLinhaCard(Rectangle.BOTTOM, 1.5f);
        c1.setPaddingTop(2.5f);
        c1.setPaddingBottom(1.5f);
        c1.addElement(construirCabecalho(data));
        card.addCell(c1);

        // 2. Linha de Descrição
        PdfPCell c2 = criarLinhaCard(Rectangle.NO_BORDER, 0f);
        c2.setPaddingTop(1.0f);
        c2.setPaddingBottom(1.0f);
        c2.addElement(construirLinhaDescricao(data));
        card.addCell(c2);

        // 3. Linha das Medidas Nominais
        PdfPCell c3 = criarLinhaCard(Rectangle.NO_BORDER, 0f);
        c3.setPaddingTop(1.0f);
        c3.setPaddingBottom(1.0f);
        c3.addElement(construirBlocoMedidas(data));
        card.addCell(c3);

        // 4. Linha de Especificações Técnicas (Cor e Vidro)
        PdfPCell c4 = criarLinhaCard(Rectangle.NO_BORDER, 0f);
        c4.setPaddingTop(0.5f);
        c4.setPaddingBottom(0.5f);
        c4.addElement(construirBlocoEspecificacoes(data));
        card.addCell(c4);

        // 5. Linha de Localização / Ambiente
        PdfPCell c5 = criarLinhaCard(Rectangle.NO_BORDER, 0f);
        c5.setPaddingTop(0.5f);
        c5.setPaddingBottom(1.0f);
        c5.addElement(construirBlocoLocalAmbiente(data));
        card.addCell(c5);

        // 6. Linha do Rodapé Limpo com borda superior
        PdfPCell c6 = criarLinhaCard(Rectangle.TOP, 1.2f);
        c6.setPaddingTop(1.0f);
        c6.setPaddingBottom(2.5f);
        c6.addElement(construirRodape(data));
        card.addCell(c6);

        return card;
    }

    private PdfPCell criarLinhaCard(int bordas, float borderWidth) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(bordas);
        cell.setBorderWidth(borderWidth);
        cell.setBorderColor(COR_BORDA_CARD);
        cell.setPaddingLeft(5.0f);
        cell.setPaddingRight(5.0f);
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
        badgeCell.setBorder(Rectangle.NO_BORDER);
        badgeCell.setCellEvent(new BordaArredondadaBoxEvent(3.0f, null, 0f, COR_FUNDO_BADGE));
        badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        badgeCell.setPaddingTop(1.0f);
        badgeCell.setPaddingBottom(1.5f);
        badgeTable.addCell(badgeCell);

        cellDir.addElement(badgeTable);
        table.addCell(cellDir);

        return table;
    }

    private PdfPTable construirLinhaDescricao(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cellDesc = new PdfPCell();
        cellDesc.setBorder(Rectangle.NO_BORDER);
        cellDesc.setPadding(0);
        cellDesc.addElement(new Phrase(data.description(), FONTE_DESCRICAO));
        table.addCell(cellDesc);

        return table;
    }

    private PdfPTable construirBlocoMedidas(ThermalLabelData data) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setCellEvent(new BordaArredondadaBoxEvent(3.5f, COR_BORDA_CARD, 0.7f, COR_FUNDO_MEDIDAS));
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
        phraseCor.add(new Phrase("COR / ACABAMENTO: ", FONTE_SPEC_ROTULO));
        phraseCor.add(new Phrase(data.aluminumColor(), FONTE_SPEC_VALOR));
        cellCor.addElement(phraseCor);
        table.addCell(cellCor);

        PdfPCell cellVidro = new PdfPCell();
        cellVidro.setBorder(Rectangle.NO_BORDER);
        cellVidro.setPadding(0);
        Phrase phraseVidro = new Phrase();
        phraseVidro.add(new Phrase("VIDRO ESPECIFICADO: ", FONTE_SPEC_ROTULO));
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
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cellData = new PdfPCell();
        cellData.setBorder(Rectangle.NO_BORDER);
        cellData.setPaddingTop(0.5f);
        cellData.setPaddingBottom(0);

        Phrase phraseData = new Phrase();
        phraseData.add(new Phrase("DATA: ", FONTE_RODAPE_ROTULO));
        phraseData.add(new Phrase(data.issueDate().format(FORMATTER_DATA), FONTE_RODAPE_VALOR));
        cellData.addElement(phraseData);
        table.addCell(cellData);

        return table;
    }

    /**
     * Evento de renderização de borda externa arredondada para o card completo da etiqueta térmica.
     */
    private static class BordaArredondadaCardEvent implements PdfPTableEvent {
        private final float radius;
        private final Color borderColor;
        private final float borderWidth;

        BordaArredondadaCardEvent(float radius, Color borderColor, float borderWidth) {
            this.radius = radius;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
        }

        @Override
        public void tableLayout(PdfPTable table, float[][] widths, float[] heights,
                                int headerRows, int rowStart, PdfContentByte[] canvases) {
            float[] width = widths[0];
            float x = width[0];
            float w = width[width.length - 1] - x;
            float y = heights[heights.length - 1];
            float h = heights[0] - y;

            PdfContentByte cb = canvases[PdfPTable.LINECANVAS];
            cb.saveState();
            cb.setColorStroke(borderColor);
            cb.setLineWidth(borderWidth);
            cb.roundRectangle(x, y, w, h, radius);
            cb.stroke();
            cb.restoreState();
        }
    }

    /**
     * Evento de renderização de box interno com cantos arredondados (ex: Medidas e Badges).
     */
    private static class BordaArredondadaBoxEvent implements PdfPCellEvent {
        private final float radius;
        private final Color borderColor;
        private final float borderWidth;
        private final Color backgroundColor;

        BordaArredondadaBoxEvent(float radius, Color borderColor,
                                 float borderWidth, Color backgroundColor) {
            this.radius = radius;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
            this.backgroundColor = backgroundColor;
        }

        @Override
        public void cellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            PdfContentByte cb = canvases[PdfPTable.BACKGROUNDCANVAS];
            cb.saveState();
            if (backgroundColor != null) {
                cb.setColorFill(backgroundColor);
                cb.roundRectangle(position.getLeft(), position.getBottom(),
                        position.getWidth(), position.getHeight(), radius);
                cb.fill();
            }
            if (borderColor != null && borderWidth > 0) {
                cb.setColorStroke(borderColor);
                cb.setLineWidth(borderWidth);
                cb.roundRectangle(position.getLeft(), position.getBottom(),
                        position.getWidth(), position.getHeight(), radius);
                cb.stroke();
            }
            cb.restoreState();
        }
    }
}

package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.dto.production.AccessoryDto;
import br.edu.ifpb.alumigest.orders.dto.production.AluminumCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.GlassCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.service.pdf.OrderPdfPageEvent;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ProductionSheetPdfService {

    private static final Logger log = LoggerFactory.getLogger(ProductionSheetPdfService.class);

    // Reutilizando o Design System do OrderPdfService
    private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font FONTE_TITULO_CARD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(105, 110, 120));
    private static final Font FONTE_CABECALHO_TABELA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FONTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONTE_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

    private static final Color COR_CABECALHO_TABELA = new Color(20, 30, 50);
    private static final Color COR_FUNDO_CLARO = new Color(247, 249, 252);
    private static final Color COR_BORDA_CLARA = new Color(225, 230, 235);

    private final CompanyProperties companyProps;

    public ProductionSheetPdfService(CompanyProperties companyProps) {
        this.companyProps = companyProps;
    }

    public byte[] generatePdf(ProductionSheetResponse data) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Margens idênticas ao OrderPdfService
            try (Document document = new Document(PageSize.A4, 36, 36, 54, 54)) {
                PdfWriter writer = PdfWriter.getInstance(document, outputStream);

                // Reaproveitando o evento de página para cabeçalho e rodapé padronizados
                OrderPdfPageEvent pageEvent = new OrderPdfPageEvent(
                        data.orderCode(), data.clientName(), companyProps.getRazaoSocial());
                writer.setPageEvent(pageEvent);
                document.open();

                Paragraph titulo = new Paragraph("FICHA TÉCNICA DE PRODUÇÃO", FONTE_TITULO);
                titulo.setAlignment(Element.ALIGN_CENTER);
                titulo.setSpacingAfter(15f);
                document.add(titulo);

                // Card de Informações da O.S. e Cliente
                PdfPTable infoTable = new PdfPTable(2);
                infoTable.setWidthPercentage(100);
                infoTable.setSpacingAfter(15f);

                PdfPCell celulaOS = new PdfPCell(new Phrase("Ordem de Serviço: " + (data.orderCode() != null ? data.orderCode() : "N/A"), FONTE_NEGRITO));
                celulaOS.setBackgroundColor(COR_FUNDO_CLARO);
                celulaOS.setBorderColor(COR_BORDA_CLARA);
                celulaOS.setPadding(8f);

                PdfPCell celulaCliente = new PdfPCell(new Phrase("Cliente: " + (data.clientName() != null ? data.clientName() : "Consumidor"), FONTE_NEGRITO));
                celulaCliente.setBackgroundColor(COR_FUNDO_CLARO);
                celulaCliente.setBorderColor(COR_BORDA_CLARA);
                celulaCliente.setPadding(8f);

                infoTable.addCell(celulaOS);
                infoTable.addCell(celulaCliente);
                document.add(infoTable);

                boolean hasAluminum = data.aluminumCuts() != null && !data.aluminumCuts().isEmpty();
                boolean hasGlass = data.glassCuts() != null && !data.glassCuts().isEmpty();
                boolean hasAccessories = data.accessories() != null && !data.accessories().isEmpty();

                if (!hasAluminum && !hasGlass && !hasAccessories) {
                    Paragraph aviso = new Paragraph(
                            "Nenhum plano de corte paramétrico cadastrado para as tipologias desta O.S.",
                            FONTE_NORMAL
                    );
                    aviso.setAlignment(Element.ALIGN_CENTER);
                    aviso.setSpacingBefore(30f);
                    document.add(aviso);
                } else {
                    if (hasAluminum) {
                        adicionarTabelaAluminio(document, data.aluminumCuts());
                        document.add(espacamento(15f));
                    }

                    if (hasGlass) {
                        adicionarTabelaVidro(document, data.glassCuts());
                        document.add(espacamento(15f));
                    }

                    if (hasAccessories) {
                        adicionarTabelaAcessorios(document, data.accessories());
                    }
                }
            }
            return outputStream.toByteArray();
        } catch (DocumentException | IOException e) {
            log.error("Erro ao gerar PDF da Ficha Técnica: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao gerar PDF da Ficha Técnica.", e);
        }
    }

    private void adicionarTabelaAluminio(Document document, List<AluminumCutDto> cuts) throws DocumentException {
        Paragraph tituloSecao = new Paragraph("CORTE DE ALUMÍNIO", FONTE_TITULO_CARD);
        tituloSecao.setSpacingAfter(8f);
        document.add(tituloSecao);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 3.5f, 1.5f, 1.5f, 1f});

        String[] cabecalhos = {"CÓDIGO", "DESCRIÇÃO", "TAMANHO", "ÂNGULO", "QTD"};
        adicionarCabecalhoTabela(table, cabecalhos);

        for (int i = 0; i < cuts.size(); i++) {
            AluminumCutDto cut = cuts.get(i);
            Color bgColor = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

            adicionarCelula(table, cut.profileCode(), FONTE_NEGRITO, bgColor, Element.ALIGN_LEFT);
            adicionarCelula(table, cut.description(), FONTE_NORMAL, bgColor, Element.ALIGN_LEFT);
            adicionarCelula(table, cut.lengthMm() + " mm", FONTE_NORMAL, bgColor, Element.ALIGN_RIGHT);
            adicionarCelula(table, cut.cutAngle(), FONTE_NORMAL, bgColor, Element.ALIGN_CENTER);
            adicionarCelula(table, String.valueOf(cut.quantity()), FONTE_NORMAL, bgColor, Element.ALIGN_CENTER);
        }
        document.add(table);
    }

    private void adicionarTabelaVidro(Document document, List<GlassCutDto> glasses) throws DocumentException {
        Paragraph tituloSecao = new Paragraph("CORTE DE VIDROS", FONTE_TITULO_CARD);
        tituloSecao.setSpacingAfter(8f);
        document.add(tituloSecao);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 2f, 2f, 1f});

        String[] cabecalhos = {"TIPO / ESPECIFICAÇÃO", "LARGURA", "ALTURA", "QTD"};
        adicionarCabecalhoTabela(table, cabecalhos);

        for (int i = 0; i < glasses.size(); i++) {
            GlassCutDto glass = glasses.get(i);
            Color bgColor = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

            adicionarCelula(table, glass.glassType(), FONTE_NEGRITO, bgColor, Element.ALIGN_LEFT);
            adicionarCelula(table, glass.widthMm() + " mm", FONTE_NORMAL, bgColor, Element.ALIGN_RIGHT);
            adicionarCelula(table, glass.heightMm() + " mm", FONTE_NORMAL, bgColor, Element.ALIGN_RIGHT);
            adicionarCelula(table, String.valueOf(glass.quantity()), FONTE_NORMAL, bgColor, Element.ALIGN_CENTER);
        }
        document.add(table);
    }

    private void adicionarTabelaAcessorios(Document document, List<AccessoryDto> accessories) throws DocumentException {
        Paragraph tituloSecao = new Paragraph("COMPONENTES E ACESSÓRIOS", FONTE_TITULO_CARD);
        tituloSecao.setSpacingAfter(8f);
        document.add(tituloSecao);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 5.5f, 1f, 1f});

        String[] cabecalhos = {"CÓDIGO", "DESCRIÇÃO", "QTD", "UN"};
        adicionarCabecalhoTabela(table, cabecalhos);

        for (int i = 0; i < accessories.size(); i++) {
            AccessoryDto acc = accessories.get(i);
            Color bgColor = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

            adicionarCelula(table, acc.code(), FONTE_NEGRITO, bgColor, Element.ALIGN_LEFT);
            adicionarCelula(table, acc.description(), FONTE_NORMAL, bgColor, Element.ALIGN_LEFT);
            adicionarCelula(table, String.valueOf(acc.quantity()), FONTE_NORMAL, bgColor, Element.ALIGN_CENTER);
            adicionarCelula(table, acc.unit(), FONTE_NORMAL, bgColor, Element.ALIGN_CENTER);
        }
        document.add(table);
    }

    private void adicionarCabecalhoTabela(PdfPTable table, String[] cabecalhos) {
        for (String cab : cabecalhos) {
            PdfPCell header = new PdfPCell(new Phrase(cab, FONTE_CABECALHO_TABELA));
            header.setBackgroundColor(COR_CABECALHO_TABELA);
            header.setBorder(Rectangle.NO_BORDER);
            header.setPadding(7f);
            table.addCell(header);
        }
    }

    private void adicionarCelula(PdfPTable table, String texto, Font fonte, Color bgColor, int alinhamento) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "", fonte));
        cell.setBackgroundColor(bgColor);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(COR_BORDA_CLARA);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(alinhamento);
        table.addCell(cell);
    }

    private Paragraph espacamento(float size) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(size);
        return p;
    }
}
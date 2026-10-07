package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URL;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Serviço responsável pela geração do comprovante oficial de Pedido de Venda em PDF (A4).
 * Reutiliza a mesma tecnologia OpenPDF e padrões visuais do {@link BudgetPdfService}.
 * US-16.1 — Comprovante de Pedido de Venda em PDF (#364).
 */
@Service
public class OrderPdfService {

    private static final Logger log = LoggerFactory.getLogger(OrderPdfService.class);

    private static final Locale PT_BR = Locale.of("pt", "BR");
    private static final DateTimeFormatter FORMATTER_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font FONTE_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font FONTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONTE_PEQUENA = FontFactory.getFont(FontFactory.HELVETICA, 8);
    private static final Font FONTE_DADOS_EMPRESA = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
    private static final Font FONTE_LABEL_CARD = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
    private static final Font FONTE_TITULO_CARD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(105, 110, 120));
    private static final Font FONTE_CABECALHO_TABELA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FONTE_TOTAL_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
    private static final Font FONTE_TOTAL_VALOR = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.WHITE);
    private static final Font FONTE_RODAPE = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(130, 135, 145));

    private static final Color COR_CABECALHO_TABELA = new Color(20, 30, 50);
    private static final Color COR_FUNDO_CLARO = new Color(247, 249, 252);
    private static final Color COR_BORDA_CLARA = new Color(225, 230, 235);
    private static final Color COR_TOTAL_BG = new Color(15, 25, 45);

    private static final String NAO_INFORMADO = "Não informado";

    private final CompanyProperties companyProps;

    public OrderPdfService(CompanyProperties companyProps) {
        this.companyProps = companyProps;
    }

    /**
     * Gera o comprovante oficial de Pedido de Venda em PDF A4.
     * Utiliza exclusivamente os valores congelados no pedido (lock de preços).
     *
     * @param order entidade do pedido com itens carregados
     * @return array de bytes contendo o arquivo PDF válido
     */
    public byte[] gerarComprovante(Order order) {
        Objects.requireNonNull(order, "O pedido não pode ser nulo para geração do comprovante PDF.");

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            try (Document document = new Document(PageSize.A4, 36, 36, 54, 54)) {
                PdfWriter.getInstance(document, outputStream);
                document.open();

                adicionarCabecalho(document, order);
                document.add(espacamento(8f));

                adicionarDadosPedido(document, order);
                document.add(espacamento(6f));

                adicionarDadosCliente(document, order);
                document.add(espacamento(10f));

                adicionarTabelaItens(document, order);
                document.add(espacamento(10f));

                adicionarResumoFinanceiro(document, order);

                if (temCondicoesComerciais(order)) {
                    document.add(espacamento(10f));
                    adicionarCondicoesComerciais(document, order);
                }

                document.add(espacamento(20f));
                adicionarRodape(document, order);
            }
            return outputStream.toByteArray();

        } catch (DocumentException | IOException e) {
            log.error("Erro ao gerar comprovante PDF para o pedido {}: {}", order.getCodigo(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar comprovante PDF do pedido: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // Seção: Cabeçalho institucional
    // =========================================================================

    private void adicionarCabecalho(Document document, Order order) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Célula logo/empresa (esquerda)
        PdfPCell cellLogo = new PdfPCell();
        cellLogo.setBorder(Rectangle.NO_BORDER);
        cellLogo.setVerticalAlignment(Element.ALIGN_MIDDLE);

        URL logoUrl = getClass().getResource("/static/logo-alumiportas.png");
        if (logoUrl != null) {
            try {
                Image logo = Image.getInstance(logoUrl);
                logo.scaleToFit(120, 50);
                cellLogo.addElement(logo);
            } catch (Exception e) {
                log.warn("Falha ao carregar logo ({}), utilizando razão social como fallback", e.getMessage());
                cellLogo.addElement(new Paragraph(companyProps.getRazaoSocial(), FONTE_TITULO));
            }
        } else {
            cellLogo.addElement(new Paragraph(companyProps.getRazaoSocial(), FONTE_TITULO));
        }
        table.addCell(cellLogo);

        // Célula título do documento (direita)
        PdfPCell cellTitulo = new PdfPCell();
        cellTitulo.setBorder(Rectangle.NO_BORDER);
        cellTitulo.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellTitulo.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Paragraph docLabel = new Paragraph("COMPROVANTE DE PEDIDO DE VENDA", FONTE_PEQUENA);
        docLabel.setAlignment(Element.ALIGN_RIGHT);
        cellTitulo.addElement(docLabel);

        Paragraph codigoPedido = new Paragraph("#" + obterDadoSeguro(order.getCodigo()), FONTE_TITULO);
        codigoPedido.setAlignment(Element.ALIGN_RIGHT);
        cellTitulo.addElement(codigoPedido);
        table.addCell(cellTitulo);

        // Linha 2: dados da empresa (esquerda) | metadados do pedido (direita)
        float respiroSuperior = 8f;

        PdfPCell cellDadosEmpresa = new PdfPCell();
        cellDadosEmpresa.setBorder(Rectangle.NO_BORDER);
        cellDadosEmpresa.setPaddingTop(respiroSuperior);

        String cnpjIe = "CNPJ: " + companyProps.getCnpj();
        if (companyProps.getInscricaoEstadual() != null && !companyProps.getInscricaoEstadual().isBlank()) {
            cnpjIe += " - IE: " + companyProps.getInscricaoEstadual();
        }
        cellDadosEmpresa.addElement(new Phrase(cnpjIe + "\n", FONTE_DADOS_EMPRESA));
        cellDadosEmpresa.addElement(new Phrase(companyProps.getEndereco() + "\n", FONTE_DADOS_EMPRESA));
        cellDadosEmpresa.addElement(new Phrase(companyProps.getCidadeUf() + "\n", FONTE_DADOS_EMPRESA));
        cellDadosEmpresa.addElement(new Phrase("Fone: " + companyProps.getTelefone() + "\n", FONTE_DADOS_EMPRESA));
        table.addCell(cellDadosEmpresa);

        PdfPCell cellMetadados = new PdfPCell();
        cellMetadados.setBorder(Rectangle.NO_BORDER);
        cellMetadados.setPaddingTop(respiroSuperior);
        cellMetadados.setHorizontalAlignment(Element.ALIGN_RIGHT);

        String dataAprovacao = formatarData(order.getDataAprovacao());
        Paragraph emissao = new Paragraph("Data de Conversão: " + dataAprovacao, FONTE_NORMAL);
        emissao.setAlignment(Element.ALIGN_RIGHT);
        cellMetadados.addElement(emissao);

        String dataEntrega = formatarData(order.getDataPrevisaoEntrega());
        Paragraph entrega = new Paragraph("Previsão de Entrega: " + dataEntrega, FONTE_NORMAL);
        entrega.setAlignment(Element.ALIGN_RIGHT);
        cellMetadados.addElement(entrega);
        table.addCell(cellMetadados);

        document.add(table);

        Paragraph divisoria = new Paragraph();
        divisoria.setSpacingBefore(12f);
        divisoria.setSpacingAfter(15f);
        divisoria.add(new Chunk(new LineSeparator(0.8f, 100f, Color.GRAY, Element.ALIGN_CENTER, 0f)));
        document.add(divisoria);
    }

    // =========================================================================
    // Seção: Dados do Pedido
    // =========================================================================

    private void adicionarDadosPedido(Document document, Order order) throws DocumentException {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell cardCell = criarCelulaCarta();

        Paragraph titulo = new Paragraph("DADOS DO PEDIDO", FONTE_TITULO_CARD);
        titulo.setSpacingAfter(8f);
        cardCell.addElement(titulo);

        PdfPTable innerTable = new PdfPTable(3);
        innerTable.setWidthPercentage(100);
        innerTable.setWidths(new float[]{1.5f, 1.5f, 1.5f});

        // Código
        PdfPCell cCell = new PdfPCell();
        cCell.setBorder(Rectangle.NO_BORDER);
        cCell.addElement(new Phrase("CÓDIGO DO PEDIDO\n", FONTE_LABEL_CARD));
        cCell.addElement(new Phrase(obterDadoSeguro(order.getCodigo()), FONTE_NEGRITO));
        innerTable.addCell(cCell);

        // Status
        PdfPCell sCell = new PdfPCell();
        sCell.setBorder(Rectangle.NO_BORDER);
        sCell.addElement(new Phrase("STATUS\n", FONTE_LABEL_CARD));
        String statusLabel = order.getStatus() != null ? order.getStatus().getDescricao() : NAO_INFORMADO;
        sCell.addElement(new Phrase(statusLabel, FONTE_NEGRITO));
        innerTable.addCell(sCell);

        // Canal de aprovação
        PdfPCell canCell = new PdfPCell();
        canCell.setBorder(Rectangle.NO_BORDER);
        canCell.addElement(new Phrase("CANAL DE APROVAÇÃO\n", FONTE_LABEL_CARD));
        String canalLabel = order.getCanalAprovacao() != null ? order.getCanalAprovacao().getDescricao() : NAO_INFORMADO;
        canCell.addElement(new Phrase(canalLabel, FONTE_NEGRITO));
        innerTable.addCell(canCell);

        cardCell.addElement(innerTable);
        cardTable.addCell(cardCell);
        document.add(cardTable);
    }

    // =========================================================================
    // Seção: Dados do Cliente
    // =========================================================================

    private void adicionarDadosCliente(Document document, Order order) throws DocumentException {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell cardCell = criarCelulaCarta();

        Paragraph titulo = new Paragraph("DADOS DO CLIENTE", FONTE_TITULO_CARD);
        titulo.setSpacingAfter(10f);
        cardCell.addElement(titulo);

        PdfPTable innerTable = new PdfPTable(2);
        innerTable.setWidthPercentage(100);

        // Coluna esquerda: nome e endereço
        PdfPCell cellEsq = new PdfPCell();
        cellEsq.setBorder(Rectangle.NO_BORDER);
        cellEsq.addElement(new Phrase("NOME / RAZÃO SOCIAL\n", FONTE_LABEL_CARD));
        cellEsq.addElement(new Phrase(obterDadoSeguro(order.getClienteNome()) + "\n\n", FONTE_NEGRITO));

        if (order.getClienteEndereco() != null && !order.getClienteEndereco().isBlank()) {
            cellEsq.addElement(new Phrase("ENDEREÇO\n", FONTE_LABEL_CARD));
            cellEsq.addElement(new Phrase(order.getClienteEndereco(), FONTE_NORMAL));
        }
        innerTable.addCell(cellEsq);

        // Coluna direita: telefone
        PdfPCell cellDir = new PdfPCell();
        cellDir.setBorder(Rectangle.NO_BORDER);
        if (order.getClienteTelefone() != null && !order.getClienteTelefone().isBlank()) {
            cellDir.addElement(new Phrase("TELEFONE\n", FONTE_LABEL_CARD));
            cellDir.addElement(new Phrase(order.getClienteTelefone(), FONTE_NEGRITO));
        }
        innerTable.addCell(cellDir);

        cardCell.addElement(innerTable);
        cardTable.addCell(cardCell);
        document.add(cardTable);
    }

    // =========================================================================
    // Seção: Tabela de Itens (Preços Congelados)
    // =========================================================================

    private void adicionarTabelaItens(Document document, Order order) throws DocumentException {
        Paragraph tituloSecao = new Paragraph("ITENS DO PEDIDO", FONTE_TITULO_CARD);
        tituloSecao.setSpacingAfter(8f);
        document.add(tituloSecao);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.5f, 3.8f, 0.8f, 1.7f, 1.7f});
        table.setHeaderRows(1);
        table.setSplitLate(true);
        table.setSplitRows(false);

        // Cabeçalho da tabela
        String[] cabecalhos = {"#", "PRODUTO / DESCRIÇÃO", "QTD", "V. UNIT (R$)", "TOTAL (R$)"};
        for (String cab : cabecalhos) {
            PdfPCell header = new PdfPCell(new Phrase(cab, FONTE_CABECALHO_TABELA));
            header.setBackgroundColor(COR_CABECALHO_TABELA);
            header.setBorder(Rectangle.NO_BORDER);
            header.setPadding(7f);
            table.addCell(header);
        }

        List<OrderItem> items = order.getItems();
        if (items != null && !items.isEmpty()) {
            for (int i = 0; i < items.size(); i++) {
                OrderItem item = items.get(i);
                boolean isImpar = (i % 2 == 0);
                Color bgLinha = isImpar ? Color.WHITE : COR_FUNDO_CLARO;
                adicionarLinhaItem(table, item, i + 1, bgLinha);
            }
        } else {
            PdfPCell semItens = new PdfPCell(new Phrase("Nenhum item registrado.", FONTE_NORMAL));
            semItens.setColspan(5);
            semItens.setBorder(Rectangle.NO_BORDER);
            semItens.setPadding(10f);
            semItens.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(semItens);
        }

        document.add(table);
    }

    private void adicionarLinhaItem(PdfPTable table, OrderItem item, int numero, Color bgColor) {
        // Número
        PdfPCell numCell = new PdfPCell(new Phrase(String.valueOf(numero), FONTE_NORMAL));
        numCell.setBackgroundColor(bgColor);
        numCell.setBorder(Rectangle.BOTTOM);
        numCell.setBorderColor(COR_BORDA_CLARA);
        numCell.setPadding(6f);
        numCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(numCell);

        // Descrição com dimensões
        PdfPCell descCell = new PdfPCell();
        descCell.setBackgroundColor(bgColor);
        descCell.setBorder(Rectangle.BOTTOM);
        descCell.setBorderColor(COR_BORDA_CLARA);
        descCell.setPadding(6f);
        descCell.addElement(new Phrase(obterDadoSeguro(item.getDescricao()), FONTE_NEGRITO));
        if (item.getLarguraMm() != null && item.getAlturaMm() != null
                && item.getLarguraMm() > 0 && item.getAlturaMm() > 0) {
            descCell.addElement(new Phrase(
                    item.getLarguraMm() + " x " + item.getAlturaMm() + " mm",
                    FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120))));
        }
        table.addCell(descCell);

        // Quantidade
        PdfPCell qtdCell = new PdfPCell(new Phrase(
                String.valueOf(item.getQuantidade() != null ? item.getQuantidade() : 1), FONTE_NORMAL));
        qtdCell.setBackgroundColor(bgColor);
        qtdCell.setBorder(Rectangle.BOTTOM);
        qtdCell.setBorderColor(COR_BORDA_CLARA);
        qtdCell.setPadding(6f);
        qtdCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(qtdCell);

        // Valor unitário (congelado)
        BigDecimal valorUnit = item.getValorUnitario() != null ? item.getValorUnitario() : BigDecimal.ZERO;
        PdfPCell unitCell = new PdfPCell(new Phrase(formatarMoeda(valorUnit), FONTE_NORMAL));
        unitCell.setBackgroundColor(bgColor);
        unitCell.setBorder(Rectangle.BOTTOM);
        unitCell.setBorderColor(COR_BORDA_CLARA);
        unitCell.setPadding(6f);
        unitCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(unitCell);

        // Valor total (congelado)
        BigDecimal valorTotal = item.getValorTotal() != null ? item.getValorTotal() : BigDecimal.ZERO;
        PdfPCell totalCell = new PdfPCell(new Phrase(formatarMoeda(valorTotal), FONTE_NEGRITO));
        totalCell.setBackgroundColor(bgColor);
        totalCell.setBorder(Rectangle.BOTTOM);
        totalCell.setBorderColor(COR_BORDA_CLARA);
        totalCell.setPadding(6f);
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalCell);
    }

    // =========================================================================
    // Seção: Resumo Financeiro
    // =========================================================================

    private void adicionarResumoFinanceiro(Document document, Order order) throws DocumentException {
        PdfPTable outerTable = new PdfPTable(2);
        outerTable.setWidthPercentage(100);
        outerTable.setWidths(new float[]{1f, 1f});

        // Célula vazia à esquerda
        PdfPCell vazia = new PdfPCell();
        vazia.setBorder(Rectangle.NO_BORDER);
        outerTable.addCell(vazia);

        // Tabela de totais à direita
        PdfPTable totaisTable = new PdfPTable(2);
        totaisTable.setWidthPercentage(100);

        adicionarLinhaTotais(totaisTable, "Subtotal", formatarMoeda(orZero(order.getValorBruto())), false);

        if (order.getValorDesconto() != null && order.getValorDesconto().compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotais(totaisTable, "Desconto", "- " + formatarMoeda(order.getValorDesconto()), false);
        }

        if (order.getTaxaInstalacao() != null && order.getTaxaInstalacao().compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotais(totaisTable, "Instalação", formatarMoeda(order.getTaxaInstalacao()), false);
        }

        if (order.getTaxaFrete() != null && order.getTaxaFrete().compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotais(totaisTable, "Frete", formatarMoeda(order.getTaxaFrete()), false);
        }

        // Linha total destacada
        PdfPCell labelTotal = new PdfPCell(new Phrase("TOTAL", FONTE_TOTAL_LABEL));
        labelTotal.setBackgroundColor(COR_TOTAL_BG);
        labelTotal.setBorder(Rectangle.NO_BORDER);
        labelTotal.setPaddingLeft(10f);
        labelTotal.setPaddingTop(8f);
        labelTotal.setPaddingBottom(8f);
        totaisTable.addCell(labelTotal);

        PdfPCell valorTotal = new PdfPCell(new Phrase(formatarMoeda(orZero(order.getValorLiquido())), FONTE_TOTAL_VALOR));
        valorTotal.setBackgroundColor(COR_TOTAL_BG);
        valorTotal.setBorder(Rectangle.NO_BORDER);
        valorTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valorTotal.setPaddingRight(10f);
        valorTotal.setPaddingTop(8f);
        valorTotal.setPaddingBottom(8f);
        totaisTable.addCell(valorTotal);

        PdfPCell wrapperCell = new PdfPCell(totaisTable);
        wrapperCell.setBorder(Rectangle.NO_BORDER);
        outerTable.addCell(wrapperCell);

        document.add(outerTable);
    }

    private void adicionarLinhaTotais(PdfPTable table, String label, String valor, boolean destaque) {
        Font fontLabel = destaque ? FONTE_TOTAL_LABEL : FONTE_NORMAL;
        Font fontValor = destaque ? FONTE_TOTAL_VALOR : FONTE_NORMAL;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, fontLabel));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setBorderColor(COR_BORDA_CLARA);
        labelCell.setPadding(5f);
        labelCell.setPaddingLeft(10f);
        table.addCell(labelCell);

        PdfPCell valorCell = new PdfPCell(new Phrase(valor, fontValor));
        valorCell.setBorder(Rectangle.BOTTOM);
        valorCell.setBorderColor(COR_BORDA_CLARA);
        valorCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valorCell.setPadding(5f);
        valorCell.setPaddingRight(10f);
        table.addCell(valorCell);
    }

    // =========================================================================
    // Seção: Condições Comerciais
    // =========================================================================

    private boolean temCondicoesComerciais(Order order) {
        return (order.getCondicaoPagamento() != null && !order.getCondicaoPagamento().isBlank())
                || (order.getObservacoesPagamento() != null && !order.getObservacoesPagamento().isBlank())
                || (order.getObservacoes() != null && !order.getObservacoes().isBlank());
    }

    private void adicionarCondicoesComerciais(Document document, Order order) throws DocumentException {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell cardCell = criarCelulaCarta();

        Paragraph titulo = new Paragraph("CONDIÇÕES COMERCIAIS", FONTE_TITULO_CARD);
        titulo.setSpacingAfter(8f);
        cardCell.addElement(titulo);

        if (order.getCondicaoPagamento() != null && !order.getCondicaoPagamento().isBlank()) {
            cardCell.addElement(new Phrase("CONDIÇÃO DE PAGAMENTO\n", FONTE_LABEL_CARD));
            cardCell.addElement(new Phrase(order.getCondicaoPagamento() + "\n\n", FONTE_NEGRITO));
        }

        if (order.getObservacoesPagamento() != null && !order.getObservacoesPagamento().isBlank()) {
            cardCell.addElement(new Phrase("OBSERVAÇÕES DE PAGAMENTO\n", FONTE_LABEL_CARD));
            cardCell.addElement(new Phrase(order.getObservacoesPagamento() + "\n\n", FONTE_NORMAL));
        }

        if (order.getObservacoes() != null && !order.getObservacoes().isBlank()) {
            cardCell.addElement(new Phrase("OBSERVAÇÕES GERAIS\n", FONTE_LABEL_CARD));
            cardCell.addElement(new Phrase(order.getObservacoes(), FONTE_NORMAL));
        }

        cardTable.addCell(cardCell);
        document.add(cardTable);
    }

    // =========================================================================
    // Seção: Rodapé
    // =========================================================================

    private void adicionarRodape(Document document, Order order) throws DocumentException {
        Paragraph divisoria = new Paragraph();
        divisoria.setSpacingAfter(10f);
        divisoria.add(new Chunk(new LineSeparator(0.5f, 100f, COR_BORDA_CLARA, Element.ALIGN_CENTER, 0f)));
        document.add(divisoria);

        Paragraph rodape = new Paragraph(
                companyProps.getRazaoSocial() + " — " + companyProps.getCidadeUf()
                        + " — " + companyProps.getTelefone()
                        + "\nDocumento gerado eletronicamente. Pedido " + obterDadoSeguro(order.getCodigo()),
                FONTE_RODAPE);
        rodape.setAlignment(Element.ALIGN_CENTER);
        document.add(rodape);
    }

    // =========================================================================
    // Utilitários
    // =========================================================================

    private PdfPCell criarCelulaCarta() {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COR_FUNDO_CLARO);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(COR_BORDA_CLARA);
        cell.setBorderWidth(0.5f);
        cell.setPadding(12f);
        return cell;
    }

    private Paragraph espacamento(float size) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(size);
        return p;
    }

    private String obterDadoSeguro(String valor) {
        if (valor == null || valor.isBlank()) {
            return NAO_INFORMADO;
        }
        return valor.trim();
    }

    private String formatarData(LocalDate data) {
        if (data == null) {
            return NAO_INFORMADO;
        }
        return data.format(FORMATTER_DATA);
    }

    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) {
            return "R$ 0,00";
        }
        NumberFormat fmt = NumberFormat.getCurrencyInstance(PT_BR);
        return fmt.format(valor);
    }

    private BigDecimal orZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}

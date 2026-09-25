package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.service.pdf.BudgetPdfDrawingHelper;
import br.edu.ifpb.alumigest.budgets.service.pdf.BudgetPdfPageEvent;
import br.edu.ifpb.alumigest.catalog.domain.HandleType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPCellEvent;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.text.NumberFormat;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Serviço responsável pela geração do documento oficial de orçamento em formato PDF (A4),
 * estritamente alinhado ao protótipo comercial e aos critérios da US-10.1.
 */
@Service
public class BudgetPdfService {

    private static final Logger log = LoggerFactory.getLogger(BudgetPdfService.class);

    private static final Locale PT_BR = Locale.of("pt", "BR");

    private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font FONTE_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font FONTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONTE_PEQUENA = FontFactory.getFont(FontFactory.HELVETICA, 8);
    private static final Font FONTE_DADOS_EMPRESA = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
    private static final Font FONTE_LABEL_CARD = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
    private static final Font FONTE_TITULO_CARD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(105, 110, 120));
    private static final Font FONTE_DESCRICAO_SECUNDARIA = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
    private static final Font FONTE_CABECALHO_TABELA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FONTE_TOTAL_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
    private static final Font FONTE_TAG_PUXADOR = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(80, 85, 90));

    private static final Color COR_CABECALHO_TABELA = new Color(20, 30, 50);
    private static final Color COR_FUNDO_CLARO = new Color(247, 249, 252);
    private static final Color COR_BORDA_CLARA = new Color(225, 230, 235);
    private static final Color COR_TAG_FUNDO = new Color(230, 235, 240);

    private static final String NAO_INFORMADO = "Não informado";

    private final CompanyProperties companyProps;
    private final ObjectMapper objectMapper;

    public BudgetPdfService(CompanyProperties companyProps) {
        this.companyProps = companyProps;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gera o PDF comercial A4 do orçamento informado.
     *
     * @param budget entidade do orçamento com itens e cliente carregados
     * @return array de bytes contendo o arquivo PDF completo e válido
     */
    public byte[] gerarPdfComercial(Budget budget) {
        Objects.requireNonNull(budget, "O orçamento não pode ser nulo para geração do PDF.");

        if (budget.getStatus() == BudgetStatus.CANCELLED) {
            throw new IllegalStateException("Não é possível gerar o PDF de um orçamento cancelado.");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (Document document = new Document(PageSize.A4, 36, 36, 54, 54)) {

            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            String nomeCliente = budget.getClient() != null ? budget.getClient().getFullName() : "";
            BudgetPdfPageEvent pageEvent = new BudgetPdfPageEvent(
                    budget.getCode(), nomeCliente, companyProps.getRazaoSocial());
            writer.setPageEvent(pageEvent);
            document.open();

            adicionarCabecalho(document, budget);
            adicionarDadosCliente(document, budget);
            document.add(new Paragraph(" "));

            adicionarTabelaItens(document, writer, budget);
            document.add(new Paragraph(" "));

            adicionarFechamentoFinanceiro(document, budget);
            adicionarRodapeEAssinaturas(document, budget);

        } catch (DocumentException e) {
            log.error("Erro ao estruturar documento PDF para o orçamento {}: {}", budget.getCode(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF do orçamento: " + e.getMessage(), e);
        }
        return outputStream.toByteArray();
    }

    /**
     * Gera o texto formatado para envio/compartilhamento de proposta comercial via WhatsApp [US-10.5] (#225).
     *
     * @param budget entidade do orçamento com itens e cliente carregados
     * @return texto limpo e estruturado com marcadores e emojis do WhatsApp em UTF-8
     */
    public String gerarResumoWhatsApp(Budget budget) {
        Objects.requireNonNull(budget, "O orçamento não pode ser nulo para geração do resumo WhatsApp.");

        StringBuilder sb = new StringBuilder();
        construirCabecalhoWhatsApp(sb, budget);
        construirItensWhatsApp(sb, budget);
        construirFechamentoFinanceiroWhatsApp(sb, budget);

        return sb.toString();
    }

    private void construirCabecalhoWhatsApp(StringBuilder sb, Budget budget) {
        String codigo = (budget.getCode() != null && !budget.getCode().isBlank())
                ? budget.getCode().trim()
                : "N/A";
        sb.append("📋 *Orçamento ").append(codigo).append("*\n");

        OffsetDateTime emissao = budget.getCreatedAt() != null
                ? budget.getCreatedAt()
                : OffsetDateTime.now(ZoneOffset.UTC);

        OffsetDateTime validade = budget.getValidUntil();
        if (validade == null) {
            validade = emissao.plusDays(15);
        }

        sb.append("📅 Emissão: ").append(formatarData(emissao))
                .append(" | Validade: ").append(formatarData(validade))
                .append("\n");

        String nomeCliente = NAO_INFORMADO;
        if (budget.getClient() != null && budget.getClient().getFullName() != null && !budget.getClient().getFullName().isBlank()) {
            nomeCliente = budget.getClient().getFullName().trim();
        }
        sb.append("👤 Cliente: ").append(nomeCliente).append("\n\n");
    }

    private void construirItensWhatsApp(StringBuilder sb, Budget budget) {
        sb.append("📦 Itens:\n");
        if (budget.getItems() != null && !budget.getItems().isEmpty()) {
            for (BudgetItem item : budget.getItems()) {
                construirLinhaItemWhatsApp(sb, item);
            }
        }
        sb.append("\n");
    }

    private void construirLinhaItemWhatsApp(StringBuilder sb, BudgetItem item) {
        sb.append("• ");
        int qtd = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
        sb.append(qtd).append("x ");

        sb.append(obterNomeProdutoItem(item));

        if (temDimensoesValidas(item)) {
            sb.append(" (")
                    .append(formatarDimensaoMm(item.getWidthMm()))
                    .append("x")
                    .append(formatarDimensaoMm(item.getHeightMm()))
                    .append("mm)");
        }

        BigDecimal valorItem = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
        sb.append(" - ").append(formatarMoedaWhatsApp(valorItem)).append("\n");
    }

    private String obterNomeProdutoItem(BudgetItem item) {
        if (item.getProductName() != null && !item.getProductName().isBlank()) {
            return item.getProductName().trim();
        }
        if (item.getProduct() != null && item.getProduct().getName() != null && !item.getProduct().getName().isBlank()) {
            return item.getProduct().getName().trim();
        }
        return "Item";
    }

    private boolean temDimensoesValidas(BudgetItem item) {
        return item.getWidthMm() != null && item.getHeightMm() != null
                && item.getWidthMm().compareTo(BigDecimal.ZERO) > 0
                && item.getHeightMm().compareTo(BigDecimal.ZERO) > 0;
    }

    private void construirFechamentoFinanceiroWhatsApp(StringBuilder sb, Budget budget) {
        BigDecimal subtotal = budget.getSubtotal() != null ? budget.getSubtotal() : BigDecimal.ZERO;
        sb.append("💰 Subtotal: ").append(formatarMoedaWhatsApp(subtotal)).append("\n");

        adicionarDescontoWhatsApp(sb, budget);

        BigDecimal total = budget.getTotal() != null ? budget.getTotal() : BigDecimal.ZERO;
        sb.append("📦 *TOTAL: ").append(formatarMoedaWhatsApp(total)).append("*\n");

        String condicaoPgto = (budget.getPaymentCondition() != null)
                ? budget.getPaymentCondition().getDescricao()
                : "A Combinar";
        sb.append("💳 Pagamento: ").append(condicaoPgto).append("\n\n");

        sb.append("_Alumiportas - Vidraçaria e Esquadrias_");
    }

    private void adicionarDescontoWhatsApp(StringBuilder sb, Budget budget) {
        BigDecimal descontoValor = budget.getDiscountValue();
        if (descontoValor == null || descontoValor.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal descontoPercent = budget.getDiscountPercent();
        if (descontoPercent != null && descontoPercent.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("🏷️ Desconto (")
                    .append(formatarNumeroSemZeroDecimal(descontoPercent))
                    .append("%): -")
                    .append(formatarMoedaWhatsApp(descontoValor))
                    .append("\n");
        } else {
            sb.append("🏷️ Desconto: -").append(formatarMoedaWhatsApp(descontoValor)).append("\n");
        }
    }

    private void adicionarCabecalho(Document document, Budget budget) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        PdfPCell cellLogo = new PdfPCell();
        cellLogo.setBorder(Rectangle.NO_BORDER);

        URL logoUrl = getClass().getResource("/static/logo-alumiportas.png");
        if (logoUrl != null) {
            try {
                Image logo = Image.getInstance(logoUrl);
                logo.scaleToFit(120, 50);
                cellLogo.addElement(logo);
            } catch (Exception e) {
                log.warn("Falha ao carregar arquivo de logo ({}), utilizando razão social como fallback", e.getMessage());
                cellLogo.addElement(new Paragraph(companyProps.getRazaoSocial(), FONTE_TITULO));
            }
        } else {
            cellLogo.addElement(new Paragraph(companyProps.getRazaoSocial(), FONTE_TITULO));
        }
        table.addCell(cellLogo);

        PdfPCell cellTitulo = new PdfPCell();
        cellTitulo.setBorder(Rectangle.NO_BORDER);
        cellTitulo.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph docLabel = new Paragraph("DOCUMENTO", FONTE_PEQUENA);
        docLabel.setAlignment(Element.ALIGN_RIGHT);
        cellTitulo.addElement(docLabel);

        Paragraph titulo = new Paragraph("ORÇAMENTO #" + obterDadoSeguro(budget.getCode()), FONTE_TITULO);
        titulo.setAlignment(Element.ALIGN_RIGHT);
        cellTitulo.addElement(titulo);
        table.addCell(cellTitulo);

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

        Paragraph emissao = new Paragraph("Emissão: " + formatarData(budget.getCreatedAt()), FONTE_NORMAL);
        emissao.setAlignment(Element.ALIGN_RIGHT);
        cellMetadados.addElement(emissao);

        String statusTraduzido = budget.getStatus() != null ? budget.getStatus().getDescricao() : NAO_INFORMADO;
        Paragraph status = new Paragraph("Status: " + statusTraduzido, FONTE_NORMAL);
        status.setAlignment(Element.ALIGN_RIGHT);
        cellMetadados.addElement(status);

        Paragraph validade = new Paragraph("Validade: " + formatarData(budget.getValidUntil()), FONTE_NORMAL);
        validade.setAlignment(Element.ALIGN_RIGHT);
        cellMetadados.addElement(validade);
        table.addCell(cellMetadados);

        document.add(table);

        Paragraph divisoria = new Paragraph();
        divisoria.setSpacingBefore(12f);
        divisoria.setSpacingAfter(15f);
        divisoria.add(new Chunk(new LineSeparator(0.8f, 100f, Color.GRAY, Element.ALIGN_CENTER, 0f)));
        document.add(divisoria);
    }

    private void adicionarDadosCliente(Document document, Budget budget) throws DocumentException {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell cardCell = new PdfPCell();
        cardCell.setBackgroundColor(COR_FUNDO_CLARO);
        cardCell.setBorder(Rectangle.NO_BORDER);
        cardCell.setCellEvent(new BordaArredondada());
        cardCell.setPadding(15f);

        Paragraph tituloCard = new Paragraph("DADOS DO CLIENTE", FONTE_TITULO_CARD);
        tituloCard.setSpacingAfter(10f);
        cardCell.addElement(tituloCard);

        PdfPTable innerTable = new PdfPTable(2);
        innerTable.setWidthPercentage(100);

        Client client = budget.getClient();
        String nome = obterDadoSeguro(client != null ? client.getFullName() : null);
        String documento = obterDadoSeguro(client != null ? client.getDocumentNumber() : null);
        String contato = formatarContato(client);
        String endereco = formatarEnderecoCompleto(client);

        PdfPCell cellEsq = new PdfPCell();
        cellEsq.setBorder(Rectangle.NO_BORDER);
        cellEsq.addElement(new Phrase("NOME / RAZÃO SOCIAL\n", FONTE_LABEL_CARD));
        cellEsq.addElement(new Phrase(nome + "\n\n", FONTE_NEGRITO));
        cellEsq.addElement(new Phrase("ENDEREÇO\n", FONTE_LABEL_CARD));
        cellEsq.addElement(new Phrase(endereco, FONTE_NORMAL));
        innerTable.addCell(cellEsq);

        PdfPCell cellDir = new PdfPCell();
        cellDir.setBorder(Rectangle.NO_BORDER);
        cellDir.addElement(new Phrase("DOCUMENTO (CPF/CNPJ)\n", FONTE_LABEL_CARD));
        cellDir.addElement(new Phrase(documento + "\n\n", FONTE_NEGRITO));
        cellDir.addElement(new Phrase("CONTATO\n", FONTE_LABEL_CARD));
        cellDir.addElement(new Phrase(contato, FONTE_NORMAL));
        innerTable.addCell(cellDir);

        cardCell.addElement(innerTable);
        cardTable.addCell(cardCell);
        document.add(cardTable);
    }

    private void adicionarTabelaItens(Document document, PdfWriter writer, Budget budget) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.4f, 4.2f, 1f, 1.7f, 1.7f});
        table.setHeaderRows(1);
        table.setSplitLate(true);
        table.setSplitRows(false);

        adicionarCabecalhoItens(table);

        if (budget.getItems() != null) {
            for (BudgetItem item : budget.getItems()) {
                adicionarLinhaItem(table, writer, item);
            }
        }
        document.add(table);
    }

    private void adicionarCabecalhoItens(PdfPTable table) {
        String[] cabecalhos = {"MINIATURA", "PRODUTO / DESCRIÇÃO TÉCNICA", "QTD", "V. UNIT (R$)", "TOTAL (R$)"};
        for (int i = 0; i < cabecalhos.length; i++) {
            PdfPCell header = new PdfPCell(new Phrase(cabecalhos[i], FONTE_CABECALHO_TABELA));
            header.setBackgroundColor(COR_CABECALHO_TABELA);
            header.setBorder(Rectangle.NO_BORDER);
            header.setPadding(8f);
            header.setHorizontalAlignment(i <= 1 ? Element.ALIGN_LEFT : Element.ALIGN_CENTER);
            table.addCell(header);
        }
    }

    private void adicionarLinhaItem(PdfPTable table, PdfWriter writer, BudgetItem item) {
        PdfPCell cellMiniatura;
        try {
            Image miniatura = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, 48f, 56f);
            cellMiniatura = new PdfPCell(miniatura, true);
            cellMiniatura.setPadding(4f);
            cellMiniatura.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellMiniatura.setVerticalAlignment(Element.ALIGN_MIDDLE);
        } catch (Exception e) {
            log.warn("Falha ao desenhar miniatura vetorial para o item: {}", e.getMessage());
            cellMiniatura = new PdfPCell(new Phrase(""));
        }
        estilizarCelulaTabelaClean(cellMiniatura);
        table.addCell(cellMiniatura);

        Phrase phraseDescricao = construirDescricaoItem(item);
        PdfPCell cellDesc = new PdfPCell(phraseDescricao);
        cellDesc.setPadding(10f);
        estilizarCelulaTabelaClean(cellDesc);
        table.addCell(cellDesc);

        PdfPCell cellQtd = new PdfPCell(new Phrase(formatarQuantidade(item.getQuantity()), FONTE_NORMAL));
        cellQtd.setHorizontalAlignment(Element.ALIGN_CENTER);
        cellQtd.setVerticalAlignment(Element.ALIGN_MIDDLE);
        estilizarCelulaTabelaClean(cellQtd);
        table.addCell(cellQtd);

        BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
        BigDecimal qtd = (item.getQuantity() != null && item.getQuantity() > 0) ? BigDecimal.valueOf(item.getQuantity()) : BigDecimal.ONE;
        BigDecimal valorUnitario = subtotal.divide(qtd, 2, RoundingMode.HALF_UP);

        PdfPCell cellVUnit = new PdfPCell(new Phrase(formatarNumero(valorUnitario), FONTE_NORMAL));
        cellVUnit.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellVUnit.setVerticalAlignment(Element.ALIGN_MIDDLE);
        estilizarCelulaTabelaClean(cellVUnit);
        table.addCell(cellVUnit);

        PdfPCell cellTotal = new PdfPCell(new Phrase(formatarNumero(subtotal), FONTE_NORMAL));
        cellTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellTotal.setVerticalAlignment(Element.ALIGN_MIDDLE);
        estilizarCelulaTabelaClean(cellTotal);
        table.addCell(cellTotal);
    }

    private Phrase construirDescricaoItem(BudgetItem item) {
        Phrase phraseDescricao = new Phrase();
        phraseDescricao.add(new Chunk(obterDadoSeguro(item.getProductName()) + "\n", FONTE_NORMAL));

        BigDecimal wCm = item.getWidthMm() != null ? item.getWidthMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal hCm = item.getHeightMm() != null ? item.getHeightMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        phraseDescricao.add(new Chunk("L=" + formatarNumero(wCm) + "cm x A=" + formatarNumero(hCm) + "cm\n", FONTE_DESCRICAO_SECUNDARIA));

        adicionarOpcoesItem(phraseDescricao, item);
        adicionarTagPuxador(phraseDescricao, item);

        return phraseDescricao;
    }

    private void adicionarOpcoesItem(Phrase phraseDescricao, BudgetItem item) {
        if (item.getOptions() == null || item.getOptions().isEmpty()) {
            return;
        }
        for (BudgetItemOption option : item.getOptions()) {
            String categoria = traduzirCategoria(option.getCategoryType());
            String material = option.getMaterialName() != null ? option.getMaterialName() : "";
            String cor = (option.getSelectedColor() != null && !option.getSelectedColor().trim().isEmpty())
                    ? " " + option.getSelectedColor().trim() : "";
            phraseDescricao.add(new Chunk(categoria + ": " + material + cor + "\n", FONTE_DESCRICAO_SECUNDARIA));
        }
    }

    private void adicionarTagPuxador(Phrase phraseDescricao, BudgetItem item) {
        String descricaoPuxador = extrairDescricaoPuxador(item.getHandleConfig());
        if (descricaoPuxador != null && !descricaoPuxador.isBlank()) {
            phraseDescricao.add(new Chunk("\n", FONTE_DESCRICAO_SECUNDARIA));
            Chunk tag = new Chunk(" " + descricaoPuxador + " ", FONTE_TAG_PUXADOR);
            tag.setBackground(COR_TAG_FUNDO);
            phraseDescricao.add(tag);
            phraseDescricao.add(new Chunk("\n"));
        }
    }

    private void estilizarCelulaTabelaClean(PdfPCell cell) {
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(COR_BORDA_CLARA);
        cell.setBorderWidthBottom(1f);
    }

    private void adicionarFechamentoFinanceiro(Document document, Budget budget) throws DocumentException {
        PdfPTable cardContainer = new PdfPTable(1);
        cardContainer.setWidthPercentage(45);
        cardContainer.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cardContainer.setKeepTogether(true);

        PdfPCell cardCell = new PdfPCell();
        cardCell.setBorder(Rectangle.NO_BORDER);
        cardCell.setCellEvent(new BordaArredondada());
        cardCell.setPadding(0f);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{5.5f, 4.5f});

        Font fonteLabel = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
        Font fonteValor = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

        // Separação da Mão de Obra Total vs Subtotal de Materiais
        BigDecimal totalMaoDeObra = BigDecimal.ZERO;
        if (budget.getItems() != null) {
            for (BudgetItem item : budget.getItems()) {
                if (item.getLaborCost() != null) {
                    totalMaoDeObra = totalMaoDeObra.add(item.getLaborCost());
                }
            }
        }

        BigDecimal subtotalGeral = budget.getSubtotal() != null ? budget.getSubtotal() : BigDecimal.ZERO;
        BigDecimal subtotalMateriais = subtotalGeral.subtract(totalMaoDeObra);
        if (subtotalMateriais.compareTo(BigDecimal.ZERO) < 0) {
            subtotalMateriais = BigDecimal.ZERO;
        }

        if (totalMaoDeObra.compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotal(table, "Subtotal de Produtos", formatarMoeda(subtotalMateriais), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
            adicionarLinhaTotal(table, "Mão de Obra", formatarMoeda(totalMaoDeObra), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
        } else {
            adicionarLinhaTotal(table, "Subtotal de Produtos", formatarMoeda(subtotalGeral), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
        }

        BigDecimal descontoValor = budget.getDiscountValue() != null ? budget.getDiscountValue() : BigDecimal.ZERO;
        if (descontoValor.compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotal(table, "Desconto", "- " + formatarMoeda(descontoValor), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
        }

        adicionarLinhaTotal(table, "TOTAL A PAGAR", formatarMoeda(budget.getTotal()), FONTE_TOTAL_LABEL, FONTE_TOTAL_LABEL, COR_CABECALHO_TABELA, true);

        cardCell.addElement(table);
        cardContainer.addCell(cardCell);
        document.add(cardContainer);
    }

    private void adicionarLinhaTotal(PdfPTable table, String label, String valor, Font fontLabel, Font fontValor, Color bgColor, boolean isTotal) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, fontLabel));
        PdfPCell cellValor = new PdfPCell(new Phrase(valor, fontValor));

        cellLabel.setPadding(10f);
        cellValor.setPadding(10f);
        cellValor.setHorizontalAlignment(Element.ALIGN_RIGHT);

        cellLabel.setBackgroundColor(bgColor);
        cellValor.setBackgroundColor(bgColor);

        if (isTotal) {
            cellLabel.setBorder(Rectangle.NO_BORDER);
            cellValor.setBorder(Rectangle.NO_BORDER);
        } else {
            cellLabel.setBorder(Rectangle.BOTTOM);
            cellValor.setBorder(Rectangle.BOTTOM);
            cellLabel.setBorderColor(COR_BORDA_CLARA);
            cellValor.setBorderColor(COR_BORDA_CLARA);
        }

        table.addCell(cellLabel);
        table.addCell(cellValor);
    }

    private void adicionarRodapeEAssinaturas(Document document, Budget budget) throws DocumentException {
        document.add(new Paragraph("\n\n"));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.setKeepTogether(true);

        PdfPCell cellAssinatura = new PdfPCell();
        cellAssinatura.setBorder(Rectangle.TOP);
        cellAssinatura.setBorderColor(COR_CABECALHO_TABELA);
        cellAssinatura.setBorderWidthTop(1f);
        cellAssinatura.setPaddingTop(8f);
        cellAssinatura.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph assNome = new Paragraph("Assinatura do Cliente", FONTE_NEGRITO);
        assNome.setAlignment(Element.ALIGN_CENTER);
        cellAssinatura.addElement(assNome);

        Paragraph assDesc = new Paragraph("Confirmo a aprovação das medidas e especificações acima.", FONTE_PEQUENA);
        assDesc.setAlignment(Element.ALIGN_CENTER);
        cellAssinatura.addElement(assDesc);

        table.addCell(cellAssinatura);
        document.add(table);

        document.add(new Paragraph("\nINFORMAÇÕES COMPLEMENTARES:", FONTE_NEGRITO));
        if (budget.getPaymentCondition() != null) {
            document.add(new Paragraph("- Condição de Pagamento: " + budget.getPaymentCondition().getDescricao(), FONTE_PEQUENA));
        }
        document.add(new Paragraph("- Valores expressos em Reais (R$).", FONTE_PEQUENA));
        document.add(new Paragraph("- Por se tratar de produto feito sob medida, não aceitamos devoluções após o início da produção.", FONTE_PEQUENA));

        // Termo de validade dinâmico
        if (budget.getValidUntil() != null) {
            long diasValidade = 15;
            if (budget.getCreatedAt() != null) {
                diasValidade = Duration.between(budget.getCreatedAt(), budget.getValidUntil()).toDays();
                if (diasValidade <= 0) {
                    diasValidade = 15;
                }
            }
            document.add(new Paragraph("- Orçamento válido até " + formatarData(budget.getValidUntil())
                    + " (" + diasValidade + " dias a partir da emissão).", FONTE_PEQUENA));
        } else {
            document.add(new Paragraph("- Orçamento válido por 15 dias a partir da data de emissão.", FONTE_PEQUENA));
        }

        // Observações adicionais do orçamento (notes)
        if (budget.getNotes() != null && !budget.getNotes().isBlank()) {
            document.add(new Paragraph("- Observações: " + budget.getNotes().trim(), FONTE_PEQUENA));
        }
    }

    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) return "R$ 0,00";
        return NumberFormat.getCurrencyInstance(PT_BR).format(valor);
    }

    private String formatarMoedaWhatsApp(BigDecimal valor) {
        if (valor == null) return "R$ 0,00";
        return "R$ " + formatarNumero(valor);
    }

    private String formatarDimensaoMm(BigDecimal mm) {
        if (mm == null) return "0";
        if (mm.stripTrailingZeros().scale() <= 0) {
            return String.valueOf(mm.longValue());
        }
        return formatarNumero(mm);
    }

    private String formatarNumeroSemZeroDecimal(BigDecimal valor) {
        if (valor == null) return "0";
        if (valor.stripTrailingZeros().scale() <= 0) {
            return String.valueOf(valor.longValue());
        }
        return formatarNumero(valor);
    }

    private String formatarNumero(BigDecimal valor) {
        if (valor == null) return "0,00";
        NumberFormat format = NumberFormat.getNumberInstance(PT_BR);
        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);
        return format.format(valor);
    }

    private String formatarQuantidade(Integer qtd) {
        return qtd == null ? "0" : String.valueOf(qtd);
    }

    private String formatarData(OffsetDateTime data) {
        if (data == null) return "Não informada";
        return data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String obterDadoSeguro(String dado) {
        return (dado != null && !dado.trim().isEmpty()) ? dado : NAO_INFORMADO;
    }

    private String formatarContato(Client client) {
        if (client == null) return NAO_INFORMADO;
        List<String> contatos = new ArrayList<>();
        if (client.getEmail() != null && !client.getEmail().isBlank()) {
            contatos.add(client.getEmail().trim());
        }
        if (client.getPhone() != null && !client.getPhone().isBlank()) {
            contatos.add(client.getPhone().trim());
        }
        return contatos.isEmpty() ? NAO_INFORMADO : String.join(" | ", contatos);
    }

    private String formatarEnderecoCompleto(Client client) {
        if (client == null) return NAO_INFORMADO;

        List<String> partes = new ArrayList<>();

        StringBuilder logradouro = new StringBuilder();
        if (client.getStreet() != null && !client.getStreet().isBlank()) {
            logradouro.append(client.getStreet().trim());
            if (client.getNumber() != null && !client.getNumber().isBlank()) {
                logradouro.append(", ").append(client.getNumber().trim());
            }
            partes.add(logradouro.toString());
        }

        if (client.getNeighborhood() != null && !client.getNeighborhood().isBlank()) {
            partes.add(client.getNeighborhood().trim());
        }

        if (client.getCity() != null && !client.getCity().isBlank()) {
            String cidadeEstado = client.getCity().trim();
            if (client.getState() != null && !client.getState().isBlank()) {
                cidadeEstado += "/" + client.getState().trim();
            }
            partes.add(cidadeEstado);
        }

        return partes.isEmpty() ? NAO_INFORMADO : String.join(" - ", partes);
    }

    private String traduzirCategoria(MaterialCategoryType categoria) {
        if (categoria == null) return "Item";
        return switch (categoria) {
            case PROFILE -> "Perfil";
            case GLASS -> "Vidro";
            case HARDWARE -> "Ferragem";
            case ROLLERS -> "Roldanas";
            case FILM -> "Película";
        };
    }

    private String extrairDescricaoPuxador(String handleConfigRaw) {
        if (handleConfigRaw == null || handleConfigRaw.isBlank()) {
            return null;
        }

        String raw = handleConfigRaw.trim();
        if (raw.startsWith("{")) {
            try {
                JsonNode node = objectMapper.readTree(raw);
                JsonNode typeNode = node.get("handleType");
                if (typeNode == null || typeNode.isNull()) {
                    typeNode = node.get("type");
                }
                if (typeNode != null && !typeNode.isNull()) {
                    return resolverDescricaoTipoPuxador(typeNode.asText());
                }
            } catch (Exception e) {
                log.debug("Não foi possível parsear handleConfig como JSON: {}", e.getMessage());
            }
            return null;
        }

        if ("NONE".equalsIgnoreCase(raw)) {
            return null;
        }
        return raw;
    }

    private String resolverDescricaoTipoPuxador(String tipoStr) {
        try {
            HandleType handleType = HandleType.valueOf(tipoStr);
            return traduzirTipoPuxador(handleType);
        } catch (IllegalArgumentException e) {
            return tipoStr;
        }
    }

    private String traduzirTipoPuxador(HandleType handleType) {
        if (handleType == null || handleType == HandleType.NONE) {
            return null;
        }
        return switch (handleType) {
            case BAR_TUBULAR -> "Barra Tubular";
            case SHELL_LOCK -> "Fecho Concha";
            case LEVER_HANDLE -> "Alavanca";
            case NONE -> null;
        };
    }

    private static class BordaArredondada implements PdfPCellEvent {
        @Override
        public void cellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            PdfContentByte canvas = canvases[PdfPTable.LINECANVAS];
            canvas.roundRectangle(position.getLeft(), position.getBottom(), position.getWidth(), position.getHeight(), 6f);
            canvas.setColorStroke(COR_BORDA_CLARA);
            canvas.setLineWidth(1f);
            canvas.stroke();
        }
    }
}
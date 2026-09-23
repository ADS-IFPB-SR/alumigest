package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.service.pdf.BudgetPdfPageEvent;
import br.edu.ifpb.alumigest.budgets.service.pdf.TechnicalPdfPageEvent;
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
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.text.NumberFormat;
import java.time.Duration;
import java.time.OffsetDateTime;
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

    // ── Constantes da Ficha Técnica de Oficina (US-11.1) ─────────────────
    private static final Color COR_TECNICA_HEADER_BG = new Color(15, 23, 42);       // #0f172a
    private static final Color COR_TECNICA_BORDA = new Color(203, 213, 225);          // #cbd5e1
    private static final Color COR_TECNICA_BG_CARD = new Color(248, 250, 252);        // #f8fafc
    private static final Color COR_TECNICA_BG_ESQUEMA = new Color(250, 250, 250);     // #fafafa
    private static final Color COR_TECNICA_TEXT_SEC = new Color(71, 85, 105);         // #475569
    private static final Color COR_TECNICA_DANGER = new Color(220, 38, 38);           // #dc2626
    private static final Color COR_TECNICA_BADGE_BG = new Color(241, 245, 249);       // #f1f5f9
    private static final Color COR_TECNICA_BADGE_ALERT_BG = new Color(254, 242, 242); // #fef2f2

    private static final Font FONTE_TECNICA_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_TECNICA_TEXT_SEC);
    private static final Font FONTE_TECNICA_PEDIDO_NUM = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_DATA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_TECNICA_DANGER);
    private static final Font FONTE_TECNICA_LABEL = FontFactory.getFont(FontFactory.HELVETICA, 7, COR_TECNICA_TEXT_SEC);
    private static final Font FONTE_TECNICA_VALOR = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_TH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
    private static final Font FONTE_TECNICA_ITEM_NUM = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_ITEM_QTD = FontFactory.getFont(FontFactory.HELVETICA, 7, COR_TECNICA_TEXT_SEC);
    private static final Font FONTE_TECNICA_BADGE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_BADGE_ALERT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, COR_TECNICA_DANGER);
    private static final Font FONTE_TECNICA_DIMENSAO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f, COR_TECNICA_HEADER_BG);
    private static final Font FONTE_TECNICA_TEXTO_SEC = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COR_TECNICA_TEXT_SEC);
    private static final Font FONTE_TECNICA_CHECKBOX_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, COR_TECNICA_TEXT_SEC);

    private static final String KEY_DETAILS = "details";
    private static final String KEY_HOLES_COUNT = "holesCount";
    private static final String KEY_POSITION = "position";
    private static final String KEY_FORMAT = "format";
    private static final String KEY_HANDLE_TYPE = "handleType";
    private static final String PADRAO = "Padrão";
    private static final String BADGE_PADRAO = "PADRÃO";

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

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             Document document = new Document(PageSize.A4, 36, 36, 54, 54)) {

            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            String nomeCliente = budget.getClient() != null ? budget.getClient().getFullName() : "";
            BudgetPdfPageEvent pageEvent = new BudgetPdfPageEvent(
                    budget.getCode(), nomeCliente, companyProps.getRazaoSocial());
            writer.setPageEvent(pageEvent);
            document.open();

            adicionarCabecalho(document, budget);
            adicionarDadosCliente(document, budget);
            document.add(new Paragraph(" "));

            adicionarTabelaItens(document, budget);
            document.add(new Paragraph(" "));

            adicionarFechamentoFinanceiro(document, budget);
            adicionarRodapeEAssinaturas(document, budget);

            // document.close() precisa ser chamado antes de toByteArray() para garantir
            // a escrita da tabela de referências (xref), trailer e %%EOF pelo OpenPDF.
            document.close();
            return outputStream.toByteArray();

        } catch (DocumentException e) {
            log.error("Erro ao estruturar documento PDF para o orçamento {}: {}", budget.getCode(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF do orçamento: " + e.getMessage(), e);
        } catch (IOException e) {
            log.error("Erro de I/O na geração do PDF para o orçamento {}: {}", budget.getCode(), e.getMessage(), e);
            throw new RuntimeException("Erro de I/O ao gerar PDF do orçamento: " + e.getMessage(), e);
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

        String statusTraduzido = budget.getStatus() != null ? budget.getStatus().getDescricao() : "Não informado";
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

    private void adicionarTabelaItens(Document document, Budget budget) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{5f, 1f, 2f, 2f});
        table.setHeaderRows(1);

        String[] cabecalhos = {"PRODUTO / DESCRIÇÃO TÉCNICA", "QTD", "V. UNIT (R$)", "TOTAL (R$)"};
        for (int i = 0; i < cabecalhos.length; i++) {
            PdfPCell header = new PdfPCell(new Phrase(cabecalhos[i], FONTE_CABECALHO_TABELA));
            header.setBackgroundColor(COR_CABECALHO_TABELA);
            header.setBorder(Rectangle.NO_BORDER);
            header.setPadding(8f);

            if (i == 0) {
                header.setHorizontalAlignment(Element.ALIGN_LEFT);
            } else {
                header.setHorizontalAlignment(Element.ALIGN_CENTER);
            }
            table.addCell(header);
        }

        if (budget.getItems() != null) {
            for (BudgetItem item : budget.getItems()) {

                Phrase phraseDescricao = new Phrase();
                phraseDescricao.add(new Chunk(obterDadoSeguro(item.getProductName()) + "\n", FONTE_NORMAL));

                BigDecimal wCm = item.getWidthMm() != null ? item.getWidthMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                BigDecimal hCm = item.getHeightMm() != null ? item.getHeightMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                phraseDescricao.add(new Chunk("L=" + formatarNumero(wCm) + "cm x A=" + formatarNumero(hCm) + "cm\n", FONTE_DESCRICAO_SECUNDARIA));

                if (item.getOptions() != null && !item.getOptions().isEmpty()) {
                    for (BudgetItemOption option : item.getOptions()) {
                        String categoria = traduzirCategoria(option.getCategoryType());
                        String material = option.getMaterialName() != null ? option.getMaterialName() : "";
                        String cor = (option.getSelectedColor() != null && !option.getSelectedColor().trim().isEmpty())
                                ? " " + option.getSelectedColor().trim() : "";

                        String textoOpcao = categoria + ": " + material + cor;
                        phraseDescricao.add(new Chunk(textoOpcao + "\n", FONTE_DESCRICAO_SECUNDARIA));
                    }
                }

                // Tag de Puxador com tratamento inteligente de JSON
                String descricaoPuxador = extrairDescricaoPuxador(item.getHandleConfig());
                if (descricaoPuxador != null && !descricaoPuxador.isBlank()) {
                    phraseDescricao.add(new Chunk("\n", FONTE_DESCRICAO_SECUNDARIA));
                    Chunk tag = new Chunk(" " + descricaoPuxador + " ", FONTE_TAG_PUXADOR);
                    tag.setBackground(COR_TAG_FUNDO);
                    phraseDescricao.add(tag);
                    phraseDescricao.add(new Chunk("\n"));
                }

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
        }
        document.add(table);
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
        return (dado != null && !dado.trim().isEmpty()) ? dado : "Não informado";
    }

    private String formatarContato(Client client) {
        if (client == null) return "Não informado";
        List<String> contatos = new ArrayList<>();
        if (client.getEmail() != null && !client.getEmail().isBlank()) {
            contatos.add(client.getEmail().trim());
        }
        if (client.getPhone() != null && !client.getPhone().isBlank()) {
            contatos.add(client.getPhone().trim());
        }
        return contatos.isEmpty() ? "Não informado" : String.join(" | ", contatos);
    }

    private String formatarEnderecoCompleto(Client client) {
        if (client == null) return "Não informado";

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

        return partes.isEmpty() ? "Não informado" : String.join(" - ", partes);
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
                    String tipoStr = typeNode.asText();
                    try {
                        HandleType handleType = HandleType.valueOf(tipoStr);
                        return traduzirTipoPuxador(handleType);
                    } catch (IllegalArgumentException e) {
                        return tipoStr;
                    }
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

    // ═════════════════════════════════════════════════════════════════════
    // ── MÉTODOS DA FICHA TÉCNICA DE OFICINA (US-11.1) ────────────────────
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Gera o PDF da Ficha Técnica de Oficina (Ficha de Usinagem e Corte) A4 do orçamento informado,
     * estritamente alinhado ao protótipo técnico e garantindo sigilo comercial absoluto (US-11.1).
     *
     * @param budget entidade do orçamento com itens e cliente carregados
     * @return array de bytes contendo o arquivo PDF da via técnica
     */
    public byte[] gerarPdfTecnico(Budget budget) {
        Objects.requireNonNull(budget, "O orçamento não pode ser nulo para geração do PDF técnico.");

        if (budget.getStatus() == BudgetStatus.CANCELLED) {
            throw new IllegalStateException("Não é possível gerar o PDF técnico de um orçamento cancelado.");
        }

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             Document document = new Document(PageSize.A4, 30, 30, 36, 45)) {

            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            String nomeCliente = budget.getClient() != null ? budget.getClient().getFullName() : "Não informado";
            TechnicalPdfPageEvent pageEvent = new TechnicalPdfPageEvent(budget.getCode(), nomeCliente);
            writer.setPageEvent(pageEvent);
            document.open();

            adicionarCabecalhoFabril(document, budget);
            adicionarCardClienteProducao(document, budget);
            adicionarTabelaProducao(document, budget);

            document.close();
            return outputStream.toByteArray();

        } catch (DocumentException | IOException e) {
            log.error("Erro ao estruturar documento PDF técnico para o orçamento {}: {}", budget.getCode(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF técnico do orçamento: " + e.getMessage(), e);
        }
    }

    private void adicionarCabecalhoFabril(Document document, Budget budget) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{65f, 35f});
        headerTable.setSpacingAfter(10f);

        PdfPCell colEsq = new PdfPCell();
        colEsq.setBorder(Rectangle.NO_BORDER);
        colEsq.setPaddingBottom(6f);

        Paragraph pTitulo = new Paragraph("FICHA DE USINAGEM E CORTE", FONTE_TECNICA_TITULO);
        pTitulo.setLeading(16f);
        colEsq.addElement(pTitulo);

        Paragraph pSetor = new Paragraph("Setor: Fábrica / Vidraçaria", FONTE_TECNICA_SUBTITULO);
        pSetor.setLeading(13f);
        colEsq.addElement(pSetor);
        headerTable.addCell(colEsq);

        PdfPCell colDir = new PdfPCell();
        colDir.setBorder(Rectangle.NO_BORDER);
        colDir.setHorizontalAlignment(Element.ALIGN_RIGHT);
        colDir.setPaddingBottom(6f);

        Paragraph pLabelPedido = new Paragraph("PEDIDO", FONTE_TECNICA_LABEL);
        pLabelPedido.setAlignment(Element.ALIGN_RIGHT);
        pLabelPedido.setLeading(9f);
        colDir.addElement(pLabelPedido);

        String cod = budget.getCode() != null ? budget.getCode() : "0000";
        Paragraph pCod = new Paragraph("#" + cod, FONTE_TECNICA_PEDIDO_NUM);
        pCod.setAlignment(Element.ALIGN_RIGHT);
        pCod.setLeading(16f);
        colDir.addElement(pCod);

        OffsetDateTime dataCriacao = budget.getCreatedAt() != null ? budget.getCreatedAt() : OffsetDateTime.now();
        String dataStr = dataCriacao.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        Paragraph pData = new Paragraph("DATA: " + dataStr, FONTE_TECNICA_DATA);
        pData.setAlignment(Element.ALIGN_RIGHT);
        pData.setLeading(11f);
        colDir.addElement(pData);
        headerTable.addCell(colDir);

        document.add(headerTable);

        LineSeparator sep = new LineSeparator(2f, 100f, COR_TECNICA_HEADER_BG, Element.ALIGN_CENTER, -2f);
        document.add(sep);
        document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 4)));
    }

    private void adicionarCardClienteProducao(Document document, Budget budget) throws DocumentException {
        PdfPTable card = new PdfPTable(3);
        card.setWidthPercentage(100);
        card.setWidths(new float[]{42f, 33f, 25f});
        card.setSpacingBefore(2f);
        card.setSpacingAfter(12f);

        int totalPecas = budget.getItems() != null
                ? budget.getItems().stream().mapToInt(BudgetItem::getQuantity).sum()
                : 0;

        String nomeCliente = (budget.getClient() != null && budget.getClient().getFullName() != null)
                ? budget.getClient().getFullName().toUpperCase(PT_BR)
                : "NÃO INFORMADO";

        String contato = extrairContatoCliente(budget.getClient());

        String volume = totalPecas == 1 ? "1 PEÇA" : totalPecas + " PEÇAS";

        card.addCell(criarSubCelulaCardCliente("Cliente / Obra", nomeCliente, true));
        card.addCell(criarSubCelulaCardCliente("Vendedor / Contato", contato, false));
        card.addCell(criarSubCelulaCardCliente("Volume do Pedido", volume, true));

        document.add(card);
    }

    private String extrairContatoCliente(Client client) {
        if (client == null) {
            return "NÃO INFORMADO";
        }
        if (client.getPhone() != null && !client.getPhone().isBlank()) {
            return client.getPhone().trim();
        }
        if (client.getEmail() != null && !client.getEmail().isBlank()) {
            return client.getEmail().trim();
        }
        return "NÃO INFORMADO";
    }

    private PdfPCell criarSubCelulaCardCliente(String label, String valor, boolean destaque) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COR_TECNICA_BG_CARD);
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setBorderWidth(1f);
        cell.setPadding(6f);
        cell.setPaddingLeft(8f);
        cell.setPaddingRight(8f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Paragraph pLabel = new Paragraph(label.toUpperCase(PT_BR), FONTE_TECNICA_LABEL);
        pLabel.setLeading(8f);
        cell.addElement(pLabel);

        Font fonteValor = destaque ? FONTE_TECNICA_VALOR : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_TECNICA_HEADER_BG);
        Paragraph pValor = new Paragraph(valor, fonteValor);
        pValor.setLeading(12f);
        cell.addElement(pValor);

        return cell;
    }

    private void adicionarTabelaProducao(Document document, Budget budget) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        // Proporções: Item (7%), Esquema (25%), Especificações (26%), Furação/Puxador (30%), Status (12%)
        table.setWidths(new float[]{7f, 25f, 26f, 30f, 12f});
        table.setHeaderRows(1);
        table.setSpacingAfter(8f);

        table.addCell(criarThProducao("Item", Element.ALIGN_CENTER));
        table.addCell(criarThProducao("Esquema (Usinagem/Puxador)", Element.ALIGN_CENTER));
        table.addCell(criarThProducao("Especificações Técnicas", Element.ALIGN_LEFT));
        table.addCell(criarThProducao("Detalhamento Furação / Puxador", Element.ALIGN_LEFT));
        table.addCell(criarThProducao("Status", Element.ALIGN_CENTER));

        List<BudgetItem> items = budget.getItems() != null ? budget.getItems() : List.of();
        int seq = 1;
        for (BudgetItem item : items) {
            table.addCell(criarCelulaItemSeq(seq, item));
            table.addCell(criarCelulaEsquemaTecnico());
            table.addCell(criarCelulaEspecificacoesTecnicas(item));
            table.addCell(criarCelulaDetalhamentoFuracao(item));
            table.addCell(criarCelulaStatusCheckboxes());
            seq++;
        }

        document.add(table);
    }

    private PdfPCell criarThProducao(String titulo, int alinhamento) {
        PdfPCell cell = new PdfPCell(new Phrase(titulo.toUpperCase(PT_BR), FONTE_TECNICA_TH));
        cell.setBackgroundColor(COR_TECNICA_HEADER_BG);
        cell.setBorderColor(COR_TECNICA_HEADER_BG);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(alinhamento);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell criarCelulaItemSeq(int seq, BudgetItem item) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_TOP);

        Paragraph pNum = new Paragraph(String.format("%02d", seq), FONTE_TECNICA_ITEM_NUM);
        pNum.setAlignment(Element.ALIGN_CENTER);
        pNum.setLeading(14f);
        cell.addElement(pNum);

        int qtd = item.getQuantity() != null ? item.getQuantity() : 1;
        String qtdStr = qtd > 1 ? "Qtd: " + qtd + " conj." : "Qtd: 1";
        Paragraph pQtd = new Paragraph(qtdStr, FONTE_TECNICA_ITEM_QTD);
        pQtd.setAlignment(Element.ALIGN_CENTER);
        pQtd.setLeading(9f);
        pQtd.setSpacingBefore(2f);
        cell.addElement(pQtd);

        return cell;
    }

    private PdfPCell criarCelulaEsquemaTecnico() {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setPadding(4f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPTable container = new PdfPTable(1);
        container.setWidthPercentage(100);

        PdfPCell inner = new PdfPCell();
        inner.setMinimumHeight(105f);
        inner.setBackgroundColor(COR_TECNICA_BG_ESQUEMA);
        inner.setBorder(Rectangle.NO_BORDER);
        inner.setCellEvent(new BordaTracejada());
        inner.setVerticalAlignment(Element.ALIGN_MIDDLE);
        inner.setHorizontalAlignment(Element.ALIGN_CENTER);
        inner.setPadding(8f);

        Paragraph p1 = new Paragraph("ESQUEMA TÉCNICO", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COR_TECNICA_TEXT_SEC));
        p1.setAlignment(Element.ALIGN_CENTER);
        inner.addElement(p1);

        Paragraph p2 = new Paragraph("(Usinagem & Puxador)", FontFactory.getFont(FontFactory.HELVETICA, 7, new Color(100, 116, 139)));
        p2.setAlignment(Element.ALIGN_CENTER);
        inner.addElement(p2);

        Paragraph p3 = new Paragraph("Área reservada para US-11.2", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 6, new Color(148, 163, 184)));
        p3.setAlignment(Element.ALIGN_CENTER);
        p3.setSpacingBefore(4f);
        inner.addElement(p3);

        container.addCell(inner);
        cell.addElement(container);
        return cell;
    }

    private PdfPCell criarCelulaEspecificacoesTecnicas(BudgetItem item) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setPadding(6f);
        cell.setVerticalAlignment(Element.ALIGN_TOP);

        String badgeTipo = formatarTipoTemplate(item.getTemplateType());
        cell.addElement(criarBadgePdf(badgeTipo, false));

        BigDecimal wCm = item.getWidthMm() != null ? item.getWidthMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal hCm = item.getHeightMm() != null ? item.getHeightMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        String dimStr = String.format(PT_BR, "%.1f x %.1f cm", wCm.doubleValue(), hCm.doubleValue());

        Paragraph pDim = new Paragraph(dimStr, FONTE_TECNICA_DIMENSAO);
        pDim.setLeading(12f);
        pDim.setSpacingBefore(3f);
        pDim.setSpacingAfter(3f);
        cell.addElement(pDim);

        String perfil = extrairNomeMaterialPorCategoria(item, MaterialCategoryType.PROFILE);
        Paragraph pPerfil = new Paragraph();
        pPerfil.setLeading(9f);
        pPerfil.add(new Chunk("Perfil: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COR_TECNICA_HEADER_BG)));
        pPerfil.add(new Chunk(perfil, FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COR_TECNICA_TEXT_SEC)));
        cell.addElement(pPerfil);

        String vidro = extrairNomeMaterialPorCategoria(item, MaterialCategoryType.GLASS);
        Paragraph pVidro = new Paragraph();
        pVidro.setLeading(9f);
        pVidro.add(new Chunk("Vidro: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COR_TECNICA_HEADER_BG)));
        pVidro.add(new Chunk(vidro, FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COR_TECNICA_TEXT_SEC)));
        cell.addElement(pVidro);

        Paragraph pFolga = new Paragraph();
        pFolga.setLeading(9f);
        pFolga.add(new Chunk("Folga: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COR_TECNICA_HEADER_BG)));
        pFolga.add(new Chunk(PADRAO, FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COR_TECNICA_TEXT_SEC)));
        cell.addElement(pFolga);

        return cell;
    }

    private PdfPCell criarCelulaDetalhamentoFuracao(BudgetItem item) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setPadding(6f);
        cell.setVerticalAlignment(Element.ALIGN_TOP);

        String tipoFuracao = extrairTipoFuracaoBadge(item.getTemplateType());
        cell.addElement(criarBadgePdf("FURAÇÃO (" + tipoFuracao + ")", true));

        List<String> linhasFuracao = gerarLinhasFuracao(item);
        for (String linha : linhasFuracao) {
            Paragraph p = new Paragraph("• " + linha, FONTE_TECNICA_TEXTO_SEC);
            p.setLeading(9f);
            cell.addElement(p);
        }

        Paragraph pEspaco = new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3));
        pEspaco.setLeading(3f);
        cell.addElement(pEspaco);

        cell.addElement(criarBadgePdf("PUXADOR", false));

        List<String> linhasPuxador = gerarLinhasPuxador(item);
        for (String linha : linhasPuxador) {
            Paragraph p = new Paragraph("• " + linha, FONTE_TECNICA_TEXTO_SEC);
            p.setLeading(9f);
            cell.addElement(p);
        }

        return cell;
    }

    private PdfPCell criarCelulaStatusCheckboxes() {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(COR_TECNICA_BORDA);
        cell.setPadding(4f);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPTable tableChecks = new PdfPTable(1);
        tableChecks.setWidthPercentage(90);

        tableChecks.addCell(criarItemCheckbox("Alum."));
        tableChecks.addCell(criarItemCheckbox("Vidro"));
        tableChecks.addCell(criarItemCheckbox("Mont."));

        cell.addElement(tableChecks);
        return cell;
    }

    private PdfPCell criarItemCheckbox(String label) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPaddingTop(3f);
        cell.setPaddingBottom(3f);

        PdfPTable boxTable = new PdfPTable(1);
        boxTable.setTotalWidth(14f);
        boxTable.setLockedWidth(true);
        PdfPCell boxCell = new PdfPCell();
        boxCell.setFixedHeight(14f);
        boxCell.setBorder(Rectangle.NO_BORDER);
        boxCell.setCellEvent(new CheckboxCellEvent());
        boxTable.addCell(boxCell);

        cell.addElement(boxTable);

        Paragraph pLabel = new Paragraph(label, FONTE_TECNICA_CHECKBOX_LABEL);
        pLabel.setAlignment(Element.ALIGN_CENTER);
        pLabel.setLeading(8f);
        pLabel.setSpacingBefore(1f);
        cell.addElement(pLabel);

        return cell;
    }

    private PdfPTable criarBadgePdf(String texto, boolean alert) {
        PdfPTable table = new PdfPTable(1);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.setSpacingAfter(3f);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(alert ? COR_TECNICA_BADGE_ALERT_BG : COR_TECNICA_BADGE_BG);
        cell.setBorderColor(alert ? new Color(252, 165, 165) : COR_TECNICA_BORDA);
        cell.setBorderWidth(0.5f);
        cell.setPadding(2f);
        cell.setPaddingLeft(4f);
        cell.setPaddingRight(4f);

        Paragraph p = new Paragraph(texto, alert ? FONTE_TECNICA_BADGE_ALERT : FONTE_TECNICA_BADGE);
        p.setLeading(8f);
        cell.addElement(p);

        table.addCell(cell);
        return table;
    }

    private String formatarTipoTemplate(String templateType) {
        if (templateType == null || templateType.isBlank()) {
            return "TIPO: SOB MEDIDA";
        }
        String clean = templateType.trim().toUpperCase(Locale.ROOT);
        if (clean.startsWith("TIPO:")) {
            clean = clean.substring(5).trim();
        }
        return switch (clean) {
            case "SWING_DOOR_1F", "SWING_1F", "SWING_1_LEAF", "SWING", "PIVOT_DOOR", "PIVOTING_DOOR", "GIRO", "PORTA_GIRO" -> "TIPO: GIRO";
            case "SWING_DOOR_2F", "SWING_2F", "SWING_2_LEAF" -> "TIPO: GIRO (2 FOLHAS)";
            case "SLIDING_DOOR_1F", "SLIDING_1F", "SLIDING_1_LEAF" -> "TIPO: CORRER (1 FOLHA)";
            case "SLIDING_DOOR_2F", "SLIDING_2F", "SLIDING_2_LEAF", "SLIDING_WINDOW_2F" -> "TIPO: CORRER (2 FOLHAS)";
            case "SLIDING_DOOR_3F", "SLIDING_3F", "SLIDING_3_LEAF" -> "TIPO: CORRER (3 FOLHAS)";
            case "SLIDING_DOOR_4F", "SLIDING_4F", "SLIDING_4_LEAF", "SLIDING_WINDOW_4F" -> "TIPO: CORRER (4 FOLHAS)";
            case "SLIDING_DOOR", "SLIDING", "CORRER", "PORTA_CORRER", "JANELA_CORRER" -> "TIPO: CORRER";
            case "AWNING_WINDOW_1F", "MAX_AR_WINDOW_1_LEAF", "MAXIM_AR_WINDOW", "MAXIM_AR", "TILT_WINDOW", "TILT", "BASCULANTE" -> "TIPO: BASCULANTE";
            case "AWNING_WINDOW_1F_INV", "MAX_AR_WINDOW_INVERSE_1_LEAF" -> "TIPO: BASCULANTE INVERTIDO";
            case "FRONT_DRAWER", "DRAWER_FRONT", "DRAWER", "GAVETA", "FRENTE DE GAVETA" -> "TIPO: FRENTE DE GAVETA";
            case "FIXED_PANEL", "FIXED_GLASS_FACADE", "FIXED", "FIXO" -> "TIPO: FIXO";
            case "GLASS_BOX_FRONTAL" -> "TIPO: BOX FRONTAL";
            case "GLASS_BOX_CORNER" -> "TIPO: BOX DE CANTO";
            default -> {
                TemplateType parsed = TemplateType.parse(clean);
                if (parsed != null) {
                    yield switch (parsed) {
                        case SWING_1_LEAF -> "TIPO: GIRO";
                        case SWING_2_LEAF -> "TIPO: GIRO (2 FOLHAS)";
                        case SLIDING_1_LEAF -> "TIPO: CORRER (1 FOLHA)";
                        case SLIDING_2_LEAF -> "TIPO: CORRER (2 FOLHAS)";
                        case SLIDING_3_LEAF -> "TIPO: CORRER (3 FOLHAS)";
                        case SLIDING_4_LEAF -> "TIPO: CORRER (4 FOLHAS)";
                        case MAX_AR_WINDOW_1_LEAF -> "TIPO: BASCULANTE";
                        case MAX_AR_WINDOW_INVERSE_1_LEAF -> "TIPO: BASCULANTE INVERTIDO";
                        case DRAWER_FRONT -> "TIPO: FRENTE DE GAVETA";
                        case FIXED_PANEL -> "TIPO: FIXO";
                    };
                }
                yield "TIPO: " + clean.replace('_', ' ');
            }
        };
    }

    private String extrairTipoFuracaoBadge(String templateType) {
        if (templateType == null || templateType.isBlank()) {
            return BADGE_PADRAO;
        }
        String clean = templateType.trim().toUpperCase(Locale.ROOT);
        if (clean.startsWith("TIPO:")) {
            clean = clean.substring(5).trim();
        }
        return switch (clean) {
            case "SWING_DOOR_1F", "SWING_DOOR_2F", "SWING_1F", "SWING_2F", "SWING_1_LEAF", "SWING_2_LEAF",
                 "SWING", "PIVOT_DOOR", "PIVOTING_DOOR", "GIRO", "PORTA_GIRO", "GIRO (2 FOLHAS)" -> "DOBRADIÇAS";
            case "SLIDING_DOOR_1F", "SLIDING_DOOR_2F", "SLIDING_DOOR_3F", "SLIDING_DOOR_4F",
                 "SLIDING_1F", "SLIDING_2F", "SLIDING_3F", "SLIDING_4F", "SLIDING_1_LEAF", "SLIDING_2_LEAF",
                 "SLIDING_3_LEAF", "SLIDING_4_LEAF", "SLIDING_DOOR", "SLIDING", "CORRER", "PORTA_CORRER",
                 "JANELA_CORRER", "SLIDING_WINDOW_2F", "SLIDING_WINDOW_4F", "GLASS_BOX_FRONTAL", "GLASS_BOX_CORNER",
                 "CORRER (1 FOLHA)", "CORRER (2 FOLHAS)", "CORRER (3 FOLHAS)", "CORRER (4 FOLHAS)" -> "ROLDANAS";
            case "AWNING_WINDOW_1F", "AWNING_WINDOW_1F_INV", "MAX_AR_WINDOW_1_LEAF", "MAX_AR_WINDOW_INVERSE_1_LEAF",
                 "MAXIM_AR_WINDOW", "MAXIM_AR", "TILT_WINDOW", "TILT", "BASCULANTE", "BASCULANTE INVERTIDO" -> "DOBRADIÇA/PISTÃO";
            case "FRONT_DRAWER", "DRAWER_FRONT", "DRAWER", "GAVETA", "FRENTE DE GAVETA" -> "FIXAÇÃO CAIXA";
            case "FIXED_PANEL", "FIXED_GLASS_FACADE", "FIXED", "FIXO" -> BADGE_PADRAO;
            default -> {
                TemplateType parsed = TemplateType.parse(clean);
                if (parsed != null) {
                    yield switch (parsed) {
                        case SWING_1_LEAF, SWING_2_LEAF -> "DOBRADIÇAS";
                        case SLIDING_1_LEAF, SLIDING_2_LEAF, SLIDING_3_LEAF, SLIDING_4_LEAF -> "ROLDANAS";
                        case MAX_AR_WINDOW_1_LEAF, MAX_AR_WINDOW_INVERSE_1_LEAF -> "DOBRADIÇA/PISTÃO";
                        case DRAWER_FRONT -> "FIXAÇÃO CAIXA";
                        case FIXED_PANEL -> BADGE_PADRAO;
                    };
                }
                yield BADGE_PADRAO;
            }
        };
    }

    private List<String> gerarLinhasFuracao(BudgetItem item) {
        List<String> linhas = extrairLinhasFuracaoJson(item.getDrillingConfig());
        if (linhas.isEmpty()) {
            linhas.addAll(obterLinhasFuracaoFallback(item.getTemplateType()));
        }
        return linhas;
    }

    private List<String> extrairLinhasFuracaoJson(String raw) {
        List<String> linhas = new ArrayList<>();
        if (raw == null || raw.isBlank() || "{}".equals(raw) || "NONE".equalsIgnoreCase(raw)) {
            return linhas;
        }
        try {
            JsonNode node = objectMapper.readTree(raw);
            if (node.has(KEY_DETAILS) && !node.get(KEY_DETAILS).isNull()) {
                linhas.add(node.get(KEY_DETAILS).asText());
            }
            if (node.has(KEY_HOLES_COUNT) && !node.get(KEY_HOLES_COUNT).isNull()) {
                linhas.add(node.get(KEY_HOLES_COUNT).asInt() + " furos previstos.");
            }
            if (node.has(KEY_POSITION) && !node.get(KEY_POSITION).isNull()) {
                linhas.add("Posição: " + node.get(KEY_POSITION).asText());
            }
        } catch (Exception e) {
            linhas.add(raw.trim());
        }
        return linhas;
    }

    private List<String> obterLinhasFuracaoFallback(String templateType) {
        String t = templateType != null ? templateType.toUpperCase(Locale.ROOT) : "";
        if (t.contains("GIRO") || t.contains("PIVOT") || t.contains("SWING")) {
            return List.of("3 furos para dobradiças.", "Distância dividida por igual.");
        }
        if (t.contains("CORRER") || t.contains("SLIDING") || t.contains("BOX")) {
            return List.of("Furação superior padrão.", "2 roldanas por folha.");
        }
        if (t.contains("BASCULANTE") || t.contains("TILT") || t.contains("AWNING") || t.contains("MAX")) {
            return List.of("Furação na travessa superior.", "Distância conforme gabarito.");
        }
        if (t.contains("GAVETA") || t.contains("DRAWER")) {
            return List.of("Furação interna fixação MDF.");
        }
        return List.of("Furação padrão de fábrica.", "Conforme gabarito do perfil.");
    }

    private List<String> gerarLinhasPuxador(BudgetItem item) {
        List<String> linhas = extrairLinhasPuxadorJson(item.getHandleConfig());
        if (linhas.isEmpty()) {
            linhas.addAll(obterLinhasPuxadorFallback(item));
        }
        return linhas;
    }

    private List<String> extrairLinhasPuxadorJson(String raw) {
        List<String> linhas = new ArrayList<>();
        if (raw == null || raw.isBlank() || "{}".equals(raw) || "NONE".equalsIgnoreCase(raw)) {
            return linhas;
        }
        try {
            JsonNode node = objectMapper.readTree(raw);
            if (node.has("type") || node.has(KEY_HANDLE_TYPE)) {
                String tipo = node.has(KEY_HANDLE_TYPE) ? node.get(KEY_HANDLE_TYPE).asText() : node.get("type").asText();
                linhas.add("Tipo: " + tipo);
            }
            if (node.has(KEY_FORMAT) && !node.get(KEY_FORMAT).isNull()) {
                linhas.add("Formato: " + node.get(KEY_FORMAT).asText());
            }
            if (node.has(KEY_POSITION) && !node.get(KEY_POSITION).isNull()) {
                linhas.add("Posição: " + node.get(KEY_POSITION).asText());
            }
        } catch (Exception e) {
            linhas.add("Configuração: " + raw.trim());
        }
        return linhas;
    }

    private List<String> obterLinhasPuxadorFallback(BudgetItem item) {
        String puxadorOpt = extrairNomeMaterialPorCategoria(item, MaterialCategoryType.HARDWARE);
        if (puxadorOpt != null && !puxadorOpt.equalsIgnoreCase(PADRAO) && !puxadorOpt.equalsIgnoreCase("Não informado")) {
            return List.of("Modelo: " + puxadorOpt, "Posição padrão centralizada.");
        }
        return List.of("Formato: Padrão do modelo.", "Posição: Lado de abertura.");
    }

    private String extrairNomeMaterialPorCategoria(BudgetItem item, MaterialCategoryType categoria) {
        if (item.getOptions() == null || item.getOptions().isEmpty()) {
            return PADRAO;
        }
        return item.getOptions().stream()
                .filter(opt -> opt.getCategoryType() == categoria)
                .map(opt -> {
                    if (opt.getSelectedColor() != null && !opt.getSelectedColor().isBlank()) {
                        return opt.getMaterialName() + " " + opt.getSelectedColor().trim();
                    }
                    return opt.getMaterialName();
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(PADRAO);
    }

    private static class BordaTracejada implements PdfPCellEvent {
        @Override
        public void cellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            PdfContentByte canvas = canvases[PdfPTable.LINECANVAS];
            canvas.saveState();
            canvas.setLineDash(new float[]{3f, 3f}, 0f);
            canvas.setColorStroke(COR_TECNICA_BORDA);
            canvas.setLineWidth(1f);
            canvas.roundRectangle(position.getLeft() + 2f, position.getBottom() + 2f,
                    position.getWidth() - 4f, position.getHeight() - 4f, 4f);
            canvas.stroke();
            canvas.restoreState();
        }
    }

    private static class CheckboxCellEvent implements PdfPCellEvent {
        @Override
        public void cellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            PdfContentByte canvas = canvases[PdfPTable.LINECANVAS];
            float tamanho = 14f;
            float x = position.getLeft() + (position.getWidth() - tamanho) / 2f;
            float y = position.getBottom() + (position.getHeight() - tamanho) / 2f;
            canvas.saveState();
            canvas.setColorStroke(COR_TECNICA_HEADER_BG);
            canvas.setLineWidth(1.5f);
            canvas.roundRectangle(x, y, tamanho, tamanho, 2f);
            canvas.stroke();
            canvas.restoreState();
        }
    }
}
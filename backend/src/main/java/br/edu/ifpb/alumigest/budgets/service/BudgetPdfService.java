package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.clients.domain.Client;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class BudgetPdfService {

    private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font FONTE_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font FONTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONTE_PEQUENA = FontFactory.getFont(FontFactory.HELVETICA, 8);

    private static final Color COR_CABECALHO_TABELA = new Color(20, 30, 50); // Azul escuro
    private static final Color COR_FUNDO_CLARO = new Color(247, 249, 252); // Fundo cinza/azul claro
    private static final Color COR_BORDA_CLARA = new Color(225, 230, 235); // Borda sutil

    private final CompanyProperties companyProps;

    public BudgetPdfService(CompanyProperties companyProps) {
        this.companyProps = companyProps;
    }

    public byte[] gerarPdfComercial(Budget budget) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            adicionarCabecalho(document, budget);

            adicionarDadosCliente(document, budget);
            document.add(new Paragraph(" "));

            adicionarTabelaItens(document, budget);
            document.add(new Paragraph(" "));

            adicionarFechamentoFinanceiro(document, budget);

            adicionarRodapeEAssinaturas(document, budget);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do orçamento: " + e.getMessage(), e);
        }
    }

    private void adicionarCabecalho(Document document, Budget budget) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // --- LINHA 1 (Topo) ---
        PdfPCell cellLogo = new PdfPCell();
        cellLogo.setBorder(Rectangle.NO_BORDER);
        try {
            Image logo = Image.getInstance(getClass().getResource("/static/logo-alumiportas.png"));
            logo.scaleToFit(120, 50);
            cellLogo.addElement(logo);
        } catch (Exception e) {
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

        // --- LINHA 2 (Base) ---
        Font fonteDadosEmpresa = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
        float respiroSuperior = 8f;

        PdfPCell cellDadosEmpresa = new PdfPCell();
        cellDadosEmpresa.setBorder(Rectangle.NO_BORDER);
        cellDadosEmpresa.setPaddingTop(respiroSuperior);

        cellDadosEmpresa.addElement(new Phrase("CNPJ: " + companyProps.getCnpj() + " - IE: " + companyProps.getInscricaoEstadual() + "\n", fonteDadosEmpresa));
        cellDadosEmpresa.addElement(new Phrase(companyProps.getEndereco() + "\n", fonteDadosEmpresa));
        cellDadosEmpresa.addElement(new Phrase(companyProps.getCidadeUf() + "\n", fonteDadosEmpresa));
        cellDadosEmpresa.addElement(new Phrase("Fone: " + companyProps.getTelefone() + "\n", fonteDadosEmpresa));
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
        divisoria.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(0.8f, 100f, Color.GRAY, Element.ALIGN_CENTER, 0f)));
        document.add(divisoria);
    }

    private String formatarNumero(BigDecimal valor) {
        if (valor == null) return "0,00";
        NumberFormat format = NumberFormat.getNumberInstance(new Locale("pt", "BR"));
        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);
        return format.format(valor);
    }

    private String formatarQuantidade(Integer qtd) {
        if (qtd == null) return "0,00";
        NumberFormat format = NumberFormat.getNumberInstance(new Locale("pt", "BR"));
        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);
        return format.format(qtd);
    }

    private void adicionarDadosCliente(Document document, Budget budget) throws DocumentException {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell cardCell = new PdfPCell();
        cardCell.setBackgroundColor(COR_FUNDO_CLARO);
        cardCell.setBorder(Rectangle.NO_BORDER);
        cardCell.setCellEvent(new BordaArredondada());
        cardCell.setPadding(15f);

        Font fonteLabel = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
        Font fonteTituloCard = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(105, 110, 120));

        Paragraph tituloCard = new Paragraph("DADOS DO CLIENTE", fonteTituloCard);
        tituloCard.setSpacingAfter(10f);
        cardCell.addElement(tituloCard);

        PdfPTable innerTable = new PdfPTable(2);
        innerTable.setWidthPercentage(100);

        String nome = obterDadoSeguro(budget.getClient() != null ? budget.getClient().getFullName() : null);
        String documento = obterDadoSeguro(budget.getClient() != null ? budget.getClient().getDocumentNumber() : null);
        String contato = obterDadoSeguro(budget.getClient() != null ? budget.getClient().getPhone() : null);
        String endereco = formatarEnderecoCompleto(budget.getClient());

        PdfPCell cellEsq = new PdfPCell();
        cellEsq.setBorder(Rectangle.NO_BORDER);
        cellEsq.addElement(new Phrase("NOME / RAZÃO SOCIAL\n", fonteLabel));
        cellEsq.addElement(new Phrase(nome + "\n\n", FONTE_NEGRITO));
        cellEsq.addElement(new Phrase("ENDEREÇO\n", fonteLabel));
        cellEsq.addElement(new Phrase(endereco, FONTE_NORMAL));
        innerTable.addCell(cellEsq);

        PdfPCell cellDir = new PdfPCell();
        cellDir.setBorder(Rectangle.NO_BORDER);
        cellDir.addElement(new Phrase("DOCUMENTO (CPF/CNPJ)\n", fonteLabel));
        cellDir.addElement(new Phrase(documento + "\n\n", FONTE_NEGRITO));
        cellDir.addElement(new Phrase("CONTATO\n", fonteLabel));
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

        String[] cabecalhos = {"PRODUTO / DESCRIÇÃO TÉCNICA", "QTD", "V. UNIT (R$)", "TOTAL (R$)"};
        for (int i = 0; i < cabecalhos.length; i++) {
            PdfPCell header = new PdfPCell(new Phrase(cabecalhos[i], FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
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

        Font fonteDescricaoSecundaria = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));

        if (budget.getItems() != null) {
            for (BudgetItem item : budget.getItems()) {

                Phrase phraseDescricao = new Phrase();

                phraseDescricao.add(new Chunk(obterDadoSeguro(item.getProductName()) + "\n", FONTE_NORMAL));

                BigDecimal wCm = item.getWidthMm() != null ? item.getWidthMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                BigDecimal hCm = item.getHeightMm() != null ? item.getHeightMm().divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                phraseDescricao.add(new Chunk("L=" + wCm + "cm x A=" + hCm + "cm\n", fonteDescricaoSecundaria));

                if (item.getOptions() != null && !item.getOptions().isEmpty()) {
                    for (var option : item.getOptions()) {
                        String categoria = option.getCategoryType() != null ? option.getCategoryType().toString() : "Item";
                        String material = option.getMaterialName() != null ? option.getMaterialName() : "";
                        String cor = (option.getSelectedColor() != null && !option.getSelectedColor().trim().isEmpty())
                                ? " " + option.getSelectedColor() : "";

                        String textoOpcao = categoria + ": " + material + cor;
                        phraseDescricao.add(new Chunk(textoOpcao + "\n", fonteDescricaoSecundaria));
                    }
                }

                if (item.getLaborCost() != null && item.getLaborCost().compareTo(BigDecimal.ZERO) > 0) {
                    phraseDescricao.add(new Chunk("Mão de Obra: " + formatarMoeda(item.getLaborCost()) + "\n", fonteDescricaoSecundaria));
                }

                if (item.getHandleConfig() != null && !item.getHandleConfig().trim().isEmpty()) {
                    phraseDescricao.add(new Chunk("\n", fonteDescricaoSecundaria));

                    Chunk tag = new Chunk(" " + item.getHandleConfig().trim() + " ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(80, 85, 90)));
                    tag.setBackground(new Color(230, 235, 240));
                    phraseDescricao.add(tag);
                    phraseDescricao.add(new Chunk("\n"));
                }

                PdfPTable innerDescTable = new PdfPTable(2);
                innerDescTable.setWidthPercentage(100);
                innerDescTable.setWidths(new float[]{1f, 4f});

                PdfPCell cellImagePlaceholder = new PdfPCell();
                cellImagePlaceholder.setBorder(Rectangle.NO_BORDER);

                PdfPCell cellTextDesc = new PdfPCell(phraseDescricao);
                cellTextDesc.setBorder(Rectangle.NO_BORDER);
                cellTextDesc.setPaddingLeft(5f);

                innerDescTable.addCell(cellImagePlaceholder);
                innerDescTable.addCell(cellTextDesc);

                PdfPCell cellDesc = new PdfPCell(innerDescTable);
                cellDesc.setPadding(10f);
                cellDesc.setPaddingLeft(0f);
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
        table.setWidths(new float[]{5f, 5f});

        Font fonteLabel = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
        Font fonteValor = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

        adicionarLinhaTotal(table, "Subtotal de Produtos", formatarMoeda(budget.getSubtotal()), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);

        // TODO: Substituir BigDecimal.ZERO pelo método real do budget quando os campos forem criados na entidade Budget.
        BigDecimal valorFrete = BigDecimal.ZERO;
        BigDecimal valorInstalacao = BigDecimal.ZERO;

        if (valorFrete.compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotal(table, "Frete", formatarMoeda(valorFrete), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
        }

        if (valorInstalacao.compareTo(BigDecimal.ZERO) > 0) {
            adicionarLinhaTotal(table, "Taxa de Instalação", formatarMoeda(valorInstalacao), fonteLabel, fonteValor, COR_FUNDO_CLARO, false);
        }

        BigDecimal descontoValor = budget.getDiscountValue() != null ? budget.getDiscountValue() : BigDecimal.ZERO;
        String textoDesconto = descontoValor.compareTo(BigDecimal.ZERO) > 0
                ? "- " + formatarMoeda(descontoValor)
                : formatarMoeda(descontoValor);

        adicionarLinhaTotal(table, "Desconto", textoDesconto, fonteLabel, fonteValor, COR_FUNDO_CLARO, false);

        Font fonteTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
        adicionarLinhaTotal(table, "TOTAL A PAGAR", formatarMoeda(budget.getTotal()), fonteTotal, fonteTotal, COR_CABECALHO_TABELA, true);

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
        document.add(new Paragraph("\n\n\n"));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPCell cellLinha = new PdfPCell(new Phrase("____________________________________________________"));
        cellLinha.setBorder(Rectangle.NO_BORDER);
        cellLinha.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cellLinha);

        PdfPCell cellAssinatura = new PdfPCell(new Phrase("Assinatura do Cliente\nConfirmo a aprovação das medidas e especificações acima.", FONTE_PEQUENA));
        cellAssinatura.setBorder(Rectangle.NO_BORDER);
        cellAssinatura.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cellAssinatura);

        document.add(table);

        document.add(new Paragraph("\nINFORMAÇÕES COMPLEMENTARES:", FONTE_NEGRITO));
        if (budget.getPaymentCondition() != null) {
            document.add(new Paragraph("- Condição de Pagamento: " + budget.getPaymentCondition().getDescricao(), FONTE_PEQUENA));
        }
        document.add(new Paragraph("- Valores expressos em Reais (R$).", FONTE_PEQUENA));
        document.add(new Paragraph("- Por se tratar de produto feito sob medida, não aceitamos devoluções após o início da produção.", FONTE_PEQUENA));
    }

    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) return "R$ 0,00";
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(valor);
    }

    private String formatarData(OffsetDateTime data) {
        if (data == null) return "";
        return data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String obterDadoSeguro(String dado) {
        return (dado != null && !dado.trim().isEmpty()) ? dado : "Não informado";
    }

    private String formatarEnderecoCompleto(Client client) {
        if (client == null) return "Não informado";

        StringBuilder endereco = new StringBuilder();

        if (client.getStreet() != null && !client.getStreet().trim().isEmpty()) {
            endereco.append(client.getStreet());

            if (client.getNumber() != null && !client.getNumber().trim().isEmpty()) {
                endereco.append(", ").append(client.getNumber());
            }
            if (client.getNeighborhood() != null && !client.getNeighborhood().trim().isEmpty()) {
                endereco.append(" - ").append(client.getNeighborhood());
            }
            if (client.getCity() != null && !client.getCity().trim().isEmpty()) {
                endereco.append(", ").append(client.getCity());
                if (client.getState() != null && !client.getState().trim().isEmpty()) {
                    endereco.append("/").append(client.getState());
                }
            }
        }

        String resultado = endereco.toString().trim();
        return resultado.isEmpty() ? "Não informado" : resultado;
    }

    class BordaArredondada implements com.lowagie.text.pdf.PdfPCellEvent {
        public void cellLayout(PdfPCell cell, Rectangle position, com.lowagie.text.pdf.PdfContentByte[] canvases) {
            com.lowagie.text.pdf.PdfContentByte canvas = canvases[com.lowagie.text.pdf.PdfPTable.LINECANVAS];
            canvas.roundRectangle(position.getLeft(), position.getBottom(), position.getWidth(), position.getHeight(), 6f);
            canvas.setColorStroke(COR_BORDA_CLARA);
            canvas.setLineWidth(1f);
            canvas.stroke();
        }
    }
}
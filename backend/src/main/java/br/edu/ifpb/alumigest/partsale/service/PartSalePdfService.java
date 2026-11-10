package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleItem;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.service.pdf.PartSalePdfPageEvent;
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
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URL;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável pela geração do Orçamento / Pedido de Venda Avulsa de Partes em PDF (A4).
 * US-46.4 — Geração e Exportação do Orçamento em PDF A4 (#530).
 */
@Service
public class PartSalePdfService {

  private static final Logger log = LoggerFactory.getLogger(PartSalePdfService.class);

  private static final Locale PT_BR = Locale.of("pt", "BR");
  private static final ZoneId ZONE_SAO_PAULO = ZoneId.of("America/Sao_Paulo");
  private static final DateTimeFormatter FORMATTER_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
  private static final Font FONTE_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
  private static final Font FONTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
  private static final Font FONTE_PEQUENA = FontFactory.getFont(FontFactory.HELVETICA, 8);
  private static final Font FONTE_DADOS_EMPRESA =
      FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(105, 110, 120));
  private static final Font FONTE_LABEL_CARD =
      FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(105, 110, 120));
  private static final Font FONTE_TITULO_CARD =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(105, 110, 120));
  private static final Font FONTE_CABECALHO_TABELA =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
  private static final Font FONTE_TOTAL_LABEL =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
  private static final Font FONTE_TOTAL_VALOR =
      FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.WHITE);

  private static final Color COR_CABECALHO_TABELA = new Color(20, 30, 50);
  private static final Color COR_FUNDO_CLARO = new Color(247, 249, 252);
  private static final Color COR_BORDA_CLARA = new Color(225, 230, 235);
  private static final Color COR_TOTAL_BG = new Color(15, 25, 45);

  private static final String NAO_INFORMADO = "Não informado";
  private static final String CLIENTE_BALCAO_PADRAO = "Cliente Balcão (Consumidor Final)";
  private static final String LABEL_TOTAL_LIQUIDO = "TOTAL LÍQUIDO";

  private static final String COLUNA_INDICE = "#";
  private static final String COLUNA_LARGURA = "LARGURA";
  private static final String COLUNA_ALTURA = "ALTURA";
  private static final String COLUNA_AREA_FAT = "ÁREA FAT.";
  private static final String COLUNA_QTD = "QTD";
  private static final String COLUNA_V_UNIT = "V. UNIT";
  private static final String COLUNA_TOTAL = "TOTAL";
  private static final String SUFIXO_M2 = " m²";

  private static final String SECAO_VIDROS = "VIDROS (COBRANÇA EM M²)";
  private static final String SECAO_PERFIS = "PERFIS DE ALUMÍNIO (METRO LINEAR)";
  private static final String SECAO_FERRAGENS = "FERRAGENS E ACESSÓRIOS (POR UNIDADE)";
  private static final String SECAO_PELICULAS = "PELÍCULAS (COBRANÇA EM M²)";

  private final CompanyProperties companyProps;

  public PartSalePdfService(CompanyProperties companyProps) {
    this.companyProps = companyProps;
  }

  /**
   * Gera o PDF A4 diagramado da venda avulsa de partes.
   *
   * @param partSale entidade ou objeto transiente da venda de partes
   * @param client cliente associado à venda (pode ser nulo ou balcão)
   * @return array de bytes contendo o documento PDF
   */
  public byte[] generatePdf(PartSale partSale, Client client) {
    Objects.requireNonNull(partSale, "A venda de partes não pode ser nula para geração do PDF.");
    if (partSale.getItems() == null || partSale.getItems().isEmpty()) {
      throw new BusinessException("A venda não possui itens para geração do documento PDF.");
    }

    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      try (Document document = new Document(PageSize.A4, 36, 36, 54, 54)) {
        PdfWriter writer = PdfWriter.getInstance(document, outputStream);

        String nomeCliente = resolverNomeCliente(client);
        String razaoSocial = obterDadoSeguro(companyProps.getRazaoSocial());

        PartSalePdfPageEvent pageEvent = new PartSalePdfPageEvent(
            partSale.getCode(), nomeCliente, razaoSocial);
        writer.setPageEvent(pageEvent);

        document.open();

        adicionarCabecalho(document, partSale);
        document.add(espacamento(8f));

        adicionarDadosCliente(document, client);
        document.add(espacamento(10f));

        adicionarTabelasModularesItens(document, partSale.getItems());
        document.add(espacamento(10f));

        adicionarResumoFinanceiro(document, partSale);
        document.add(espacamento(8f));

        adicionarCondicoesComerciais(document);
        adicionarBlocoAssinaturas(document);
      }
      return outputStream.toByteArray();
    } catch (DocumentException | IOException e) {
      log.error("Erro ao gerar PDF da venda avulsa {}: {}", partSale.getCode(), e.getMessage(), e);
      throw new BusinessException(
          "Erro ao gerar documento PDF da venda avulsa: " + e.getMessage(), e);
    }
  }

  // =========================================================================
  // Cabeçalho Corporativo e Identificação do Documento
  // =========================================================================

  private void adicionarCabecalho(Document document, PartSale partSale) throws DocumentException {
    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(100);
    table.setWidths(new float[]{60f, 40f});

    // Célula logotipo / razão social (esquerda)
    PdfPCell cellLogo = criarCelulaLogo();
    table.addCell(cellLogo);

    // Célula título do documento (direita)
    PdfPCell cellTitulo = new PdfPCell();
    cellTitulo.setBorder(Rectangle.NO_BORDER);
    cellTitulo.setHorizontalAlignment(Element.ALIGN_RIGHT);
    cellTitulo.setVerticalAlignment(Element.ALIGN_MIDDLE);

    Paragraph docLabel = new Paragraph("ORÇAMENTO / VENDA DE PARTES", FONTE_PEQUENA);
    docLabel.setAlignment(Element.ALIGN_RIGHT);
    cellTitulo.addElement(docLabel);

    Paragraph codigoVenda = new Paragraph("#" + obterDadoSeguro(partSale.getCode()), FONTE_TITULO);
    codigoVenda.setAlignment(Element.ALIGN_RIGHT);
    cellTitulo.addElement(codigoVenda);
    table.addCell(cellTitulo);

    // Linha 2: dados da empresa (esquerda) | metadados da venda (direita)
    float respiroSuperior = 8f;

    PdfPCell cellDadosEmpresa = new PdfPCell();
    cellDadosEmpresa.setBorder(Rectangle.NO_BORDER);
    cellDadosEmpresa.setPaddingTop(respiroSuperior);

    String cnpjIe = "CNPJ: " + obterDadoSeguro(companyProps.getCnpj());
    if (textoNaoVazio(companyProps.getInscricaoEstadual())) {
      cnpjIe += " - IE: " + companyProps.getInscricaoEstadual().trim();
    }
    cellDadosEmpresa.addElement(new Phrase(cnpjIe + "\n", FONTE_DADOS_EMPRESA));
    cellDadosEmpresa.addElement(
        new Phrase(obterDadoSeguro(companyProps.getEndereco()) + "\n", FONTE_DADOS_EMPRESA));
    cellDadosEmpresa.addElement(
        new Phrase(obterDadoSeguro(companyProps.getCidadeUf()) + "\n", FONTE_DADOS_EMPRESA));
    cellDadosEmpresa.addElement(
        new Phrase("Fone: " + obterDadoSeguro(companyProps.getTelefone()) + "\n",
            FONTE_DADOS_EMPRESA));
    table.addCell(cellDadosEmpresa);

    PdfPCell cellMetadados = new PdfPCell();
    cellMetadados.setBorder(Rectangle.NO_BORDER);
    cellMetadados.setPaddingTop(respiroSuperior);
    cellMetadados.setHorizontalAlignment(Element.ALIGN_RIGHT);

    String dataEmissao = formatarData(partSale.getCreatedAt());
    Paragraph emissao = new Paragraph("Data de Emissão: " + dataEmissao, FONTE_NORMAL);
    emissao.setAlignment(Element.ALIGN_RIGHT);
    cellMetadados.addElement(emissao);

    String statusDescricao = formatarStatus(partSale.getStatus());
    Paragraph status = new Paragraph("Status: " + statusDescricao, FONTE_NEGRITO);
    status.setAlignment(Element.ALIGN_RIGHT);
    cellMetadados.addElement(status);
    table.addCell(cellMetadados);

    document.add(table);

    Paragraph divisoria = new Paragraph();
    divisoria.setSpacingBefore(10f);
    divisoria.setSpacingAfter(12f);
    divisoria.add(new Chunk(new LineSeparator(0.8f, 100f, Color.GRAY, Element.ALIGN_CENTER, 0f)));
    document.add(divisoria);
  }

  private PdfPCell criarCelulaLogo() {
    PdfPCell cellLogo = new PdfPCell();
    cellLogo.setBorder(Rectangle.NO_BORDER);

    String razaoSocial = obterDadoSeguro(companyProps.getRazaoSocial());
    URL logoUrl = getClass().getResource("/static/images/logo.png");
    if (logoUrl != null) {
      try {
        Image logo = Image.getInstance(logoUrl);
        logo.scaleToFit(140f, 45f);
        cellLogo.addElement(logo);
        return cellLogo;
      } catch (DocumentException | IOException e) {
        log.warn("Erro ao carregar logotipo para o PDF da venda de partes: {}", e.getMessage());
      }
    }
    cellLogo.addElement(new Paragraph(razaoSocial, FONTE_TITULO));
    return cellLogo;
  }

  // =========================================================================
  // Dados do Cliente
  // =========================================================================

  private void adicionarDadosCliente(Document document, Client client) throws DocumentException {
    PdfPTable cardTable = new PdfPTable(1);
    cardTable.setWidthPercentage(100);

    PdfPCell cardCell = criarCelulaCarta();

    Paragraph titulo = new Paragraph("DADOS DO CLIENTE / DESTINATÁRIO", FONTE_TITULO_CARD);
    titulo.setSpacingAfter(8f);
    cardCell.addElement(titulo);

    PdfPTable innerTable = new PdfPTable(2);
    innerTable.setWidthPercentage(100);
    innerTable.setWidths(new float[]{65f, 35f});

    PdfPCell cellEsq = new PdfPCell();
    cellEsq.setBorder(Rectangle.NO_BORDER);

    String nome = resolverNomeCliente(client);
    cellEsq.addElement(new Phrase("NOME / RAZÃO SOCIAL\n", FONTE_LABEL_CARD));
    cellEsq.addElement(new Phrase(nome + "\n\n", FONTE_NEGRITO));

    String endereco = formatarEnderecoCliente(client);
    if (!endereco.isBlank()) {
      cellEsq.addElement(new Phrase("ENDEREÇO\n", FONTE_LABEL_CARD));
      cellEsq.addElement(new Phrase(endereco, FONTE_NORMAL));
    }
    innerTable.addCell(cellEsq);

    PdfPCell cellDir = new PdfPCell();
    cellDir.setBorder(Rectangle.NO_BORDER);

    String doc = obterCampoClienteSeguro(client != null ? client.getDocumentNumber() : null);
    cellDir.addElement(new Phrase("CPF / CNPJ\n", FONTE_LABEL_CARD));
    cellDir.addElement(new Phrase(doc + "\n\n", FONTE_NEGRITO));

    String fone = obterCampoClienteSeguro(client != null ? client.getPhone() : null);
    cellDir.addElement(new Phrase("TELEFONE\n", FONTE_LABEL_CARD));
    cellDir.addElement(new Phrase(fone, FONTE_NORMAL));
    innerTable.addCell(cellDir);

    cardCell.addElement(innerTable);
    cardTable.addCell(cardCell);
    document.add(cardTable);
  }

  // =========================================================================
  // Tabelas Modulares por Categoria
  // =========================================================================

  private void adicionarTabelasModularesItens(Document document, List<PartSaleItem> items)
      throws DocumentException {
    List<PartSaleItem> vidros = filtrarPorCategoria(items, MaterialCategoryType.GLASS);
    if (!vidros.isEmpty()) {
      adicionarTabelaPorArea(document, vidros, SECAO_VIDROS, "DESCRIÇÃO DO VIDRO");
      document.add(espacamento(8f));
    }

    List<PartSaleItem> perfis = filtrarPorCategoria(items, MaterialCategoryType.PROFILE);
    if (!perfis.isEmpty()) {
      adicionarTabelaPerfis(document, perfis);
      document.add(espacamento(8f));
    }

    List<PartSaleItem> ferragens = items.stream()
        .filter(it -> it.getMaterialType() == MaterialCategoryType.HARDWARE
            || it.getMaterialType() == MaterialCategoryType.ROLLERS)
        .toList();
    if (!ferragens.isEmpty()) {
      adicionarTabelaFerragens(document, ferragens);
      document.add(espacamento(8f));
    }

    List<PartSaleItem> peliculas = filtrarPorCategoria(items, MaterialCategoryType.FILM);
    if (!peliculas.isEmpty()) {
      adicionarTabelaPorArea(document, peliculas, SECAO_PELICULAS, "DESCRIÇÃO DA PELÍCULA");
      document.add(espacamento(8f));
    }
  }

  private List<PartSaleItem> filtrarPorCategoria(
      List<PartSaleItem> items, MaterialCategoryType category) {
    return items.stream()
        .filter(it -> it.getMaterialType() == category)
        .toList();
  }

  private void adicionarTabelaPorArea(
      Document document,
      List<PartSaleItem> itens,
      String tituloSecao,
      String colunaDescricao
  ) throws DocumentException {
    Paragraph titulo = new Paragraph(tituloSecao, FONTE_TITULO_CARD);
    titulo.setSpacingAfter(6f);
    document.add(titulo);

    PdfPTable table = new PdfPTable(8);
    table.setWidthPercentage(100);
    table.setWidths(new float[]{0.6f, 3.4f, 1.2f, 1.2f, 1.3f, 0.7f, 1.4f, 1.6f});
    table.setHeaderRows(1);

    String[] headers = {
        COLUNA_INDICE,
        colunaDescricao,
        COLUNA_LARGURA,
        COLUNA_ALTURA,
        COLUNA_AREA_FAT,
        COLUNA_QTD,
        COLUNA_V_UNIT,
        COLUNA_TOTAL
    };
    adicionarCabecalhoTabela(table, headers);

    for (int i = 0; i < itens.size(); i++) {
      PartSaleItem it = itens.get(i);
      Color bg = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

      adicionarCelula(table, String.valueOf(i + 1), FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, obterDadoSeguro(it.getDescription()), FONTE_NEGRITO, bg, Element.ALIGN_LEFT);
      adicionarCelula(
          table, formatarMilimetros(it.getWidthMm()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMilimetros(it.getHeightMm()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMetragem(it.getCalculatedUnitMeasure(), SUFIXO_M2),
          FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, String.valueOf(it.getQuantity()), FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, formatarMoeda(it.getUnitPrice()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMoeda(it.getTotalPrice()), FONTE_NEGRITO, bg, Element.ALIGN_RIGHT);
    }

    document.add(table);
  }

  private void adicionarTabelaPerfis(Document document, List<PartSaleItem> perfis)
      throws DocumentException {
    Paragraph titulo = new Paragraph(SECAO_PERFIS, FONTE_TITULO_CARD);
    titulo.setSpacingAfter(6f);
    document.add(titulo);

    PdfPTable table = new PdfPTable(7);
    table.setWidthPercentage(100);
    table.setWidths(new float[]{0.6f, 3.8f, 1.4f, 1.4f, 0.8f, 1.5f, 1.7f});
    table.setHeaderRows(1);

    String[] headers = {
        COLUNA_INDICE,
        "DESCRIÇÃO DO PERFIL",
        "COMPRIMENTO",
        "METROS FAT.",
        COLUNA_QTD,
        "V. UNIT/M",
        COLUNA_TOTAL
    };
    adicionarCabecalhoTabela(table, headers);

    for (int i = 0; i < perfis.size(); i++) {
      PartSaleItem it = perfis.get(i);
      Color bg = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

      adicionarCelula(table, String.valueOf(i + 1), FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, obterDadoSeguro(it.getDescription()), FONTE_NEGRITO, bg, Element.ALIGN_LEFT);
      adicionarCelula(
          table, formatarMilimetros(it.getHeightMm()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMetragem(it.getCalculatedUnitMeasure(), " m"),
          FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, String.valueOf(it.getQuantity()), FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, formatarMoeda(it.getUnitPrice()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMoeda(it.getTotalPrice()), FONTE_NEGRITO, bg, Element.ALIGN_RIGHT);
    }

    document.add(table);
  }

  private void adicionarTabelaFerragens(Document document, List<PartSaleItem> ferragens)
      throws DocumentException {
    Paragraph titulo = new Paragraph(SECAO_FERRAGENS, FONTE_TITULO_CARD);
    titulo.setSpacingAfter(6f);
    document.add(titulo);

    // Critério 4: Sem colunas de medidas físicas em branco! Apenas quantidade inteira e valores.
    PdfPTable table = new PdfPTable(5);
    table.setWidthPercentage(100);
    table.setWidths(new float[]{0.8f, 5.2f, 1.4f, 1.8f, 1.8f});
    table.setHeaderRows(1);

    String[] headers = {
        COLUNA_INDICE, "DESCRIÇÃO DO COMPONENTE", "QUANTIDADE", "V. UNIT (R$)", "TOTAL (R$)"
    };
    adicionarCabecalhoTabela(table, headers);

    for (int i = 0; i < ferragens.size(); i++) {
      PartSaleItem it = ferragens.get(i);
      Color bg = (i % 2 == 0) ? Color.WHITE : COR_FUNDO_CLARO;

      adicionarCelula(table, String.valueOf(i + 1), FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, obterDadoSeguro(it.getDescription()), FONTE_NEGRITO, bg, Element.ALIGN_LEFT);
      adicionarCelula(table, it.getQuantity() + " UN", FONTE_NORMAL, bg, Element.ALIGN_CENTER);
      adicionarCelula(
          table, formatarMoeda(it.getUnitPrice()), FONTE_NORMAL, bg, Element.ALIGN_RIGHT);
      adicionarCelula(
          table, formatarMoeda(it.getTotalPrice()), FONTE_NEGRITO, bg, Element.ALIGN_RIGHT);
    }

    document.add(table);
  }

  // =========================================================================
  // Resumo Financeiro
  // =========================================================================

  private void adicionarResumoFinanceiro(Document document, PartSale partSale)
      throws DocumentException {
    PdfPTable outerTable = new PdfPTable(2);
    outerTable.setWidthPercentage(100);
    outerTable.setWidths(new float[]{45f, 55f});

    PdfPCell vazia = new PdfPCell();
    vazia.setBorder(Rectangle.NO_BORDER);
    outerTable.addCell(vazia);

    PdfPTable totaisTable = new PdfPTable(2);
    totaisTable.setWidthPercentage(100);
    totaisTable.setWidths(new float[]{55f, 45f});

    adicionarLinhaTotais(
        totaisTable, "Subtotal Bruto", formatarMoeda(partSale.getSubtotalAmount()));

    if (partSale.getDiscountAmount() != null
        && partSale.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
      adicionarLinhaTotais(
          totaisTable,
          "Desconto Concedido",
          "- " + formatarMoeda(partSale.getDiscountAmount())
      );
    }

    PdfPCell labelTotal = new PdfPCell(new Phrase(LABEL_TOTAL_LIQUIDO, FONTE_TOTAL_LABEL));
    labelTotal.setBackgroundColor(COR_TOTAL_BG);
    labelTotal.setBorder(Rectangle.NO_BORDER);
    labelTotal.setPaddingLeft(10f);
    labelTotal.setPaddingTop(8f);
    labelTotal.setPaddingBottom(8f);
    totaisTable.addCell(labelTotal);

    PdfPCell valorTotal = new PdfPCell(
        new Phrase(formatarMoeda(partSale.getTotalAmount()), FONTE_TOTAL_VALOR));
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

  private void adicionarLinhaTotais(PdfPTable table, String label, String valor) {
    PdfPCell labelCell = new PdfPCell(new Phrase(label, FONTE_NORMAL));
    labelCell.setBorder(Rectangle.BOTTOM);
    labelCell.setBorderColor(COR_BORDA_CLARA);
    labelCell.setPadding(5f);
    labelCell.setPaddingLeft(10f);
    table.addCell(labelCell);

    PdfPCell valorCell = new PdfPCell(new Phrase(valor, FONTE_NORMAL));
    valorCell.setBorder(Rectangle.BOTTOM);
    valorCell.setBorderColor(COR_BORDA_CLARA);
    valorCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    valorCell.setPadding(5f);
    valorCell.setPaddingRight(10f);
    table.addCell(valorCell);
  }

  // =========================================================================
  // Condições Comerciais e Assinaturas
  // =========================================================================

  private void adicionarCondicoesComerciais(Document document) throws DocumentException {
    PdfPTable cardTable = new PdfPTable(1);
    cardTable.setWidthPercentage(100);

    PdfPCell cardCell = criarCelulaCarta();

    Paragraph titulo = new Paragraph("INFORMAÇÕES E CONDIÇÕES DE FORNECIMENTO", FONTE_TITULO_CARD);
    titulo.setSpacingAfter(4f);
    cardCell.addElement(titulo);

    Paragraph condicoes = new Paragraph(
        "• Validade da proposta: 15 dias a contar da data de emissão.\n"
            + "• Condições de corte: medidas executadas conforme projeto "
            + "com tolerâncias industriais normatizadas.\n"
            + "• A retirada das peças cortadas deve ser acompanhada para conferência visual.",
        FONTE_PEQUENA
    );
    cardCell.addElement(condicoes);

    cardTable.addCell(cardCell);
    document.add(cardTable);
  }

  private void adicionarBlocoAssinaturas(Document document) throws DocumentException {
    document.add(espacamento(20f));

    PdfPTable table = new PdfPTable(3);
    table.setWidthPercentage(90);
    table.setWidths(new float[]{45f, 10f, 45f});
    table.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.setKeepTogether(true);

    // Assinatura do Cliente
    PdfPCell cellCliente = new PdfPCell();
    cellCliente.setBorder(Rectangle.TOP);
    cellCliente.setBorderColor(COR_CABECALHO_TABELA);
    cellCliente.setBorderWidthTop(1f);
    cellCliente.setPaddingTop(6f);
    cellCliente.setHorizontalAlignment(Element.ALIGN_CENTER);

    Paragraph nomeClientePara = new Paragraph("Assinatura do Cliente / Comprador", FONTE_NEGRITO);
    nomeClientePara.setAlignment(Element.ALIGN_CENTER);
    cellCliente.addElement(nomeClientePara);

    Paragraph descClientePara = new Paragraph(
        "Confirmo as quantidades e especificações acima", FONTE_PEQUENA);
    descClientePara.setAlignment(Element.ALIGN_CENTER);
    cellCliente.addElement(descClientePara);
    table.addCell(cellCliente);

    // Espaço intermediário
    PdfPCell cellEspaco = new PdfPCell();
    cellEspaco.setBorder(Rectangle.NO_BORDER);
    table.addCell(cellEspaco);

    // Assinatura da Empresa
    PdfPCell cellEmpresa = new PdfPCell();
    cellEmpresa.setBorder(Rectangle.TOP);
    cellEmpresa.setBorderColor(COR_CABECALHO_TABELA);
    cellEmpresa.setBorderWidthTop(1f);
    cellEmpresa.setPaddingTop(6f);
    cellEmpresa.setHorizontalAlignment(Element.ALIGN_CENTER);

    Paragraph nomeEmpresaPara = new Paragraph(
        obterDadoSeguro(companyProps.getRazaoSocial()), FONTE_NEGRITO);
    nomeEmpresaPara.setAlignment(Element.ALIGN_CENTER);
    cellEmpresa.addElement(nomeEmpresaPara);

    Paragraph descEmpresaPara = new Paragraph("Responsável Técnico / Vendas", FONTE_PEQUENA);
    descEmpresaPara.setAlignment(Element.ALIGN_CENTER);
    cellEmpresa.addElement(descEmpresaPara);
    table.addCell(cellEmpresa);

    document.add(table);
  }

  // =========================================================================
  // Utilitários de Formatação
  // =========================================================================

  private void adicionarCabecalhoTabela(PdfPTable table, String[] cabecalhos) {
    for (String cab : cabecalhos) {
      PdfPCell header = new PdfPCell(new Phrase(cab, FONTE_CABECALHO_TABELA));
      header.setBackgroundColor(COR_CABECALHO_TABELA);
      header.setBorder(Rectangle.NO_BORDER);
      header.setPadding(6f);
      header.setHorizontalAlignment(Element.ALIGN_CENTER);
      table.addCell(header);
    }
  }

  private void adicionarCelula(
      PdfPTable table, String texto, Font fonte, Color bgColor, int alinhamento) {
    PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "", fonte));
    cell.setBackgroundColor(bgColor);
    cell.setBorder(Rectangle.BOTTOM);
    cell.setBorderColor(COR_BORDA_CLARA);
    cell.setPadding(5f);
    cell.setHorizontalAlignment(alinhamento);
    table.addCell(cell);
  }

  private PdfPCell criarCelulaCarta() {
    PdfPCell cell = new PdfPCell();
    cell.setBackgroundColor(COR_FUNDO_CLARO);
    cell.setBorder(Rectangle.BOX);
    cell.setBorderColor(COR_BORDA_CLARA);
    cell.setBorderWidth(0.5f);
    cell.setPadding(10f);
    return cell;
  }

  private Paragraph espacamento(float size) {
    Paragraph p = new Paragraph(" ");
    p.setSpacingAfter(size);
    return p;
  }

  private String resolverNomeCliente(Client client) {
    if (client != null && textoNaoVazio(client.getFullName())) {
      return client.getFullName().trim();
    }
    return CLIENTE_BALCAO_PADRAO;
  }

  private String obterCampoClienteSeguro(String valor) {
    return textoNaoVazio(valor) ? valor.trim() : NAO_INFORMADO;
  }

  private String formatarStatus(PartSaleStatus status) {
    if (status == null) {
      return "Em Cotação / Rascunho";
    }
    return switch (status) {
      case DRAFT -> "Rascunho / Em Cotação";
      case APPROVED -> "Aprovada / Concluída";
      case CANCELLED -> "Cancelada";
    };
  }

  private String formatarData(OffsetDateTime dateTime) {
    OffsetDateTime referencia = dateTime != null
        ? dateTime
        : OffsetDateTime.now(ZONE_SAO_PAULO);
    return referencia.atZoneSameInstant(ZONE_SAO_PAULO).format(FORMATTER_DATA);
  }

  private String formatarEnderecoCliente(Client client) {
    if (client == null) {
      return "";
    }
    String logradouro = formatarParteComSeparador(client.getStreet(), client.getNumber(), ", ");
    String cidadeUf = formatarParteComSeparador(client.getCity(), client.getState(), "/");
    return Stream.of(logradouro, client.getNeighborhood(), cidadeUf)
        .filter(this::textoNaoVazio)
        .map(String::trim)
        .collect(Collectors.joining(" - "));
  }

  private String formatarParteComSeparador(
      String partePrincipal, String parteSecundaria, String separador) {
    if (!textoNaoVazio(partePrincipal)) {
      return "";
    }
    if (!textoNaoVazio(parteSecundaria)) {
      return partePrincipal.trim();
    }
    return partePrincipal.trim() + separador + parteSecundaria.trim();
  }

  private boolean textoNaoVazio(String valor) {
    return valor != null && !valor.isBlank();
  }

  private String formatarMilimetros(Integer mm) {
    if (mm == null || mm <= 0) {
      return "-";
    }
    return mm + " mm";
  }

  private String formatarMetragem(BigDecimal valor, String sufixo) {
    if (valor == null) {
      return "-";
    }
    DecimalFormatSymbols symbols = new DecimalFormatSymbols(PT_BR);
    DecimalFormat df = new DecimalFormat("#,##0.00##", symbols);
    return df.format(valor) + sufixo;
  }

  private String formatarMoeda(BigDecimal valor) {
    if (valor == null) {
      return "R$ 0,00";
    }
    NumberFormat fmt = NumberFormat.getCurrencyInstance(PT_BR);
    return fmt.format(valor);
  }

  private String obterDadoSeguro(String valor) {
    if (!textoNaoVazio(valor)) {
      return NAO_INFORMADO;
    }
    return valor.trim();
  }
}

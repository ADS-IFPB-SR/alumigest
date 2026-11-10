package br.edu.ifpb.alumigest.partsale.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleItem;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PartSalePdfService [US-46.4] - Geração de PDF A4 Diagramado")
class PartSalePdfServiceTest {

  private PartSalePdfService pdfService;
  private CompanyProperties companyProps;

  @BeforeEach
  void setUp() {
    companyProps = new CompanyProperties();
    companyProps.setRazaoSocial("Alumiportas Alumínio e Vidros LTDA");
    companyProps.setCnpj("12.345.678/0001-90");
    companyProps.setInscricaoEstadual("123456789");
    companyProps.setEndereco("Rua das Esquadrias, 100");
    companyProps.setCidadeUf("Sousa/PB");
    companyProps.setTelefone("(83) 98888-7777");

    pdfService = new PartSalePdfService(companyProps);
  }

  private PdfExtractionResult extrairTextoPdf(byte[] pdfBytes) throws IOException {
    PdfReader reader = new PdfReader(pdfBytes);
    try {
      int totalPages = reader.getNumberOfPages();
      PdfTextExtractor extractor = new PdfTextExtractor(reader);
      StringBuilder fullText = new StringBuilder();
      String secondPageText = "";
      for (int p = 1; p <= totalPages; p++) {
        String pageText = extractor.getTextFromPage(p);
        fullText.append(pageText).append("\n");
        if (p == 2) {
          secondPageText = pageText;
        }
      }
      return new PdfExtractionResult(totalPages, fullText.toString(), secondPageText);
    } finally {
      reader.close();
    }
  }

  private record PdfExtractionResult(int totalPages, String fullText, String secondPageText) {}

  @Test
  @DisplayName("Deve gerar PDF A4 com seções modulares em menos de 1,5 segundo")
  void shouldGeneratePdfA4WithinPerformanceLimit() throws Exception {
    long startTime = System.currentTimeMillis();

    Client client = Client.builder()
        .id(UUID.randomUUID())
        .fullName("Serralheria Confiança")
        .documentNumber("98.765.432/0001-10")
        .phone("(83) 99999-1111")
        .street("Av. Comercial")
        .number("250")
        .neighborhood("Centro")
        .city("Sousa")
        .state("PB")
        .personType(PersonType.JURIDICA)
        .build();

    PartSale sale = new PartSale(
        "VP-2026-0001", client.getId(), PartSaleStatus.APPROVED, new BigDecimal("20.00"));

    Material vidro = new Material();
    vidro.setName("Vidro Incolor 8mm Temperado");
    sale.addItem(new PartSaleItem(
        vidro, MaterialCategoryType.GLASS, 1000, 1200, 2,
        null, new BigDecimal("2.4000"), new BigDecimal("150.00"), new BigDecimal("360.00")
    ));

    Material perfil = new Material();
    perfil.setName("Perfil U Linha Suprema");
    sale.addItem(new PartSaleItem(
        perfil, MaterialCategoryType.PROFILE, null, 2500, 4,
        new BigDecimal("0.0500"), new BigDecimal("10.5000"),
        new BigDecimal("35.00"), new BigDecimal("367.50")
    ));

    Material ferragem = new Material();
    ferragem.setName("Roldana Dupla 112");
    sale.addItem(new PartSaleItem(
        ferragem, MaterialCategoryType.HARDWARE, null, null, 10,
        null, new BigDecimal("10.0000"), new BigDecimal("25.00"), new BigDecimal("250.00")
    ));

    Material pelicula = new Material();
    pelicula.setName("Película Solar Fumê");
    sale.addItem(new PartSaleItem(
        pelicula, MaterialCategoryType.FILM, 800, 1500, 1,
        new BigDecimal("0.0800"), new BigDecimal("1.2960"),
        new BigDecimal("80.00"), new BigDecimal("103.68")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, client);
    long duration = System.currentTimeMillis() - startTime;

    assertThat(pdfBytes).isNotNull().isNotEmpty();
    assertThat(duration).isLessThan(1500L);

    PdfExtractionResult extraction = extrairTextoPdf(pdfBytes);
    assertThat(extraction.totalPages()).isGreaterThanOrEqualTo(1);
    assertThat(extraction.fullText())
        .contains(
            "Alumiportas Alumínio e Vidros LTDA",
            "IE: 123456789",
            "VP-2026-0001",
            "Serralheria Confiança",
            "Av. Comercial, 250 - Centro - Sousa/PB",
            "VIDROS (COBRANÇA EM M²)",
            "PERFIS DE ALUMÍNIO (METRO LINEAR)",
            "FERRAGENS E ACESSÓRIOS (POR UNIDADE)",
            "PELÍCULAS (COBRANÇA EM M²)",
            "Desconto Concedido",
            "Validade da proposta: 15 dias",
            "TOTAL LÍQUIDO"
        );
  }

  @Test
  @DisplayName("Deve ocultar seções temáticas de categorias que não possuem itens no pedido")
  void shouldHideSectionsForEmptyCategories() throws Exception {
    PartSale sale = new PartSale(
        "VP-2026-0002", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

    Material ferragem = new Material();
    ferragem.setName("Puxador Inox Tubo 30cm");
    sale.addItem(new PartSaleItem(
        ferragem, MaterialCategoryType.HARDWARE, null, null, 2,
        null, new BigDecimal("2.0000"), new BigDecimal("50.00"), new BigDecimal("100.00")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, null);
    PdfExtractionResult extraction = extrairTextoPdf(pdfBytes);

    assertThat(extraction.fullText())
        .contains("FERRAGENS E ACESSÓRIOS (POR UNIDADE)", "Cliente Balcão")
        .doesNotContain(
            "VIDROS (COBRANÇA EM M²)",
            "PERFIS DE ALUMÍNIO (METRO LINEAR)",
            "PELÍCULAS (COBRANÇA EM M²)",
            "LARGURA",
            "ALTURA",
            "COMPRIMENTO"
        );
  }

  @Test
  @DisplayName("Deve agrupar ROLLERS em Ferragens sem colunas de medidas em branco")
  void shouldGroupRollersUnderHardwareWithoutDimensionColumns() throws Exception {
    PartSale sale = new PartSale(
        "VP-2026-0004", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

    Material roldana = new Material();
    roldana.setName("Roldana Blindada 4 Rodas");
    sale.addItem(new PartSaleItem(
        roldana, MaterialCategoryType.ROLLERS, null, null, 6,
        null, new BigDecimal("6.0000"), new BigDecimal("32.00"), new BigDecimal("192.00")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, null);
    PdfExtractionResult extraction = extrairTextoPdf(pdfBytes);

    assertThat(extraction.fullText())
        .contains("FERRAGENS E ACESSÓRIOS (POR UNIDADE)", "Roldana Blindada 4 Rodas", "6 UN")
        .doesNotContain("LARGURA", "ALTURA", "COMPRIMENTO");
  }

  @Test
  @DisplayName("Deve tratar status cancelado, IE ausente, desconto zero e endereço parcial")
  void shouldHandleCancelledStatusBlankClientNameAndPartialAddress() throws Exception {
    companyProps.setInscricaoEstadual("   ");
    Client partialClient = Client.builder()
        .id(UUID.randomUUID())
        .fullName("   ")
        .street("Rua Nova")
        .number(null)
        .neighborhood("Centro")
        .city(null)
        .state("PB")
        .personType(PersonType.FISICA)
        .build();

    PartSale sale = new PartSale(
        "VP-2026-0005", partialClient.getId(), PartSaleStatus.CANCELLED, BigDecimal.ZERO);

    Material perfil = new Material();
    perfil.setName("Cantoneira 1 Pol");
    sale.addItem(new PartSaleItem(
        perfil, MaterialCategoryType.PROFILE, null, 0, 1,
        null, new BigDecimal("1.0000"), new BigDecimal("20.00"), new BigDecimal("20.00")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, partialClient);
    PdfExtractionResult extraction = extrairTextoPdf(pdfBytes);

    assertThat(extraction.fullText())
        .contains(
            "Cancelada",
            "Cliente Balcão (Consumidor Final)",
            "Rua Nova - Centro",
            "TOTAL LÍQUIDO"
        )
        .doesNotContain("IE:", "Desconto Concedido");
  }

  @Test
  @DisplayName("Deve paginar múltiplos itens gerando cabeçalho repetido a partir da página 2")
  void shouldGenerateMultiplePagesWithRepeatedHeader() throws Exception {
    PartSale sale = new PartSale(
        "VP-2026-MULT", UUID.randomUUID(), PartSaleStatus.APPROVED, new BigDecimal("10.00"));

    for (int i = 1; i <= 32; i++) {
      Material vidro = new Material();
      vidro.setName("Vidro Laminado 10mm Lote " + i);
      sale.addItem(new PartSaleItem(
          vidro, MaterialCategoryType.GLASS, 1000, 1500, 1,
          null, new BigDecimal("1.5000"), new BigDecimal("100.00"), new BigDecimal("150.00")
      ));
    }

    byte[] pdfBytes = pdfService.generatePdf(sale, null);
    PdfExtractionResult extraction = extrairTextoPdf(pdfBytes);

    assertThat(extraction.totalPages()).isGreaterThanOrEqualTo(2);
    assertThat(extraction.secondPageText())
        .contains("Venda Avulsa #VP-2026-MULT", "Gerado em:", "Página 2 de");
  }

  @Test
  @DisplayName("Deve lançar exceção se a venda não possuir itens")
  void shouldThrowExceptionWhenSaleHasNoItems() {
    PartSale sale = new PartSale(
        "VP-2026-0003", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

    assertThatThrownBy(() -> pdfService.generatePdf(sale, null))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("não possui itens");
  }

  @Test
  @DisplayName("Deve lançar NullPointerException quando a venda de partes for nula")
  void shouldThrowExceptionWhenSaleIsNull() {
    assertThatThrownBy(() -> pdfService.generatePdf(null, null))
        .isInstanceOf(NullPointerException.class)
        .hasMessageContaining("não pode ser nula");
  }
}

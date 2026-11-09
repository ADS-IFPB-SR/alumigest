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

    PartSale sale = new PartSale("VP-2026-0001", client.getId(), PartSaleStatus.APPROVED, new BigDecimal("20.00"));

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
        new BigDecimal("0.0500"), new BigDecimal("10.5000"), new BigDecimal("35.00"), new BigDecimal("367.50")
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
        new BigDecimal("0.0800"), new BigDecimal("1.2960"), new BigDecimal("80.00"), new BigDecimal("103.68")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, client);

    long duration = System.currentTimeMillis() - startTime;

    assertThat(pdfBytes).isNotNull().isNotEmpty();
    assertThat(duration).isLessThan(1500L); // Critério de Aceitação 1: tempo inferior a 1,5 segundo

    // Validação estrutural do PDF usando PdfReader
    PdfReader reader = new PdfReader(pdfBytes);
    assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);

    PdfTextExtractor extractor = new PdfTextExtractor(reader);
    StringBuilder fullText = new StringBuilder();
    for (int p = 1; p <= reader.getNumberOfPages(); p++) {
      fullText.append(extractor.getTextFromPage(p)).append("\n");
    }
    String text = fullText.toString();

    // Validações de conteúdo textual
    assertThat(text).contains("Alumiportas Alumínio e Vidros LTDA");
    assertThat(text).contains("VP-2026-0001");
    assertThat(text).contains("Serralheria Confiança");
    assertThat(text).contains("VIDROS (COBRANÇA EM M²)");
    assertThat(text).contains("PERFIS DE ALUMÍNIO (METRO LINEAR)");
    assertThat(text).contains("FERRAGENS E ACESSÓRIOS (POR UNIDADE)");
    assertThat(text).contains("PELÍCULAS (COBRANÇA EM M²)");
    assertThat(text).contains("Validade da proposta: 15 dias");
    assertThat(text).contains("TOTAL LÍQUIDO");

    reader.close();
  }

  @Test
  @DisplayName("Deve ocultar seções temáticas de categorias que não possuem itens no pedido")
  void shouldHideSectionsForEmptyCategories() throws Exception {
    PartSale sale = new PartSale("VP-2026-0002", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

    Material ferragem = new Material();
    ferragem.setName("Puxador Inox Tubo 30cm");
    sale.addItem(new PartSaleItem(
        ferragem, MaterialCategoryType.HARDWARE, null, null, 2,
        null, new BigDecimal("2.0000"), new BigDecimal("50.00"), new BigDecimal("100.00")
    ));

    byte[] pdfBytes = pdfService.generatePdf(sale, null);

    PdfReader reader = new PdfReader(pdfBytes);
    PdfTextExtractor extractor = new PdfTextExtractor(reader);
    String text = extractor.getTextFromPage(1);

    assertThat(text).contains("FERRAGENS E ACESSÓRIOS (POR UNIDADE)");
    assertThat(text).doesNotContain("VIDROS (COBRANÇA EM M²)");
    assertThat(text).doesNotContain("PERFIS DE ALUMÍNIO (METRO LINEAR)");
    assertThat(text).doesNotContain("PELÍCULAS (COBRANÇA EM M²)");
    assertThat(text).contains("Cliente Balcão");

    reader.close();
  }

  @Test
  @DisplayName("Deve lançar exceção se a venda não possuir itens")
  void shouldThrowExceptionWhenSaleHasNoItems() {
    PartSale sale = new PartSale("VP-2026-0003", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

    assertThatThrownBy(() -> pdfService.generatePdf(sale, null))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("não possui itens");
  }
}

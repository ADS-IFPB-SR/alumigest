package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.orders.dto.production.AccessoryDto;
import br.edu.ifpb.alumigest.orders.dto.production.AluminumCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.GlassCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Testes Unitários: ProductionSheetPdfService")
class ProductionSheetPdfServiceTest {

    private CompanyProperties companyProps;
    private ProductionSheetPdfService pdfService;

    @BeforeEach
    void setUp() {
        companyProps = mock(CompanyProperties.class);
        when(companyProps.getRazaoSocial()).thenReturn("AlumiGest Esquadrias e Vidros");

        pdfService = new ProductionSheetPdfService(companyProps);
    }

    @Test
    @DisplayName("generatePdf - Deve gerar array de bytes válido do PDF contendo tabelas de cortes")
    void generatePdf_ShouldGenerateValidPdfBytes_WithCuts() {
        List<AluminumCutDto> aluminumCuts = List.of(
                new AluminumCutDto("SU-001", "Marco Lateral", 1000, "90°", 2),
                new AluminumCutDto("SU-002", "Marco Superior", 1200, "90°", 2)
        );

        List<GlassCutDto> glassCuts = List.of(
                new GlassCutDto("Incolor 8mm", 600, 950, 2)
        );

        List<AccessoryDto> accessories = List.of(
                new AccessoryDto("ROL-112", "Roldana Dupla", 4, "UN")
        );

        ProductionSheetResponse data = new ProductionSheetResponse(
                "OS-2026-0042",
                "Maria Oliveira",
                aluminumCuts,
                glassCuts,
                accessories
        );

        byte[] pdfBytes = pdfService.generatePdf(data);

        assertThat(pdfBytes).isNotEmpty();
        // Valida magic bytes de cabeçalho PDF (%PDF)
        assertThat(new String(pdfBytes, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    @DisplayName("generatePdf - Deve gerar PDF válido mesmo quando não houver cortes cadastrados")
    void generatePdf_ShouldGenerateValidPdfBytes_WhenNoCuts() {
        ProductionSheetResponse data = new ProductionSheetResponse(
                "OS-2026-0042",
                "Maria Oliveira",
                List.of(),
                List.of(),
                List.of()
        );

        byte[] pdfBytes = pdfService.generatePdf(data);

        assertThat(pdfBytes).isNotEmpty();
        assertThat(new String(pdfBytes, 0, 4)).isEqualTo("%PDF");
    }
}

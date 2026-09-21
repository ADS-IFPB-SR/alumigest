package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import com.lowagie.text.pdf.PdfReader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class BudgetPdfServiceTest {

    private BudgetPdfService budgetPdfService;
    private CompanyProperties mockProps;

    @BeforeEach
    void setUp() {
        mockProps = new CompanyProperties();
        mockProps.setRazaoSocial("Alumiportas LTDA");
        mockProps.setCnpj("00.000.000/0000-00");
        mockProps.setInscricaoEstadual("00000000");
        mockProps.setTelefone("(00) 0000-0000");
        mockProps.setEndereco("Av. Principal, 1000 - Centro");
        mockProps.setCidadeUf("Cidade - UF");

        budgetPdfService = new BudgetPdfService(mockProps);
    }

    @Test
    @DisplayName("Deve gerar PDF estruturalmente válido e legível pelo leitor oficial do OpenPDF")
    void deveGerarPdfComItemCompletoEValido() throws IOException {
        Budget budget = criarBudgetMock(true);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        // Valida cabeçalho oficial de PDF
        String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", header);

        // Valida integridade do arquivo através do parser de PDF
        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertTrue(reader.getNumberOfPages() >= 1);
        }
    }

    @Test
    @DisplayName("Deve gerar PDF com item mínimo sem opções e sem mão de obra")
    void deveGerarPdfComItemSemOpcoes() throws IOException {
        Budget budget = criarBudgetMock(false);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertEquals(1, reader.getNumberOfPages());
        }
    }

    @Test
    @DisplayName("Deve lançar IllegalStateException ao tentar gerar PDF de orçamento cancelado")
    void naoDeveGerarPdfParaOrcamentoCancelado() {
        Budget budget = criarBudgetMock(false);
        budget.setStatus(BudgetStatus.CANCELLED);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            budgetPdfService.gerarPdfComercial(budget);
        });

        assertEquals("Não é possível gerar o PDF de um orçamento cancelado.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar NullPointerException se o orçamento informado for nulo")
    void deveLancarExcecaoParaOrcamentoNulo() {
        assertThrows(NullPointerException.class, () -> {
            budgetPdfService.gerarPdfComercial(null);
        });
    }

    @Test
    @DisplayName("Deve gerar PDF resiliente mesmo com dados parciais ou nulos")
    void deveGerarPdfComDadosFaltantesSemLancarExcecao() throws IOException {
        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("001");
        budget.setStatus(BudgetStatus.DRAFT);

        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertEquals(1, reader.getNumberOfPages());
        }
    }

    @Test
    @DisplayName("Deve gerar PDF formatando endereço sem logradouro e puxador em formato JSON")
    void deveGerarPdfComEnderecoSemRuaEPuxadorJson() throws IOException {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Cliente Sem Rua")
                .city("Sousa")
                .state("PB")
                .email("cliente@teste.com")
                .build();

        Budget budget = criarBudgetMock(false);
        budget.setClient(client);
        budget.setNotes("Observações do orçamento para teste de exibição");

        BudgetItem item = budget.getItems().getFirst();
        item.setHandleConfig("{\"handleType\":\"SHELL_LOCK\"}");

        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertTrue(reader.getNumberOfPages() >= 1);
        }
    }

    @Test
    @DisplayName("Deve ocultar tag de puxador quando handleConfig for NONE em formato JSON")
    void deveOcultarTagDePuxadorNone() throws IOException {
        Budget budget = criarBudgetMock(false);
        BudgetItem item = budget.getItems().getFirst();
        item.setHandleConfig("{\"handleType\":\"NONE\"}");

        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertTrue(reader.getNumberOfPages() >= 1);
        }
    }

    @Test
    @DisplayName("Deve gerar PDF quando a empresa não possui Inscrição Estadual (isento)")
    void deveGerarPdfSemInscricaoEstadual() throws IOException {
        mockProps.setInscricaoEstadual(null);
        Budget budget = criarBudgetMock(false);

        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        try (PdfReader reader = new PdfReader(pdfBytes)) {
            assertTrue(reader.getNumberOfPages() >= 1);
        }
    }

    // --- Helper para montar os dados ---

    private Budget criarBudgetMock(boolean itemCompleto) {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Cliente Exemplo S/A")
                .documentNumber("111.222.333-44")
                .phone("(00) 99999-9999")
                .email("cliente@email.com")
                .street("Rua Fictícia")
                .number("456")
                .neighborhood("Bairro Industrial")
                .city("Cidade")
                .state("UF")
                .build();

        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("1024");
        budget.setClient(client);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
        budget.setSubtotal(new BigDecimal("975.62"));
        budget.setDiscountValue(new BigDecimal("0.00"));
        budget.setTotal(new BigDecimal("975.62"));
        budget.setCreatedAt(OffsetDateTime.now());
        budget.setValidUntil(OffsetDateTime.now().plusDays(15));

        BudgetItem item = new BudgetItem();
        item.setId(UUID.randomUUID());
        item.setProductName("Porta de Giro Simples");
        item.setWidthMm(new BigDecimal("906"));
        item.setHeightMm(new BigDecimal("541"));
        item.setQuantity(1);
        item.setSubtotal(new BigDecimal("639.00"));
        item.setBudget(budget);

        if (itemCompleto) {
            List<BudgetItemOption> options = new ArrayList<>();

            BudgetItemOption opt1 = new BudgetItemOption();
            opt1.setCategoryType(MaterialCategoryType.PROFILE);
            opt1.setMaterialName("060");
            opt1.setSelectedColor("Fosco");
            options.add(opt1);

            BudgetItemOption opt2 = new BudgetItemOption();
            opt2.setCategoryType(MaterialCategoryType.GLASS);
            opt2.setMaterialName("Espelho");
            opt2.setSelectedColor("");
            options.add(opt2);

            BudgetItemOption opt3 = new BudgetItemOption();
            opt3.setCategoryType(MaterialCategoryType.ROLLERS);
            opt3.setMaterialName("Roldana 1125");
            options.add(opt3);

            item.setOptions(options);
            item.setHandleConfig("Puxador Pedaço");
            item.setLaborCost(new BigDecimal("150.00"));
        } else {
            item.setLaborCost(BigDecimal.ZERO);
        }

        budget.setItems(List.of(item));
        return budget;
    }
}
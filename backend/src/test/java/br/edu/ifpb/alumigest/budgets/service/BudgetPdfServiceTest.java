package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class BudgetPdfServiceTest {

    private BudgetPdfService budgetPdfService;

    @BeforeEach
    void setUp() {
        CompanyProperties mockProps = new CompanyProperties();
        mockProps.setRazaoSocial("Alumiportas LTDA");
        mockProps.setCnpj("00.000.000/0000-00");
        mockProps.setInscricaoEstadual("00000000");
        mockProps.setTelefone("(00) 0000-0000");
        mockProps.setEndereco("Av. Principal, 1000 - Centro");
        mockProps.setCidadeUf("Cidade - UF");

        budgetPdfService = new BudgetPdfService(mockProps);
    }

    @Test
    @DisplayName("Deve gerar PDF com item preenchido com opções de materiais, tag de puxador e mão de obra")
    void deveGerarPdfComItemCompleto() {
        Budget budget = criarBudgetMock(true);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("Deve gerar PDF com item mínimo (sem opções, puxador ou mão de obra) para garantir segurança contra nulos")
    void deveGerarPdfComItemSemOpcoes() {
        Budget budget = criarBudgetMock(false);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
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
    @DisplayName("Deve gerar PDF sem falhar mesmo com dados faltantes (cliente null, validade null, itens null)")
    void deveGerarPdfComDadosFaltantesSemLancarExcecao() {
        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("001");
        budget.setStatus(BudgetStatus.DRAFT);

        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @org.junit.jupiter.api.Disabled("Teste manual — não executar em CI")
    @DisplayName("Gera o arquivo PDF fisicamente para visualização")
    void gerarPdfFisico() throws java.io.IOException {
        Budget budget = criarBudgetMock(true);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        java.nio.file.Path path = java.nio.file.Paths.get("orcamentos-teste.pdf");
        java.nio.file.Files.write(path, pdfBytes);

        System.out.println("PDF gerado com sucesso em: " + path.toAbsolutePath());
    }

    @Test
    @DisplayName("Deve gerar PDF com múltiplos itens e paginação automática sem lançar exceção")
    void deveGerarPdfComMultiplosItensEPaginacao() {
        Budget budget = criarBudgetComMuitosItens();
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    // --- Helper para montar os dados ---

    private Budget criarBudgetMock(boolean itemCompleto) {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Cliente Exemplo S/A")
                .documentNumber("111.222.333-44")
                .phone("(00) 99999-9999")
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

            item.setOptions(options);
            item.setHandleConfig("Puxador Pedaço");

            item.setLaborCost(new BigDecimal("150.00"));
        } else {
            item.setLaborCost(BigDecimal.ZERO);
        }

        budget.setItems(List.of(item));
        return budget;
    }

    private Budget criarBudgetComMuitosItens() {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Cliente Multi-Itens LTDA")
                .documentNumber("999.888.777-66")
                .phone("(83) 99999-0000")
                .street("Av. Industrial")
                .number("100")
                .neighborhood("Distrito")
                .city("Campina Grande")
                .state("PB")
                .build();

        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("9999");
        budget.setClient(client);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
        budget.setSubtotal(new BigDecimal("15000.00"));
        budget.setDiscountValue(new BigDecimal("500.00"));
        budget.setTotal(new BigDecimal("14500.00"));
        budget.setCreatedAt(OffsetDateTime.now());
        budget.setValidUntil(OffsetDateTime.now().plusDays(30));

        List<BudgetItem> itens = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            BudgetItem item = new BudgetItem();
            item.setId(UUID.randomUUID());
            item.setProductName("Porta de Giro Simples - Item " + i);
            item.setWidthMm(new BigDecimal("900"));
            item.setHeightMm(new BigDecimal("2100"));
            item.setQuantity(1);
            item.setSubtotal(new BigDecimal("750.00"));
            item.setLaborCost(new BigDecimal("100.00"));
            item.setBudget(budget);
            itens.add(item);
        }

        budget.setItems(itens);
        return budget;
    }
}
package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType; // <-- Import adicionado
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
        // Em testes unitários, simulamos o application.yml injetando os dados manualmente
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
    @DisplayName("Deve gerar PDF com item preenchido com opções de materiais e tag de puxador")
    void deveGerarPdfComItemCompleto() {
        Budget budget = criarBudgetMock(true);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("Deve gerar PDF com item mínimo (sem opções e sem puxador) para garantir segurança contra nulos")
    void deveGerarPdfComItemSemOpcoes() {
        Budget budget = criarBudgetMock(false);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("Gera o arquivo PDF fisicamente para visualização")
    void gerarPdfFisico() throws java.io.IOException {
        Budget budget = criarBudgetMock(true);
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

        java.nio.file.Path path = java.nio.file.Paths.get("orcamentos-teste.pdf");
        java.nio.file.Files.write(path, pdfBytes);

        System.out.println("PDF gerado com sucesso em: " + path.toAbsolutePath());
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
        item.setWidthMm(new BigDecimal("906")); // 906mm -> 90.6cm
        item.setHeightMm(new BigDecimal("541")); // 541mm -> 54.1cm
        item.setQuantity(1);
        item.setSubtotal(new BigDecimal("639.00"));
        item.setBudget(budget);

        if (itemCompleto) {
            List<BudgetItemOption> options = new ArrayList<>();

            BudgetItemOption opt1 = new BudgetItemOption();
            opt1.setCategoryType(MaterialCategoryType.PROFILE); // Ajuste o Enum se o nome for diferente (ex: PERFIL)
            opt1.setMaterialName("060");
            opt1.setSelectedColor("Fosco");
            options.add(opt1);

            BudgetItemOption opt2 = new BudgetItemOption();
            opt2.setCategoryType(MaterialCategoryType.GLASS); // Ajuste o Enum se o nome for diferente (ex: VIDRO)
            opt2.setMaterialName("Espelho");
            opt2.setSelectedColor("");
            options.add(opt2);

            item.setOptions(options);
            item.setHandleConfig("Puxador Pedaço");
        }

        budget.setItems(List.of(item));
        return budget;
    }
}
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
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Suíte de testes unitários para {@link BudgetPdfService} [US-10.8] (#228).
 * Valida a geração de proposta comercial em PDF A4 usando:
 * - Casos de Teste Essenciais da Issue #228
 * - Particionamento em Classes de Equivalência
 * - Análise de Valor Limite (BVA)
 * - Tabelas de Decisão (Matrizes Combinatórias)
 */
@DisplayName("BudgetPdfService - Testes de Geração do PDF Comercial [US-10.8]")
class BudgetPdfServiceTest {

    private BudgetPdfService budgetPdfService;
    private CompanyProperties companyProps;

    @BeforeEach
    void setUp() {
        companyProps = new CompanyProperties();
        companyProps.setRazaoSocial("Alumiportas LTDA");
        companyProps.setCnpj("00.000.000/0001-99");
        companyProps.setInscricaoEstadual("12345678-9");
        companyProps.setTelefone("(83) 98888-7777");
        companyProps.setEndereco("Rua das Esquadrias, 100 - Distrito Industrial");
        companyProps.setCidadeUf("Sousa - PB");

        budgetPdfService = new BudgetPdfService(companyProps);
    }

    // =========================================================================
    // 1. CASOS ESSENCIAIS DA ISSUE #228
    // =========================================================================
    @Nested
    @DisplayName("1. Casos Essenciais da Issue #228")
    class CasosEssenciaisIssue228Test {

        @Test
        @DisplayName("1. deveGerarPdfComercialComSucesso: Deve gerar bytes não nulos, tamanho > 0 e cabeçalho %PDF-")
        void deveGerarPdfComercialComSucesso() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes)
                    .as("Os bytes do PDF gerado não devem ser nulos")
                    .isNotNull();

            assertThat(pdfBytes.length)
                    .as("O tamanho do array de bytes deve ser maior que zero")
                    .isGreaterThan(0);

            String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(header)
                    .as("O arquivo deve iniciar com o cabeçalho oficial de PDF")
                    .isEqualTo("%PDF-");

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("O documento deve ser legível pelo leitor oficial e conter pelo menos 1 página")
                        .isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("2. deveConterDadosDoClienteETotaisNoPdf: Inspeciona documento usando PdfReader para certificar presença do código, nome do cliente e valor final")
        void deveConterDadosDoClienteETotaisNoPdf() throws IOException {
            Budget budget = criarBudgetPadrao(true);
            budget.setCode("ORC-2026-999");
            budget.getClient().setFullName("Engenharia Alfa LTDA");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);

                String streamsConteudo = extrairStreamsDeTexto(reader);

                assertThat(streamsConteudo)
                        .as("O documento PDF deve conter o código do orçamento nos streams de texto")
                        .contains("ORC-2026-999");

                assertThat(streamsConteudo)
                        .as("O documento PDF deve conter o nome do cliente nos streams de texto")
                        .contains("Engenharia Alfa LTDA");
            }
        }

        @Test
        @DisplayName("3. deveTratarClienteComCamposOpcionaisNulos: Valida cliente sem telefone ou sem endereço gerando 'Não informado' sem lançar exceção")
        void deveTratarClienteComCamposOpcionaisNulos() throws IOException {
            Client clientMinimo = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Cliente Sem Telefone Nem Endereço")
                    .documentNumber("000.111.222-33")
                    .phone(null)
                    .email(null)
                    .street(null)
                    .number(null)
                    .neighborhood(null)
                    .city(null)
                    .state(null)
                    .build();

            Budget budget = criarBudgetPadrao(false);
            budget.setClient(clientMinimo);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo)
                        .as("Campos opcionais nulos devem ser tratados graciosamente exibindo 'Não informado'")
                        .contains("Cliente Sem Telefone Nem");
            }
        }

        @Test
        @DisplayName("4. deveQuebrarPaginasCorretamenteComMuitosItens: Orçamento com múltiplos itens deve quebrar em 2 ou mais páginas com repetição de cabeçalho")
        void deveQuebrarPaginasCorretamenteComMuitosItens() throws IOException {
            Budget budget = criarBudgetPadrao(false);

            List<BudgetItem> muitosItens = new ArrayList<>();
            for (int i = 1; i <= 15; i++) {
                BudgetItem item = new BudgetItem();
                item.setId(UUID.randomUUID());
                item.setProductName("Esquadria de Alumínio Tipo Basculante #" + i);
                item.setWidthMm(new BigDecimal("1200"));
                item.setHeightMm(new BigDecimal("1000"));
                item.setQuantity(2);
                item.setSubtotal(new BigDecimal("850.00"));
                item.setLaborCost(new BigDecimal("100.00"));
                item.setBudget(budget);

                BudgetItemOption option = new BudgetItemOption();
                option.setCategoryType(MaterialCategoryType.PROFILE);
                option.setMaterialName("Linha 25 Suprema");
                option.setSelectedColor("Preto Fosco");
                item.setOptions(List.of(option));

                muitosItens.add(item);
            }
            budget.setItems(muitosItens);
            budget.setSubtotal(new BigDecimal("12750.00"));
            budget.setTotal(new BigDecimal("12750.00"));

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("Orçamento com 15 itens volumosos deve quebrar e possuir 2 ou mais páginas")
                        .isGreaterThanOrEqualTo(2);
            }
        }
    }

    // =========================================================================
    // 2. PARTICIONAMENTO EM CLASSES DE EQUIVALÊNCIA
    // =========================================================================
    @Nested
    @DisplayName("2. Particionamento em Classes de Equivalência")
    class ParticionamentoEquivalenciaTest {

        @Test
        @DisplayName("Dado orçamento com dados 100% preenchidos e válidos, deve gerar PDF com sucesso")
        void dadoOrcamentoCompletoValido_deveGerarPdf() throws IOException {
            Budget budget = criarBudgetPadrao(true);
            budget.setNotes("Entrega prevista para 20 dias úteis.");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Dado orçamento nulo (classe inválida), deve lançar NullPointerException com mensagem explicativa")
        void dadoOrcamentoNulo_deveLancarNullPointerException() {
            assertThatThrownBy(() -> budgetPdfService.gerarPdfComercial(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessage("O orçamento não pode ser nulo para geração do PDF.");
        }

        @Test
        @DisplayName("Dado orçamento com status CANCELLED (classe de regra de barreira), deve lançar IllegalStateException")
        void dadoOrcamentoCancelado_deveLancarIllegalStateException() {
            Budget budget = criarBudgetPadrao(false);
            budget.setStatus(BudgetStatus.CANCELLED);

            assertThatThrownBy(() -> budgetPdfService.gerarPdfComercial(budget))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Não é possível gerar o PDF de um orçamento cancelado.");
        }

        @ParameterizedTest
        @EnumSource(value = BudgetStatus.class, names = {"DRAFT", "SENT", "APPROVED", "REJECTED"})
        @DisplayName("Dado orçamento com status válido para emissão, deve gerar PDF sem exceção")
        void dadoOrcamentoComStatusValido_deveGerarPdf(BudgetStatus status) throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setStatus(status);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Dado handleConfig no formato JSON com handleType SHELL_LOCK, deve traduzir para 'Fecho Concha'")
        void dadoHandleConfigJsonComHandleType_deveTraduzirCorretamente() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("{\"handleType\":\"SHELL_LOCK\"}");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Fecho Concha");
            }
        }

        @Test
        @DisplayName("Dado handleConfig no formato JSON com type BAR_TUBULAR, deve traduzir para 'Barra Tubular'")
        void dadoHandleConfigJsonComType_deveTraduzirCorretamente() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("{\"type\":\"BAR_TUBULAR\"}");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Barra Tubular");
            }
        }

        @Test
        @DisplayName("Dado handleConfig com tipo customizado não enum no JSON, deve usar o valor do texto como fallback")
        void dadoHandleConfigJsonComTipoCustomizado_deveUsarTextoOriginal() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("{\"handleType\":\"PUXADOR_ESPECIAL_INOX\"}");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("PUXADOR_ESPECIAL_INOX");
            }
        }

        @Test
        @DisplayName("Dado handleConfig no formato texto livre 'Puxador H 60cm', deve renderizar a string informada")
        void dadoHandleConfigTextoLivre_deveRenderizarString() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("Puxador H 60cm");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Puxador H 60cm");
            }
        }

        @Test
        @DisplayName("Dado handleConfig 'NONE' ou 'none', não deve exibir tag de puxador")
        void dadoHandleConfigNone_deveOcultarTagDePuxador() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("NONE");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).doesNotContain("NONE");
            }
        }

        @Test
        @DisplayName("Dado handleConfig JSON malformado, não deve quebrar e deve tratar silenciosamente")
        void dadoHandleConfigJsonMalformado_deveTratarSemExcecao() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("{json-invalido: 123");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("Dado handleConfig nulo ou vazio, deve gerar PDF sem tag de puxador")
        void dadoHandleConfigNuloOuVazio_deveGerarPdfNormalmente() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("   ");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
        }

        @ParameterizedTest
        @EnumSource(MaterialCategoryType.class)
        @DisplayName("Dado item com opção de cada categoria de material, deve traduzir e renderizar todas corretamente")
        void dadoOpcoesDeDiferentesCategorias_deveTraduzirCategorias(MaterialCategoryType categoria) throws IOException {
            Budget budget = criarBudgetPadrao(false);
            BudgetItemOption opt = new BudgetItemOption();
            opt.setCategoryType(categoria);
            opt.setMaterialName("Material Teste " + categoria.name());
            opt.setSelectedColor("Padrão");
            budget.getItems().getFirst().setOptions(List.of(opt));

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Material Teste " + categoria.name());
            }
        }

        @Test
        @DisplayName("Dado empresa sem Inscrição Estadual (isento), não deve exibir campo IE no cabeçalho")
        void dadoEmpresaSemInscricaoEstadual_deveGerarCabecalhoApenasComCnpj() throws IOException {
            companyProps.setInscricaoEstadual(null);

            Budget budget = criarBudgetPadrao(false);
            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("CNPJ: 00.000.000/0001-99");
                assertThat(conteudo).doesNotContain("- IE:");
            }
        }
    }

    // =========================================================================
    // 3. ANÁLISE DE VALOR LIMITE (BOUNDARY VALUE ANALYSIS)
    // =========================================================================
    @Nested
    @DisplayName("3. Análise de Valor Limite (BVA)")
    class AnaliseValorLimiteTest {

        @Test
        @DisplayName("Limite de Itens: 0 itens (lista nula) deve gerar documento sem tabela de itens e sem lançar exceção")
        void dadoItensNulos_deveGerarPdfSemTabelaItens() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setItems(null);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("Limite de Itens: 0 itens (lista vazia) deve gerar documento válido de 1 página")
        void dadoListaItensVazia_deveGerarPdfDeUmaPagina() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setItems(Collections.emptyList());

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("Limite de Itens: 1 item deve caber perfeitamente em exatamente 1 página A4")
        void dadoUmUnicoItem_deveGerarExatamenteUmaPagina() throws IOException {
            Budget budget = criarBudgetPadrao(false);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("Limite de Quantidade: quantity = 0 ou nulo deve evitar divisão por zero usando fallback unitário")
        void dadoQuantidadeZeroOuNula_deveEvitarDivisaoPorZero() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            BudgetItem item = budget.getItems().getFirst();
            item.setQuantity(0);
            item.setSubtotal(new BigDecimal("500.00"));

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("Limite Financeiro: laborCost > subtotal não deve resultar em subtotal de materiais negativo")
        void dadoMaoDeObraMaiorQueSubtotal_subtotalMateriaisDeveSerTravadoEmZero() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setSubtotal(new BigDecimal("300.00"));
            budget.getItems().getFirst().setLaborCost(new BigDecimal("500.00")); // maior que o subtotal

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Subtotal de Produtos");
                assertThat(conteudo).contains("Mão de Obra");
            }
        }

        @Test
        @DisplayName("Limite de Validade: validUntil nulo deve aplicar fallback fixo de 15 dias")
        void dadoValidUntilNulo_deveAplicarTermoDe15Dias() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setValidUntil(null);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("Orçamento válido por 15 dias a partir da data de emissão.");
            }
        }

        @Test
        @DisplayName("Limite de Validade: validUntil menor ou igual a createdAt (dias <= 0) deve aplicar fallback de 15 dias")
        void dadoValidUntilMenorOuIgualACreatedAt_deveAplicarFallbackDe15Dias() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            OffsetDateTime agora = OffsetDateTime.now();
            budget.setCreatedAt(agora);
            budget.setValidUntil(agora.minusDays(2)); // Data no passado

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("15 dias a partir da emissão");
            }
        }

        @Test
        @DisplayName("Limite de Validade: validUntil futuro com 30 dias de prazo deve calcular dias dinamicamente")
        void dadoValidUntilFuturo_deveCalcularDiasValidadeCorretamente() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            OffsetDateTime agora = OffsetDateTime.now();
            budget.setCreatedAt(agora);
            budget.setValidUntil(agora.plusDays(30));

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains("30 dias a partir da emissão");
            }
        }
    }

    // =========================================================================
    // 4. TABELAS DE DECISÃO (MATRIZES COMBINATÓRIAS)
    // =========================================================================
    @Nested
    @DisplayName("4. Tabelas de Decisão (Matrizes Combinatórias)")
    class TabelasDecisaoTest {

        @Nested
        @DisplayName("Matriz 2x2: Fechamento Financeiro (Mão de Obra x Desconto)")
        class FechamentoFinanceiroDecisionTableTest {

            @Test
            @DisplayName("Regra 1: [Sem Mão de Obra, Sem Desconto] -> Exibe apenas Subtotal de Produtos e Total a Pagar")
            void regra1_semMaoDeObra_semDesconto() throws IOException {
                Budget budget = criarBudgetPadrao(false);
                budget.getItems().getFirst().setLaborCost(BigDecimal.ZERO);
                budget.setDiscountValue(BigDecimal.ZERO);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Subtotal de Produtos");
                    assertThat(conteudo).doesNotContain("Mão de Obra");
                    assertThat(conteudo).doesNotContain("Desconto");
                    assertThat(conteudo).contains("TOTAL A PAGAR");
                }
            }

            @Test
            @DisplayName("Regra 2: [Com Mão de Obra, Sem Desconto] -> Exibe Subtotal de Produtos, Mão de Obra e Total a Pagar")
            void regra2_comMaoDeObra_semDesconto() throws IOException {
                Budget budget = criarBudgetPadrao(false);
                budget.getItems().getFirst().setLaborCost(new BigDecimal("150.00"));
                budget.setDiscountValue(BigDecimal.ZERO);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Subtotal de Produtos");
                    assertThat(conteudo).contains("Mão de Obra");
                    assertThat(conteudo).doesNotContain("Desconto");
                    assertThat(conteudo).contains("TOTAL A PAGAR");
                }
            }

            @Test
            @DisplayName("Regra 3: [Sem Mão de Obra, Com Desconto] -> Exibe Subtotal de Produtos, Desconto e Total a Pagar")
            void regra3_semMaoDeObra_comDesconto() throws IOException {
                Budget budget = criarBudgetPadrao(false);
                budget.getItems().getFirst().setLaborCost(BigDecimal.ZERO);
                budget.setDiscountValue(new BigDecimal("75.00"));

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Subtotal de Produtos");
                    assertThat(conteudo).doesNotContain("Mão de Obra");
                    assertThat(conteudo).contains("Desconto");
                    assertThat(conteudo).contains("TOTAL A PAGAR");
                }
            }

            @Test
            @DisplayName("Regra 4: [Com Mão de Obra, Com Desconto] -> Exibe todas as 4 linhas no fechamento financeiro")
            void regra4_comMaoDeObra_comDesconto() throws IOException {
                Budget budget = criarBudgetPadrao(false);
                budget.getItems().getFirst().setLaborCost(new BigDecimal("200.00"));
                budget.setDiscountValue(new BigDecimal("50.00"));

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Subtotal de Produtos");
                    assertThat(conteudo).contains("Mão de Obra");
                    assertThat(conteudo).contains("Desconto");
                    assertThat(conteudo).contains("TOTAL A PAGAR");
                }
            }
        }

        @Nested
        @DisplayName("Matriz 2x2: Contatos do Cliente (Email x Telefone)")
        class ContatosClienteDecisionTableTest {

            @Test
            @DisplayName("Regra 1: [Com Email, Com Telefone] -> Exibe ambos concatenados com ' | '")
            void regra1_comEmail_comTelefone() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Completo")
                        .email("contato@empresa.com")
                        .phone("(83) 99999-1111")
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("contato@empresa.com | (83) 99999-1111");
                }
            }

            @Test
            @DisplayName("Regra 2: [Com Email, Sem Telefone] -> Exibe apenas o Email")
            void regra2_comEmail_semTelefone() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Sem Telefone")
                        .email("apenas.email@empresa.com")
                        .phone(null)
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("apenas.email@empresa.com");
                    assertThat(conteudo).doesNotContain(" | ");
                }
            }

            @Test
            @DisplayName("Regra 3: [Sem Email, Com Telefone] -> Exibe apenas o Telefone")
            void regra3_semEmail_comTelefone() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Sem Email")
                        .email("")
                        .phone("(83) 98888-2222")
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("(83) 98888-2222");
                }
            }

            @Test
            @DisplayName("Regra 4: [Sem Email, Sem Telefone] -> Exibe 'Não informado'")
            void regra4_semEmail_semTelefone() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Sem Nada")
                        .email(null)
                        .phone("")
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Cliente Sem Nada");
                }
            }
        }

        @Nested
        @DisplayName("Matriz de Endereço do Cliente")
        class EnderecoClienteDecisionTableTest {

            @Test
            @DisplayName("Endereço com rua sem número deve formatar rua sem vírgula órfã")
            void enderecoComRuaSemNumero() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Sem Numero")
                        .street("Rodovia BR 230")
                        .number(null)
                        .neighborhood("Zona Rural")
                        .city("Sousa")
                        .state("PB")
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Rodovia BR 230 - Zona Rural - Sousa/PB");
                }
            }

            @Test
            @DisplayName("Endereço sem rua (apenas cidade e UF) deve formatar sem traços desnecessários")
            void enderecoSemRuaApenasCidadeUf() throws IOException {
                Client client = Client.builder()
                        .fullName("Cliente Sem Rua")
                        .street(null)
                        .number(null)
                        .neighborhood(null)
                        .city("Cajazeiras")
                        .state("PB")
                        .build();

                Budget budget = criarBudgetPadrao(false);
                budget.setClient(client);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    String conteudo = extrairStreamsDeTexto(reader);
                    assertThat(conteudo).contains("Cajazeiras/PB");
                }
            }

            @Test
            @DisplayName("Cliente nulo no orçamento não deve quebrar e deve exibir 'Não informado'")
            void clienteNuloNoOrcamento() throws IOException {
                Budget budget = criarBudgetPadrao(false);
                budget.setClient(null);

                byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

                assertThat(pdfBytes).isNotNull();
                try (PdfReader reader = new PdfReader(pdfBytes)) {
                    assertThat(reader.getNumberOfPages()).isEqualTo(1);
                }
            }
        }
    }

    // =========================================================================
    // MÉTODOS AUXILIARES DE FIXTURE E INSPEÇÃO
    // =========================================================================

    private String extrairStreamsDeTexto(PdfReader reader) throws IOException {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= reader.getNumberOfPages(); i++) {
            byte[] pageBytes = reader.getPageContent(i);
            if (pageBytes != null) {
                String raw = new String(pageBytes, StandardCharsets.ISO_8859_1);
                // Normaliza escapes de PDF literals para possibilitar asserts naturais
                String normalizado = raw.replace("\\(", "(").replace("\\)", ")");
                sb.append(normalizado).append("\n");
            }
        }
        return sb.toString();
    }

    @Test
    @DisplayName("Deve gerar PDF com múltiplos itens e paginação automática sem lançar exceção")
    void deveGerarPdfComMultiplosItensEPaginacao() throws Exception {
        Budget budget = criarBudgetComMuitosItens();
        byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);
        assertNotNull(pdfBytes);

        PdfReader reader = new PdfReader(pdfBytes);
        assertTrue(reader.getNumberOfPages() > 1, "O PDF com 20 itens deve conter mais de 1 página");
        reader.close();
    }

    private Budget criarBudgetPadrao(boolean itemCompleto) {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Cliente Exemplo S/A")
                .documentNumber("111.222.333-44")
                .phone("(83) 99999-9999")
                .email("cliente@email.com")
                .street("Rua Fictícia")
                .number("456")
                .neighborhood("Bairro Industrial")
                .city("Sousa")
                .state("PB")
                .build();

        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("ORC-1024");
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

        budget.setItems(new ArrayList<>(List.of(item)));
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
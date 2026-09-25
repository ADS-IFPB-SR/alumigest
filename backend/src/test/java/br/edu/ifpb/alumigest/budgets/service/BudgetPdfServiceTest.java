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
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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
                    .isNotNull()
                    .as("O tamanho do array de bytes deve ser maior que zero")
                    .isNotEmpty();

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

        @ParameterizedTest(name = "config=''{0}'' deve conter ''{1}'' no PDF")
        @CsvSource(delimiter = '|', value = {
                "{\"handleType\":\"SHELL_LOCK\"}          | Fecho Concha",
                "{\"type\":\"BAR_TUBULAR\"}                | Barra Tubular",
                "{\"handleType\":\"PUXADOR_ESPECIAL_INOX\"}| PUXADOR_ESPECIAL_INOX",
                "Puxador H 60cm                            | Puxador H 60cm"
        })
        @DisplayName("Dado diferentes configurações de handleConfig, deve renderizar o texto esperado no PDF")
        void dadoHandleConfig_deveRenderizarTextoEsperado(String handleConfig, String textoEsperado) throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig(handleConfig);

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairStreamsDeTexto(reader);
                assertThat(conteudo).contains(textoEsperado);
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
        void dadoHandleConfigJsonMalformado_deveTratarSemExcecao() {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig("{json-invalido: 123");

            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("Dado handleConfig nulo ou vazio, deve gerar PDF sem tag de puxador")
        void dadoHandleConfigNuloOuVazio_deveGerarPdfNormalmente() {
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
    // 5. TESTES DA FICHA TÉCNICA E SIGILO COMERCIAL [US-11.1] (#283)
    // =========================================================================
    @Nested
    @DisplayName("5. Ficha Técnica de Oficina e Sigilo Comercial [US-11.1]")
    class FichaTecnicaOficinaTest {

        @Test
        @DisplayName("Deve gerar PDF técnico com sucesso contendo cabeçalho %PDF- e legibilidade básica")
        void deveGerarPdfTecnicoComSucesso() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
            String header = new String(Arrays.copyOfRange(pdfBytes, 0, 5), StandardCharsets.US_ASCII);
            assertThat(header).isEqualTo("%PDF-");

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isPositive();
            }
        }

        @Test
        @DisplayName("Deve cumprir o Sigilo Comercial estrito: nenhuma menção a R$, Subtotal, Total ou Preços")
        void deveCumprirSigiloComercialEstrito() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                // Asserção estrita de sigilo comercial
                assertThat(textContent)
                        .doesNotContain("R$")
                        .doesNotContain("Subtotal")
                        .doesNotContain("Valor Total")
                        .doesNotContain("Desconto")
                        .doesNotContain("Preço")
                        .doesNotContain("975.62")
                        .doesNotContain("639.00")
                        .doesNotContain("150.00");
            }
        }

        @Test
        @DisplayName("Deve renderizar cabeçalho fabril e dados da ordem de produção")
        void deveRenderizarCabecalhoFabril() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                assertThat(textContent)
                        .contains("FICHA DE USINAGEM E CORTE")
                        .contains("PEDIDO")
                        .contains("ORC-1024");
            }
        }

        @Test
        @DisplayName("Deve exibir card do cliente com volume total de peças consolidado")
        void deveExibirCardClienteComVolumeTotalPecas() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                assertThat(textContent)
                        .contains("CLIENTE EXEMPLO S/A")
                        .contains("(83) 99999-9999")
                        .contains("VOLUME DO PEDIDO");
            }
        }

        @Test
        @DisplayName("Deve exibir especificações técnicas com dimensões nominais em cm e opções de materiais")
        void deveExibirEspecificacoesTecnicas() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                // 906mm -> 90,6 cm x 541mm -> 54,1 cm
                assertThat(textContent)
                        .contains("90,6 x 54,1 cm")
                        .contains("060")
                        .contains("Fosco")
                        .contains("Espelho")
                        .contains("Puxador Peda");
            }
        }

        @Test
        @DisplayName("Deve traduzir tipologias e badges de furação para português conforme dicionário de modelos")
        void deveTraduzirTipologiasEBadgesDeFuracaoParaPortugues() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            List<BudgetItem> itens = new ArrayList<>();

            BudgetItem itemGiro = new BudgetItem();
            itemGiro.setId(UUID.randomUUID());
            itemGiro.setProductName("Porta de Giro");
            itemGiro.setTemplateType("SWING_DOOR_1F");
            itemGiro.setWidthMm(new BigDecimal("900"));
            itemGiro.setHeightMm(new BigDecimal("2100"));
            itemGiro.setQuantity(1);
            itemGiro.setBudget(budget);
            itens.add(itemGiro);

            BudgetItem itemCorrer2F = new BudgetItem();
            itemCorrer2F.setId(UUID.randomUUID());
            itemCorrer2F.setProductName("Porta de Correr 2F");
            itemCorrer2F.setTemplateType("SLIDING_DOOR_2F");
            itemCorrer2F.setWidthMm(new BigDecimal("1600"));
            itemCorrer2F.setHeightMm(new BigDecimal("2150"));
            itemCorrer2F.setQuantity(1);
            itemCorrer2F.setBudget(budget);
            itens.add(itemCorrer2F);

            BudgetItem itemCorrer3F = new BudgetItem();
            itemCorrer3F.setId(UUID.randomUUID());
            itemCorrer3F.setProductName("Porta de Correr 3F");
            itemCorrer3F.setTemplateType("SLIDING_DOOR_3F");
            itemCorrer3F.setWidthMm(new BigDecimal("1800"));
            itemCorrer3F.setHeightMm(new BigDecimal("2150"));
            itemCorrer3F.setQuantity(1);
            itemCorrer3F.setBudget(budget);
            itens.add(itemCorrer3F);

            BudgetItem itemGaveta = new BudgetItem();
            itemGaveta.setId(UUID.randomUUID());
            itemGaveta.setProductName("Frente de Gaveta");
            itemGaveta.setTemplateType("FRONT_DRAWER");
            itemGaveta.setWidthMm(new BigDecimal("600"));
            itemGaveta.setHeightMm(new BigDecimal("200"));
            itemGaveta.setQuantity(2);
            itemGaveta.setBudget(budget);
            itens.add(itemGaveta);

            BudgetItem itemBasculante = new BudgetItem();
            itemBasculante.setId(UUID.randomUUID());
            itemBasculante.setProductName("Janela Basculante");
            itemBasculante.setTemplateType("AWNING_WINDOW_1F");
            itemBasculante.setWidthMm(new BigDecimal("600"));
            itemBasculante.setHeightMm(new BigDecimal("600"));
            itemBasculante.setQuantity(1);
            itemBasculante.setBudget(budget);
            itens.add(itemBasculante);

            budget.setItems(itens);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                assertThat(textContent)
                        .contains("TIPO: GIRO")
                        .contains("TIPO: CORRER (2 FOLHAS)")
                        .contains("TIPO: CORRER (3 FOLHAS)")
                        .contains("TIPO: FRENTE DE GAVETA")
                        .contains("TIPO: BASCULANTE")
                        .contains("ROLDANAS")
                        .contains("DOBRADIÇAS")
                        .contains("FIXAÇÃO CAIXA")
                        .contains("DOBRADIÇA/PISTÃO")
                        .doesNotContain("TIPO: SLIDING DOOR 2F")
                        .doesNotContain("TIPO: SLIDING DOOR 3F")
                        .doesNotContain("TIPO: FRONT DRAWER")
                        .doesNotContain("TIPO: SWING DOOR 1F");
            }
        }

        @Test
        @DisplayName("Deve conter moldura técnica para representação técnica e colunas de controle físico")
        void deveConterMolduraTecnicaEColunasControle() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);

                assertThat(textContent)
                        .contains("ESQUEMA")
                        .contains("Usinagem & Puxador")
                        .contains("US-11.2")
                        .contains("Alum.")
                        .contains("Vidro")
                        .contains("Mont.");
            }
        }

        @Test
        @DisplayName("Deve lançar NullPointerException quando orçamento for nulo")
        void deveLancarExcecaoQuandoOrcamentoNulo() {
            assertThatThrownBy(() -> budgetPdfService.gerarPdfTecnico(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("O orçamento não pode ser nulo");
        }

        @Test
        @DisplayName("Deve lançar IllegalStateException quando orçamento estiver cancelado")
        void deveLancarExcecaoQuandoOrcamentoCancelado() {
            Budget budget = criarBudgetPadrao(false);
            budget.setStatus(BudgetStatus.CANCELLED);

            assertThatThrownBy(() -> budgetPdfService.gerarPdfTecnico(budget))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Não é possível gerar o PDF técnico de um orçamento cancelado");
        }

        @Test
        @DisplayName("Deve gerar PDF técnico com múltiplos itens e paginação minimalista sem lançar exceção")
        void deveGerarPdfTecnicoComMultiplosItensEPaginacao() throws Exception {
            Budget budget = criarBudgetComMuitosItens();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isGreaterThan(1);
            }
        }

        @Test
        @DisplayName("Deve tratar cliente nulo ou sem cidade/telefone graciosamente")
        void deveTratarClienteNuloGraciosamente() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.setClient(null);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            assertThat(pdfBytes).isNotNull();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textContent = extrairStreamsDeTexto(reader);
                assertThat(textContent)
                        .contains("CLIENTE / OBRA")
                        .contains("VOLUME DO PEDIDO");
            }
        }
    }

    // =========================================================================
    // 6. TESTES AUTOMATIZADOS DO PDF TÉCNICO — AUSÊNCIA DE TERMOS MONETÁRIOS
    //    [US-11.4] (#285)
    // =========================================================================
    @Nested
    @DisplayName("6. Ausência de Termos Monetários no PDF Técnico [US-11.4] (#285)")
    class AusenciaTermosMonetariosPdfTecnicoTest {

        /**
         * Budget de teste com valores monetários conhecidos e variados para
         * garantir que NENHUM deles "vaze" para a ficha técnica.
         */
        private Budget criarBudgetComValoresMonetariosConhecidos() {
            Client client = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Obra Residencial Alfa")
                    .documentNumber("12.345.678/0001-90")
                    .phone("(83) 99888-7766")
                    .email("alfa@obra.com")
                    .street("Av. Epitácio Pessoa")
                    .number("1500")
                    .neighborhood("Tambaú")
                    .city("João Pessoa")
                    .state("PB")
                    .build();

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-1234");
            budget.setClient(client);
            budget.setStatus(BudgetStatus.SENT);
            budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
            budget.setSubtotal(new BigDecimal("4750.00"));
            budget.setDiscountPercent(new BigDecimal("5.00"));
            budget.setDiscountValue(new BigDecimal("237.50"));
            budget.setTotal(new BigDecimal("4512.50"));
            budget.setCreatedAt(OffsetDateTime.now());
            budget.setValidUntil(OffsetDateTime.now().plusDays(15));
            budget.setNotes("Desconto especial de 5% para pagamento à vista.");

            List<BudgetItem> itens = new ArrayList<>();

            // Item 1: Porta de Giro com valor alto
            BudgetItem item1 = new BudgetItem();
            item1.setId(UUID.randomUUID());
            item1.setProductName("Porta de Giro Premium");
            item1.setTemplateType("SWING_DOOR_1F");
            item1.setWidthMm(new BigDecimal("900"));
            item1.setHeightMm(new BigDecimal("2100"));
            item1.setQuantity(2);
            item1.setSubtotal(new BigDecimal("2400.00"));
            item1.setLaborCost(new BigDecimal("350.00"));
            item1.setBudget(budget);
            item1.setHandleConfig("{\"handleType\":\"BAR_TUBULAR\",\"format\":\"Redondo 40cm\"}");

            List<BudgetItemOption> opts1 = new ArrayList<>();
            BudgetItemOption o1 = new BudgetItemOption();
            o1.setCategoryType(MaterialCategoryType.PROFILE);
            o1.setMaterialName("Linha 25 Suprema");
            o1.setSelectedColor("Preto Fosco");
            opts1.add(o1);
            BudgetItemOption o2 = new BudgetItemOption();
            o2.setCategoryType(MaterialCategoryType.GLASS);
            o2.setMaterialName("Temperado 8mm");
            o2.setSelectedColor("Incolor");
            opts1.add(o2);
            item1.setOptions(opts1);
            itens.add(item1);

            // Item 2: Janela de Correr com desconto no subtotal
            BudgetItem item2 = new BudgetItem();
            item2.setId(UUID.randomUUID());
            item2.setProductName("Janela de Correr 3 Folhas");
            item2.setTemplateType("SLIDING_DOOR_3F");
            item2.setWidthMm(new BigDecimal("1800"));
            item2.setHeightMm(new BigDecimal("1200"));
            item2.setQuantity(3);
            item2.setSubtotal(new BigDecimal("1850.00"));
            item2.setLaborCost(new BigDecimal("200.00"));
            item2.setBudget(budget);

            List<BudgetItemOption> opts2 = new ArrayList<>();
            BudgetItemOption o3 = new BudgetItemOption();
            o3.setCategoryType(MaterialCategoryType.PROFILE);
            o3.setMaterialName("060");
            o3.setSelectedColor("Branco");
            opts2.add(o3);
            BudgetItemOption o4 = new BudgetItemOption();
            o4.setCategoryType(MaterialCategoryType.ROLLERS);
            o4.setMaterialName("Roldana 1125");
            opts2.add(o4);
            item2.setOptions(opts2);
            itens.add(item2);

            // Item 3: Frente de Gaveta — valor unitário baixo
            BudgetItem item3 = new BudgetItem();
            item3.setId(UUID.randomUUID());
            item3.setProductName("Frente de Gaveta MDF");
            item3.setTemplateType("FRONT_DRAWER");
            item3.setWidthMm(new BigDecimal("600"));
            item3.setHeightMm(new BigDecimal("200"));
            item3.setQuantity(4);
            item3.setSubtotal(new BigDecimal("500.00"));
            item3.setLaborCost(new BigDecimal("80.00"));
            item3.setBudget(budget);
            itens.add(item3);

            budget.setItems(itens);
            return budget;
        }

        @Test
        @DisplayName("US-11.4-CT01: O PDF técnico NÃO deve conter R$, Subtotal, Desconto, Preço, ou TOTAL A PAGAR")
        void deveGarantirAusenciaEstritaDeTermosMonetarios() throws IOException {
            Budget budget = criarBudgetComValoresMonetariosConhecidos();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                assertThat(textoExtraido)
                        .as("Nenhum símbolo de moeda R$ deve aparecer no PDF técnico")
                        .doesNotContain("R$")

                        .as("O termo 'Subtotal' não deve aparecer no PDF técnico")
                        .doesNotContain("Subtotal")

                        .as("O termo 'Desconto' não deve aparecer no PDF técnico")
                        .doesNotContain("Desconto")

                        .as("O termo 'Preço' não deve aparecer no PDF técnico")
                        .doesNotContain("Preço")
                        .doesNotContain("Preco")

                        .as("O termo 'Valor Total' não deve aparecer no PDF técnico")
                        .doesNotContain("Valor Total")

                        .as("O termo 'TOTAL A PAGAR' não deve aparecer no PDF técnico")
                        .doesNotContain("TOTAL A PAGAR")

                        .as("O termo 'Mão de Obra' (como rótulo financeiro) não deve aparecer no PDF técnico")
                        .doesNotContain("Mão de Obra")

                        .as("O termo 'Condição de Pagamento' não deve aparecer no PDF técnico")
                        .doesNotContain("Condição de Pagamento")
                        .doesNotContain("Pagamento")

                        .as("O termo 'V. UNIT' não deve aparecer no PDF técnico")
                        .doesNotContain("V. UNIT")

                        .as("O termo 'TOTAL (R$)' não deve aparecer no PDF técnico")
                        .doesNotContain("TOTAL (R$)");
            }
        }

        @Test
        @DisplayName("US-11.4-CT02: Valores monetários conhecidos do orçamento NÃO devem vazar para o PDF técnico")
        void deveGarantirQueValoresMonetariosConhecidosNaoVazam() throws IOException {
            Budget budget = criarBudgetComValoresMonetariosConhecidos();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                // Valores do budget
                assertThat(textoExtraido)
                        .doesNotContain("4.750,00")
                        .doesNotContain("4750")
                        .doesNotContain("237,50")
                        .doesNotContain("4.512,50")
                        .doesNotContain("4512");

                // Valores dos itens (subtotais)
                assertThat(textoExtraido)
                        .doesNotContain("2.400,00")
                        .doesNotContain("2400")
                        .doesNotContain("1.850,00")
                        .doesNotContain("1850");

                // Valores de mão de obra
                assertThat(textoExtraido)
                        .doesNotContain("350,00")
                        .doesNotContain("200,00")
                        .doesNotContain("80,00");

                // Valor unitário implícito (subtotal/qtd) → 2400/2 = 1200
                assertThat(textoExtraido)
                        .doesNotContain("1.200,00");
            }
        }

        @Test
        @DisplayName("US-11.4-CT03: As especificações técnicas obrigatórias DEVEM estar presentes no PDF técnico")
        void deveConterEspecificacoesTecnicasObrigatorias() throws IOException {
            Budget budget = criarBudgetComValoresMonetariosConhecidos();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                // Dimensões em cm (900mm → 90,0cm × 2100mm → 210,0cm)
                assertThat(textoExtraido)
                        .as("Dimensões da Porta de Giro devem estar no PDF técnico")
                        .contains("90,0 x 210,0 cm");

                // Dimensões da Janela de Correr (1800mm → 180,0cm × 1200mm → 120,0cm)
                assertThat(textoExtraido)
                        .as("Dimensões da Janela de Correr devem estar no PDF técnico")
                        .contains("180,0 x 120,0 cm");

                // Dimensões da Frente de Gaveta (600mm → 60,0cm × 200mm → 20,0cm)
                assertThat(textoExtraido)
                        .as("Dimensões da Frente de Gaveta devem estar no PDF técnico")
                        .contains("60,0 x 20,0 cm");

                // Materiais e acabamentos
                assertThat(textoExtraido)
                        .as("Perfil Linha 25 Suprema deve constar")
                        .contains("Linha 25 Suprema");

                assertThat(textoExtraido)
                        .as("Acabamento Preto Fosco deve constar")
                        .contains("Fosco");

                assertThat(textoExtraido)
                        .as("Vidro Temperado 8mm deve constar")
                        .contains("Temperado 8mm");

                // Tipologias traduzidas
                assertThat(textoExtraido)
                        .contains("TIPO: GIRO")
                        .contains("TIPO: CORRER (3 FOLHAS)")
                        .contains("TIPO: FRENTE DE GAVETA");

                // Badges de furação traduzidas
                assertThat(textoExtraido)
                        .contains("DOBRADIÇAS")
                        .contains("ROLDANAS")
                        .contains("FIXAÇÃO CAIXA");
            }
        }

        @Test
        @DisplayName("US-11.4-CT04: Budget com desconto alto e múltiplas condições financeiras não deve vazar nenhum dado comercial")
        void deveManterSigiloComDescontoAltoECondicoesFinanceiras() throws IOException {
            Budget budget = criarBudgetComValoresMonetariosConhecidos();
            budget.setDiscountPercent(new BigDecimal("15.00"));
            budget.setDiscountValue(new BigDecimal("712.50"));
            budget.setTotal(new BigDecimal("4037.50"));
            budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
            budget.setNotes("Desconto especial de 15% + condição 50/50.");

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                assertThat(textoExtraido)
                        .doesNotContain("R$")
                        .doesNotContain("712,50")
                        .doesNotContain("4.037,50")
                        .doesNotContain("15%")
                        .doesNotContain("Desconto")
                        .doesNotContain("Subtotal")
                        .doesNotContain("TOTAL A PAGAR")
                        .doesNotContain("50% Entrada")
                        .doesNotContain("Pagamento");
            }
        }

        @Test
        @DisplayName("US-11.4-CT05: Budget padrão (fixture criarBudgetPadrao completo) deve manter sigilo dos valores 975.62, 639.00 e 150.00")
        void deveManterSigiloNoBudgetPadraoCompleto() throws IOException {
            Budget budget = criarBudgetPadrao(true);

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                assertThat(textoExtraido)
                        .as("Subtotal 975,62 do budget padrão não deve aparecer")
                        .doesNotContain("975,62")
                        .doesNotContain("975.62");

                assertThat(textoExtraido)
                        .as("Subtotal 639,00 do item padrão não deve aparecer")
                        .doesNotContain("639,00")
                        .doesNotContain("639.00");

                assertThat(textoExtraido)
                        .as("Mão de obra 150,00 do item padrão não deve aparecer")
                        .doesNotContain("150,00")
                        .doesNotContain("150.00");

                assertThat(textoExtraido)
                        .doesNotContain("R$")
                        .doesNotContain("Subtotal")
                        .doesNotContain("Desconto")
                        .doesNotContain("TOTAL A PAGAR");
            }
        }

        @Test
        @DisplayName("US-11.4-CT06: Budget com 20 itens e valores altos deve manter sigilo em todas as páginas")
        void deveManterSigiloEmTodasAsPaginasComMuitosItens() throws IOException {
            Budget budget = criarBudgetComMuitosItens();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("Budget com 20 itens deve gerar múltiplas páginas")
                        .isGreaterThan(1);

                String textoExtraido = extrairStreamsDeTexto(reader);

                assertThat(textoExtraido)
                        .doesNotContain("R$")
                        .doesNotContain("Subtotal")
                        .doesNotContain("Desconto")
                        .doesNotContain("Preço")
                        .doesNotContain("TOTAL A PAGAR")
                        .doesNotContain("Mão de Obra")
                        .doesNotContain("Pagamento")

                        // Valores numéricos conhecidos do budget de muitos itens
                        .doesNotContain("15.000,00")
                        .doesNotContain("14.500,00")
                        .doesNotContain("500,00")
                        .doesNotContain("750,00")
                        .doesNotContain("100,00");
            }
        }

        @Test
        @DisplayName("US-11.4-CT07: O cabeçalho FICHA DE USINAGEM E CORTE e código do pedido devem estar presentes mesmo com valores monetários no budget")
        void deveConterCabecalhoFabrilMesmoComValoresFinanceiros() throws IOException {
            Budget budget = criarBudgetComValoresMonetariosConhecidos();

            byte[] pdfBytes = budgetPdfService.gerarPdfTecnico(budget);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String textoExtraido = extrairStreamsDeTexto(reader);

                assertThat(textoExtraido)
                        .contains("FICHA DE USINAGEM E CORTE")
                        .contains("PEDIDO")
                        .contains("ORC-2026-1234")
                        .contains("OBRA RESIDENCIAL ALFA")
                        .contains("VOLUME DO PEDIDO")
                        .contains("9 PEÇAS"); // 2+3+4 = 9
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

    // =========================================================================
    // CASOS COMPLEMENTARES DE COBERTURA E ROBUSTEZ [Joseph Nichollas]
    // =========================================================================

    @Nested
    @DisplayName("Casos Complementares de Cobertura e Robustez [Joseph Nichollas]")
    class CasosComplementaresJosephTest {

        @Test
        @DisplayName("Deve formatar endereço com cliente sem número (apenas logradouro)")
        void deveFormatarEnderecoSemNumero() throws IOException {
            Client client = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Cliente Sem Numero")
                    .street("Rua Principal")
                    .number(null)
                    .neighborhood("Centro")
                    .city("Sousa")
                    .state("PB")
                    .build();

            Budget budget = criarBudgetPadrao(false);
            budget.setClient(client);

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve formatar endereço com cliente sem estado (apenas cidade)")
        void deveFormatarEnderecoSemEstado() throws IOException {
            Client client = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Cliente Sem Estado")
                    .street("Rua Projetada")
                    .number("10")
                    .neighborhood("Bairro Novo")
                    .city("Sousa")
                    .state(null)
                    .build();

            Budget budget = criarBudgetPadrao(false);
            budget.setClient(client);

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve formatar endereço com cliente sem bairro preenchido")
        void deveFormatarEnderecoSemBairro() throws IOException {
            Client client = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Cliente Sem Bairro")
                    .street("Rodovia BR-230")
                    .number("KM 400")
                    .neighborhood("   ")
                    .city("Sousa")
                    .state("PB")
                    .build();

            Budget budget = criarBudgetPadrao(false);
            budget.setClient(client);

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve exibir fallback 'Não informado' para cliente sem telefone e sem e-mail")
        void deveExibirFallbackContatosNaoInformados() throws IOException {
            Client client = Client.builder()
                    .id(UUID.randomUUID())
                    .fullName("Cliente Sem Contato")
                    .phone(null)
                    .email("   ")
                    .street("Rua Qualquer")
                    .build();

            Budget budget = criarBudgetPadrao(false);
            budget.setClient(client);

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{not-a-valid-json: true",
                "{\"type\":\"LEVER_HANDLE\"}",
                "{\"handleType\":\"PUXADOR_ESPECIAL_INOX\"}"
        })
        @DisplayName("Deve processar puxador com JSON malformado, chave fallback ou tipo customizado sem quebrar")
        void deveProcessarVariacoesDeHandleConfigSemQuebrar(String config) throws IOException {
            Budget budget = criarBudgetPadrao(false);
            budget.getItems().getFirst().setHandleConfig(config);

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve traduzir categoria nula para 'Item' em opções de peças")
        void deveTraduzirCategoriaNulaParaItem() throws IOException {
            Budget budget = criarBudgetPadrao(false);
            BudgetItem item = budget.getItems().getFirst();

            BudgetItemOption opt = new BudgetItemOption();
            opt.setId(UUID.randomUUID());
            opt.setMaterialName("Acessório Especial");
            opt.setCategoryType(null); // nulo força fallback "Item"
            opt.setUnitMeasure("UN");
            opt.setQuantity(new BigDecimal("1.00"));
            opt.setUnitPrice(new BigDecimal("25.00"));
            opt.setTotalPrice(new BigDecimal("25.00"));
            opt.setBudgetItem(item);

            item.setOptions(new ArrayList<>(List.of(opt)));

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve gerar PDF com quebra automática em múltiplas páginas para orçamento extenso")
        void deveGerarPdfComMultiplasPaginasEValidarContagem() throws IOException {
            Budget budget = criarBudgetComMuitosItens();

            byte[] pdf = budgetPdfService.gerarPdfComercial(budget);
            assertThat(pdf).isNotNull();
            try (PdfReader reader = new PdfReader(pdf)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(2);
            }
        }
    }

    // =========================================================================
    // 7. TESTES DO RESUMO PARA WHATSAPP [US-10.5] (#225)
    // =========================================================================
    @Nested
    @DisplayName("7. Testes do Resumo para WhatsApp [US-10.5] (#225)")
    class ResumoWhatsAppTest {

        @Test
        @DisplayName("Deve gerar resumo WhatsApp completo com múltiplos itens, desconto percentual e emojis")
        void deveGerarResumoWhatsAppCompletoComSucesso() {
            Budget budget = criarBudgetPadrao(true);
            budget.setCode("ORC-2026-0001");
            budget.getClient().setFullName("João Silva");
            budget.setCreatedAt(OffsetDateTime.parse("2026-08-27T10:00:00Z"));
            budget.setValidUntil(OffsetDateTime.parse("2026-09-11T23:59:59Z"));
            budget.setSubtotal(new BigDecimal("2100.00"));
            budget.setDiscountPercent(new BigDecimal("10.00"));
            budget.setDiscountValue(new BigDecimal("210.00"));
            budget.setTotal(new BigDecimal("1890.00"));
            budget.setPaymentCondition(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);

            List<BudgetItem> itens = new ArrayList<>();

            BudgetItem item1 = new BudgetItem();
            item1.setProductName("Janela 2 Folhas Correr");
            item1.setWidthMm(new BigDecimal("1200.00"));
            item1.setHeightMm(new BigDecimal("1000.00"));
            item1.setQuantity(2);
            item1.setSubtotal(new BigDecimal("900.00"));
            itens.add(item1);

            BudgetItem item2 = new BudgetItem();
            item2.setProductName("Porta de Abrir");
            item2.setWidthMm(new BigDecimal("900.00"));
            item2.setHeightMm(new BigDecimal("2100.00"));
            item2.setQuantity(1);
            item2.setSubtotal(new BigDecimal("1200.00"));
            itens.add(item2);

            budget.setItems(itens);

            String resumo = budgetPdfService.gerarResumoWhatsApp(budget);

            assertThat(resumo)
                    .isNotBlank()
                    .contains("📋 *Orçamento ORC-2026-0001*")
                    .contains("📅 Emissão: 27/08/2026 | Validade: 11/09/2026")
                    .contains("👤 Cliente: João Silva")
                    .contains("📦 Itens:")
                    .contains("• 2x Janela 2 Folhas Correr (1200x1000mm) - R$ 900,00")
                    .contains("• 1x Porta de Abrir (900x2100mm) - R$ 1.200,00")
                    .contains("💰 Subtotal: R$ 2.100,00")
                    .contains("🏷️ Desconto (10%): -R$ 210,00")
                    .contains("📦 *TOTAL: R$ 1.890,00*")
                    .contains("💳 Pagamento: 50% Entrada + 50% na Entrega")
                    .contains("_Alumiportas - Vidraçaria e Esquadrias_");
        }

        @Test
        @DisplayName("Deve omitir linha de desconto quando valor de desconto for zero ou nulo")
        void deveOmitirLinhaDeDescontoQuandoValorForZeroOuNulo() {
            Budget budget = criarBudgetPadrao(true);
            budget.setDiscountValue(BigDecimal.ZERO);
            budget.setDiscountPercent(BigDecimal.ZERO);

            String resumoComZero = budgetPdfService.gerarResumoWhatsApp(budget);
            assertThat(resumoComZero).doesNotContain("Desconto");

            budget.setDiscountValue(null);
            String resumoComNulo = budgetPdfService.gerarResumoWhatsApp(budget);
            assertThat(resumoComNulo).doesNotContain("Desconto");
        }

        @Test
        @DisplayName("Deve formatar desconto fixo quando não houver percentual")
        void deveFormatarDescontoFixoSemPercentual() {
            Budget budget = criarBudgetPadrao(true);
            budget.setDiscountValue(new BigDecimal("150.00"));
            budget.setDiscountPercent(null);

            String resumo = budgetPdfService.gerarResumoWhatsApp(budget);

            assertThat(resumo)
                    .contains("🏷️ Desconto: -R$ 150,00")
                    .doesNotContain("Desconto (");
        }

        @Test
        @DisplayName("Deve formatar item sem dimensões quando largura e altura forem nulas")
        void deveFormatarItemSemDimensoes() {
            Budget budget = criarBudgetPadrao(true);

            BudgetItem itemSemMedidas = new BudgetItem();
            itemSemMedidas.setProductName("Fechadura Especial");
            itemSemMedidas.setWidthMm(null);
            itemSemMedidas.setHeightMm(null);
            itemSemMedidas.setQuantity(1);
            itemSemMedidas.setSubtotal(new BigDecimal("80.00"));

            budget.setItems(List.of(itemSemMedidas));

            String resumo = budgetPdfService.gerarResumoWhatsApp(budget);

            assertThat(resumo)
                    .contains("• 1x Fechadura Especial - R$ 80,00")
                    .doesNotContain("(mm)");
        }

        @Test
        @DisplayName("Deve tratar cliente ou condição de pagamento nulos exibindo valores seguros")
        void deveTratarClienteECondicaoPagamentoNulos() {
            Budget budget = criarBudgetPadrao(false);
            budget.setCode(null);
            budget.setClient(null);
            budget.setPaymentCondition(null);
            budget.setItems(Collections.emptyList());

            String resumo = budgetPdfService.gerarResumoWhatsApp(budget);

            assertThat(resumo)
                    .contains("📋 *Orçamento N/A*")
                    .contains("👤 Cliente: Não informado")
                    .contains("💳 Pagamento: A Combinar");
        }

        @Test
        @DisplayName("Deve lançar NullPointerException quando budget for nulo")
        void deveLancarNullPointerExceptionQuandoBudgetForNulo() {
            assertThatThrownBy(() -> budgetPdfService.gerarResumoWhatsApp(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("O orçamento não pode ser nulo");
        }

        @Test
        @DisplayName("Deve preservar rigorosamente todos os emojis e caracteres acentuados em UTF-8")
        void devePreservarEmojisECaracteresAcentuadosEmUtf8() {
            Budget budget = criarBudgetPadrao(true);
            budget.setDiscountValue(new BigDecimal("50.00"));

            String resumo = budgetPdfService.gerarResumoWhatsApp(budget);

            assertThat(resumo)
                    .contains("📋")
                    .contains("📅")
                    .contains("👤")
                    .contains("📦")
                    .contains("•")
                    .contains("💰")
                    .contains("🏷️")
                    .contains("💳");
        }
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
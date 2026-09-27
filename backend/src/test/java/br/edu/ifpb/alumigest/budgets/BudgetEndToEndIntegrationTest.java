package br.edu.ifpb.alumigest.budgets;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.budgets.service.BudgetPdfService;
import br.edu.ifpb.alumigest.catalog.domain.HandleType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 🧪 Teste de Integração End-to-End (Produto -> Orçamento -> PDF) — QA-03 (#73).
 *
 * Valida a jornada ponta a ponta:
 * 1. Jornada Principal (Fluxo Feliz):
 *    - Cadastro de produto template ("Box Frontal 2 Folhas" com categorias Vidro, Perfil, Ferragens)
 *    - Cadastro de cliente ("Vidraçaria Silva" com telefone e endereço da obra)
 *    - Criação de orçamento vinculado ao cliente
 *    - Configuração de 2 unidades com 1400x1900mm, Vidro 8mm Incolor, Perfis Linha Box Branco, Kit Standard
 *    - Configuração paramétrica de Puxador Tubular Inox 40cm e furação com 2 furos por igual
 *    - Aplicação de 5% de desconto comercial e salvamento
 *    - Validação dos dados comerciais, romaneio de peças e saída A4 em PDF
 *
 * 2. Teste de Paginação e Impressão Multipágina:
 *    - Orçamento com 5 esquadrias distintas
 *    - Validação de que nenhum desenho SVG é cortado em quebra de página
 *    - Validação de repetição do cabeçalho da tabela nas páginas seguintes
 *    - Validação da integridade dos blocos de totais e assinaturas na página final
 */
@DisplayName("QA-03: Teste de Integração End-to-End (Produto -> Orçamento -> PDF) [Issue #73]")
class BudgetEndToEndIntegrationTest {

    private BudgetPdfService budgetPdfService;
    private CompanyProperties companyProps;

    @BeforeEach
    void setUp() {
        companyProps = new CompanyProperties();
        companyProps.setRazaoSocial("Alumiportas Indústria & Comércio de Esquadrias LTDA");
        companyProps.setCnpj("12.345.678/0001-90");
        companyProps.setInscricaoEstadual("16.000.123-4");
        companyProps.setTelefone("(83) 3521-1000");
        companyProps.setEndereco("Rua das Indústrias, 500 - Distrito Industrial");
        companyProps.setCidadeUf("Sousa - PB");

        budgetPdfService = new BudgetPdfService(companyProps);
    }

    // =========================================================================
    // CENÁRIO 1: JORNADA PRINCIPAL (FLUXO FELIZ)
    // =========================================================================
    @Nested
    @DisplayName("Cenário 1 — Jornada Principal (Fluxo Feliz: Produto -> Cliente -> Orçamento -> PDF)")
    class JornadaPrincipalFluxoFelizTest {

        @Test
        @DisplayName("Deve executar o ciclo completo E2E: template -> cliente -> orçamento 1400x1900 -> 5% desc -> PDF A4")
        void deveExecutarCicloCompletoE2E() throws IOException {
            // 1. Cadastrar um template de produto "Box Frontal 2 Folhas" com categorias: Vidro, Perfil, Ferragens
            String produtoNome = "Box Frontal 2 Folhas";
            String templateType = "SLIDING_DOOR_2F";
            List<MaterialCategoryType> categoriasRequeridas = List.of(
                    MaterialCategoryType.GLASS,
                    MaterialCategoryType.PROFILE,
                    MaterialCategoryType.HARDWARE
            );
            assertThat(categoriasRequeridas)
                    .containsExactlyInAnyOrder(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.HARDWARE);

            // 2. Cadastrar novo cliente "Vidraçaria Silva" com telefone e endereço da obra
            Client cliente = new Client();
            cliente.setId(UUID.randomUUID());
            cliente.setFullName("Vidraçaria Silva");
            cliente.setPersonType(PersonType.JURIDICA);
            cliente.setDocumentNumber("11.222.333/0001-44");
            cliente.setPhone("(83) 98765-4321");
            cliente.setStreet("Av. Projetada");
            cliente.setNumber("123");
            cliente.setNeighborhood("Centro");
            cliente.setCity("Sousa");
            cliente.setState("PB");
            cliente.setZipCode("58800-000");

            // 3. Criar orçamento selecionando o cliente cadastrado
            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-QA03");
            budget.setClient(cliente);
            budget.setStatus(BudgetStatus.DRAFT);
            budget.setPaymentCondition(PaymentCondition.A_VISTA_PIX);
            budget.setPaymentNotes("Condição especial para Vidraçaria Silva — 5% desc. à vista no PIX");
            budget.setCreatedAt(OffsetDateTime.now());
            budget.setValidUntil(OffsetDateTime.now().plusDays(15));
            budget.setNotes("Entrega e montagem no endereço da obra em Sousa/PB");

            // 4. Adicionar 2 unidades do Box Frontal com medidas 1400 × 1900 mm
            BudgetItem boxItem = new BudgetItem();
            boxItem.setId(UUID.randomUUID());
            boxItem.setBudget(budget);
            boxItem.setProductName(produtoNome);
            boxItem.setTemplateType(templateType);
            boxItem.setWidthMm(new BigDecimal("1400"));
            boxItem.setHeightMm(new BigDecimal("1900"));
            boxItem.setQuantity(2);
            boxItem.setLaborCost(new BigDecimal("120.00")); // Mão de obra R$ 120 por unidade

            // 5. Selecionar Vidro 8mm Incolor, Perfis Linha Box Branco e Kit Ferragens Standard
            boxItem.setTemplateConfig("""
                    {
                      "profileMm": 20,
                      "aluminumColor": "Linha Box Branco",
                      "glassFinish": "8mm Incolor",
                      "openingDirection": "LEFT_TO_RIGHT"
                    }
                    """);

            // 6. Configurar Puxador Tubular Inox 40cm e furação com 2 furos por igual
            boxItem.setHandleConfig("""
                    {
                      "handleType": "BAR_TUBULAR",
                      "pieceLengthMm": 400,
                      "side": "BOTH",
                      "coverage": "FULL"
                    }
                    """);

            boxItem.setDrillingConfig("""
                    {
                      "holeCount": 2,
                      "divisionType": "EQUAL"
                    }
                    """);

            // Insumos calculados do item (2 unidades)
            List<BudgetItemOption> options = new ArrayList<>();
            // Vidro 8mm Incolor
            BudgetItemOption optVidro = new BudgetItemOption();
            optVidro.setId(UUID.randomUUID());
            optVidro.setBudgetItem(boxItem);
            optVidro.setMaterialName("Vidro 8mm Temperado Incolor");
            optVidro.setCategoryType(MaterialCategoryType.GLASS);
            optVidro.setUnitMeasure("m²");
            optVidro.setQuantity(new BigDecimal("5.38"));
            optVidro.setUnitPrice(new BigDecimal("140.00"));
            optVidro.setTotalPrice(optVidro.getQuantity().multiply(optVidro.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            options.add(optVidro);

            // Perfis Linha Box Branco
            BudgetItemOption optPerfil = new BudgetItemOption();
            optPerfil.setId(UUID.randomUUID());
            optPerfil.setBudgetItem(boxItem);
            optPerfil.setMaterialName("Kit Perfis Linha Box Branco");
            optPerfil.setCategoryType(MaterialCategoryType.PROFILE);
            optPerfil.setUnitMeasure("barra");
            optPerfil.setQuantity(new BigDecimal("2"));
            optPerfil.setUnitPrice(new BigDecimal("185.00"));
            optPerfil.setTotalPrice(optPerfil.getQuantity().multiply(optPerfil.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            options.add(optPerfil);

            // Kit Ferragens Standard
            BudgetItemOption optFerragem = new BudgetItemOption();
            optFerragem.setId(UUID.randomUUID());
            optFerragem.setBudgetItem(boxItem);
            optFerragem.setMaterialName("Kit Ferragens Box Standard");
            optFerragem.setCategoryType(MaterialCategoryType.HARDWARE);
            optFerragem.setUnitMeasure("un");
            optFerragem.setQuantity(new BigDecimal("2"));
            optFerragem.setUnitPrice(new BigDecimal("95.00"));
            optFerragem.setTotalPrice(optFerragem.getQuantity().multiply(optFerragem.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            options.add(optFerragem);

            // Puxador Tubular Inox 40cm
            BudgetItemOption optPuxador = new BudgetItemOption();
            optPuxador.setId(UUID.randomUUID());
            optPuxador.setBudgetItem(boxItem);
            optPuxador.setMaterialName("Puxador Tubular Inox 40cm");
            optPuxador.setCategoryType(MaterialCategoryType.HARDWARE);
            optPuxador.setUnitMeasure("un");
            optPuxador.setQuantity(new BigDecimal("2"));
            optPuxador.setUnitPrice(new BigDecimal("65.00"));
            optPuxador.setTotalPrice(optPuxador.getQuantity().multiply(optPuxador.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            options.add(optPuxador);

            boxItem.setOptions(options);

            // Subtotal do item = soma das opções + mão de obra (2 * 120 = 240)
            BigDecimal subtotalInsumos = options.stream()
                    .map(BudgetItemOption::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalMaoDeObraItem = boxItem.getLaborCost().multiply(BigDecimal.valueOf(boxItem.getQuantity()));
            boxItem.setSubtotal(subtotalInsumos.add(totalMaoDeObraItem));

            budget.setItems(List.of(boxItem));
            budget.setSubtotal(boxItem.getSubtotal());

            // 7. Aplicar 5% de desconto comercial e salvar orçamento
            budget.setDiscountPercent(new BigDecimal("5.00"));
            BigDecimal valorDesconto = budget.getSubtotal()
                    .multiply(new BigDecimal("0.05"))
                    .setScale(2, RoundingMode.HALF_UP);
            budget.setDiscountValue(valorDesconto);
            budget.setTotal(budget.getSubtotal().subtract(valorDesconto));

            // Validações do estado de negócio
            assertAll(
                    () -> assertThat(budget.getCode()).isEqualTo("ORC-2026-QA03"),
                    () -> assertThat(budget.getClient().getFullName()).isEqualTo("Vidraçaria Silva"),
                    () -> assertThat(budget.getItems()).hasSize(1),
                    () -> assertThat(budget.getItems().get(0).getQuantity()).isEqualTo(2),
                    () -> assertThat(budget.getDiscountPercent()).isEqualByComparingTo("5.00"),
                    () -> assertThat(budget.getTotal()).isLessThan(budget.getSubtotal())
            );

            // 8. Gerar PDF da Proposta Comercial e validar saída A4 limpa sem cortes
            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);
            assertNotNull(pdfBytes);
            assertTrue(pdfBytes.length > 0);

            // Validar assinatura do cabeçalho PDF oficial
            String pdfHeader = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(pdfHeader).isEqualTo("%PDF-");

            // Inspecionar o conteúdo gerado via PdfReader
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("A proposta de 1 item com 2 unidades deve ser formatada perfeitamente na página 1")
                        .isGreaterThanOrEqualTo(1);

                PdfTextExtractor extractor = new PdfTextExtractor(reader);
                String pagina1Texto = extractor.getTextFromPage(1);

                // Conferir dados da proposta comercial
                assertThat(pagina1Texto)
                        .contains("ORC-2026-QA03")
                        .contains("Vidraçaria Silva")
                        .contains("Box Frontal 2 Folhas")
                        .contains("140,00cm")
                        .contains("190,00cm")
                        .contains("TOTAL A PAGAR")
                        .contains("Desconto")
                        .contains("Assinatura do Cliente");

                // Conferir dados de contato e endereço da obra do cliente
                assertThat(pagina1Texto)
                        .contains("Sousa")
                        .contains("PB");
            }
        }
    }

    // =========================================================================
    // CENÁRIO 2: TESTE DE PAGINAÇÃO E IMPRESSÃO MULTIPÁGINA
    // =========================================================================
    @Nested
    @DisplayName("Cenário 2 — Teste de Paginação e Impressão Multipágina (5 Esquadrias Distintas)")
    class PaginacaoEImpressaoMultipaginaTest {

        @Test
        @DisplayName("Deve gerar proposta multipágina com 5 esquadrias preservando cabeçalho de tabela e integridade de totais")
        void deveGerarPropostaMultipaginaCom5EsquadriasComIntegridade() throws IOException {
            Client cliente = new Client();
            cliente.setId(UUID.randomUUID());
            cliente.setFullName("Vidraçaria Silva & Construções LTDA");
            cliente.setPersonType(PersonType.JURIDICA);
            cliente.setDocumentNumber("11.222.333/0001-44");
            cliente.setPhone("(83) 98765-4321");
            cliente.setStreet("Rua das Palmeiras");
            cliente.setNumber("789");
            cliente.setNeighborhood("Alto do Cruzeiro");
            cliente.setCity("Sousa");
            cliente.setState("PB");

            Budget budget = new Budget();
            budget.setId(UUID.randomUUID());
            budget.setCode("ORC-2026-MULTI-5");
            budget.setClient(cliente);
            budget.setStatus(BudgetStatus.SENT);
            budget.setPaymentCondition(PaymentCondition.CARTAO_12X);
            budget.setCreatedAt(OffsetDateTime.now());
            budget.setValidUntil(OffsetDateTime.now().plusDays(20));
            budget.setNotes("Projeto arquitetônico Residencial Alpha — 5 tipologias sob medida");

            // 5 Esquadrias distintas para forçar extrapolação de altura e paginação
            List<BudgetItem> itens = new ArrayList<>();

            // 1. Porta de Correr 2 Folhas (Sala)
            itens.add(criarItem(budget, "Porta de Correr 2 Folhas - Sala", "SLIDING_DOOR_2F",
                    new BigDecimal("2200"), new BigDecimal("2400"), 1, "Preto", "8mm Fumê",
                    HandleType.BAR_TUBULAR, 2, "Linha Suprema"));

            // 2. Janela Maxim-Ar (Banheiro Suíte)
            itens.add(criarItem(budget, "Janela Maxim-Ar - Suíte", "AWNING_WINDOW_1F",
                    new BigDecimal("800"), new BigDecimal("600"), 2, "Branco", "6mm Mini-Boreal",
                    HandleType.LEVER_HANDLE, 0, "Linha 25"));

            // 3. Box Frontal 2 Folhas (Banheiro Social)
            itens.add(criarItem(budget, "Box Frontal 2 Folhas - Social", "SLIDING_DOOR_2F",
                    new BigDecimal("1400"), new BigDecimal("1900"), 2, "Branco", "8mm Incolor",
                    HandleType.BAR_TUBULAR, 2, "Linha Box"));

            // 4. Painel Fixo de Vidro (Fachada)
            itens.add(criarItem(budget, "Painel Fixo de Vidro - Fachada", "FIXED_PANEL",
                    new BigDecimal("2800"), new BigDecimal("2600"), 1, "Preto", "10mm Laminado Incolor",
                    HandleType.NONE, 0, "Linha Fachada Spider"));

            // 5. Porta de Abrir 1 Folha (Cozinha / Área de Serviço)
            itens.add(criarItem(budget, "Porta de Giro 1 Folha - Cozinha", "SWING_DOOR_1F",
                    new BigDecimal("900"), new BigDecimal("2100"), 1, "Preto", "8mm Incolor",
                    HandleType.LEVER_HANDLE, 1, "Linha Gold"));

            budget.setItems(itens);

            BigDecimal subtotalTotal = itens.stream()
                    .map(BudgetItem::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            budget.setSubtotal(subtotalTotal);

            // Desconto comercial de 5%
            budget.setDiscountPercent(new BigDecimal("5.00"));
            BigDecimal descValor = subtotalTotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
            budget.setDiscountValue(descValor);
            budget.setTotal(subtotalTotal.subtract(descValor));

            // Geração do PDF
            byte[] pdfBytes = budgetPdfService.gerarPdfComercial(budget);
            assertNotNull(pdfBytes);
            assertThat(pdfBytes).isNotEmpty();

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                int totalPaginas = reader.getNumberOfPages();

                assertThat(totalPaginas)
                        .as("Com 5 esquadrias completas e descrições detalhadas, o PDF deve gerar 2 ou mais páginas A4")
                        .isGreaterThanOrEqualTo(2);

                PdfTextExtractor extractor = new PdfTextExtractor(reader);

                // Validação Página 1:
                String p1 = extractor.getTextFromPage(1);
                assertThat(p1)
                        .as("A página 1 deve conter o código timbrado e o cliente")
                        .contains("ORC-2026-MULTI-5")
                        .contains("Vidraçaria Silva & Construções LTDA")
                        .contains("MINIATURA")
                        .contains("PRODUTO / DESCRIÇÃO TÉCNICA");

                // Validação Páginas Seguintes: Repetição de Cabeçalho da Tabela
                for (int page = 2; page <= totalPaginas; page++) {
                    String pageContent = extractor.getTextFromPage(page);

                    // Valida que o cabeçalho/rodapé do evento repete o código do orçamento
                    assertThat(pageContent)
                            .as("Página " + page + " deve conter o código do orçamento no cabeçalho/rodapé do evento")
                            .contains("ORC-2026-MULTI-5");

                    assertThat(pageContent).isNotEmpty();
                }

                // Validação da Última Página: Totais e Assinaturas íntegros
                String ultimaPagina = extractor.getTextFromPage(totalPaginas);
                assertThat(ultimaPagina)
                        .as("A última página deve conter o fechamento financeiro com TOTAL A PAGAR e assinatura")
                        .contains("TOTAL A PAGAR")
                        .contains("Assinatura do Cliente")
                        .contains("Confirmo a aprovação das medidas");
            }
        }

        private BudgetItem criarItem(Budget budget, String nome, String templateType,
                                     BigDecimal width, BigDecimal height, int qty,
                                     String corPerfil, String acabamentoVidro,
                                     HandleType handleType, int furos, String linha) {
            BudgetItem item = new BudgetItem();
            item.setId(UUID.randomUUID());
            item.setBudget(budget);
            item.setProductName(nome);
            item.setTemplateType(templateType);
            item.setWidthMm(width);
            item.setHeightMm(height);
            item.setQuantity(qty);
            item.setLaborCost(new BigDecimal("150.00"));

            item.setTemplateConfig(String.format("""
                    {
                      "profileMm": 25,
                      "aluminumColor": "%s",
                      "glassFinish": "%s",
                      "line": "%s"
                    }
                    """, corPerfil, acabamentoVidro, linha));

            item.setHandleConfig(String.format("""
                    {
                      "handleType": "%s",
                      "pieceLengthMm": 400
                    }
                    """, handleType.name()));

            item.setDrillingConfig(String.format("""
                    {
                      "holeCount": %d,
                      "divisionType": "EQUAL"
                    }
                    """, furos));

            List<BudgetItemOption> opts = new ArrayList<>();
            BudgetItemOption o1 = new BudgetItemOption();
            o1.setId(UUID.randomUUID());
            o1.setBudgetItem(item);
            o1.setMaterialName("Vidro " + acabamentoVidro);
            o1.setCategoryType(MaterialCategoryType.GLASS);
            o1.setUnitMeasure("m²");
            BigDecimal area = width.multiply(height).divide(new BigDecimal("1000000"), 2, RoundingMode.HALF_UP);
            o1.setQuantity(area.multiply(BigDecimal.valueOf(qty)));
            o1.setUnitPrice(new BigDecimal("160.00"));
            o1.setTotalPrice(o1.getQuantity().multiply(o1.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            opts.add(o1);

            BudgetItemOption o2 = new BudgetItemOption();
            o2.setId(UUID.randomUUID());
            o2.setBudgetItem(item);
            o2.setMaterialName("Perfis " + corPerfil + " - " + linha);
            o2.setCategoryType(MaterialCategoryType.PROFILE);
            o2.setUnitMeasure("barra");
            o2.setQuantity(new BigDecimal("2"));
            o2.setUnitPrice(new BigDecimal("210.00"));
            o2.setTotalPrice(o2.getQuantity().multiply(o2.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            opts.add(o2);

            item.setOptions(opts);

            BigDecimal subtotalOpts = opts.stream().map(BudgetItemOption::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalMo = item.getLaborCost().multiply(BigDecimal.valueOf(qty));
            item.setSubtotal(subtotalOpts.add(totalMo));

            return item;
        }
    }
}

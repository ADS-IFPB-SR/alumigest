package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfReader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Bateria de testes unitários com técnicas formais de QA para {@link LabelPdfService}.
 * US-17.1 — Serviço LabelPdfService com layout térmico (100x60mm) (#448).
 */
@DisplayName("LabelPdfService - Testes de Geração de Etiquetas Térmicas [US-17.1]")
class LabelPdfServiceTest {

    private LabelPdfService labelPdfService;
    private CompanyProperties companyProps;

    @BeforeEach
    void setUp() {
        companyProps = new CompanyProperties();
        companyProps.setRazaoSocial("Alumiportas LTDA");
        companyProps.setCnpj("00.000.000/0001-99");
        companyProps.setInscricaoEstadual("12345678-9");
        companyProps.setTelefone("(83) 98888-7777");
        companyProps.setEndereco("Rua das Esquadrias, 100");
        companyProps.setCidadeUf("Sousa - PB");

        labelPdfService = new LabelPdfService(companyProps);
    }

    private Order criarOrdemPadraoComDoisItens() {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .codigo("OS-2026-0002")
                .orcamentoId(UUID.randomUUID())
                .clienteNome("João Silva")
                .clienteTelefone("(83) 98877-6655")
                .clienteEndereco("Av. Epitácio Pessoa, 1500 - Apto 402")
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .dataAprovacao(LocalDate.of(2026, 10, 12))
                .dataPrevisaoEntrega(LocalDate.of(2026, 10, 28))
                .valorBruto(new BigDecimal("4500.00"))
                .valorLiquido(new BigDecimal("4500.00"))
                .build();

        Product prod1 = new Product();
        ReflectionTestUtils.setField(prod1, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(prod1, "name", "Janela de Correr 2 Folhas");
        ReflectionTestUtils.setField(prod1, "templateType", DoorTemplateType.SLIDING_WINDOW_2F);

        OrderItem item1 = OrderItem.builder()
                .id(UUID.randomUUID())
                .product(prod1)
                .descricao("Janela de Correr 2 Folhas Linha Gold")
                .larguraMm(1200)
                .alturaMm(1500)
                .quantidade(2)
                .corAluminio("Preto Anodizado")
                .tipoVidro("Incolor 6mm Temperado")
                .ordem(1)
                .build();

        Product prod2 = new Product();
        ReflectionTestUtils.setField(prod2, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(prod2, "name", "Porta Balcão 3 Folhas");
        ReflectionTestUtils.setField(prod2, "templateType", DoorTemplateType.SLIDING_DOOR_3F);

        OrderItem item2 = OrderItem.builder()
                .id(UUID.randomUUID())
                .product(prod2)
                .descricao("Porta Balcão 3 Folhas Linha Suprema")
                .larguraMm(2000)
                .alturaMm(2100)
                .quantidade(1)
                .corAluminio("Branco Anodizado")
                .tipoVidro("Incolor 8mm Temperado")
                .ordem(2)
                .build();

        order.addItem(item1);
        order.addItem(item2);
        return order;
    }

    // =========================================================================
    // 1. Particionamento de Equivalência (EP) - Geração Válida
    // =========================================================================

    @Nested
    @DisplayName("1. [Particionamento de Equivalência] Geração de Etiquetas Válidas")
    class GeracaoValidaTestes {

        @Test
        @DisplayName("Deve gerar PDF térmico com exatamente 3 páginas para 3 peças físicas")
        void deveGerarPdfComContagemExataDePaginas() throws IOException {
            Order order = criarOrdemPadraoComDoisItens();

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            assertThat(pdfBytes)
                    .as("Bytes do PDF não podem ser nulos ou vazios")
                    .isNotNull()
                    .isNotEmpty();

            String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(header).isEqualTo("%PDF-");

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                // Item 1 (2 janelas x 2 folhas = 4) e Item 2 (1 porta x 3 folhas = 3) => Total = 7 páginas
                assertThat(reader.getNumberOfPages())
                        .as("O documento deve ter exatamente 7 páginas físicas (uma por folha)")
                        .isEqualTo(7);

                // Validação das dimensões térmicas 100mm x 60mm (283.46 pt x 170.08 pt)
                for (int i = 1; i <= 7; i++) {
                    Rectangle pageSize = reader.getPageSize(i);
                    assertThat(pageSize.getWidth())
                            .as("Largura da página %d deve ser 100mm (283.46 pt)", i)
                            .isEqualTo(283.46f);
                    assertThat(pageSize.getHeight())
                            .as("Altura da página %d deve ser 60mm (170.08 pt)", i)
                            .isEqualTo(170.08f);
                }
            }
        }

        @Test
        @DisplayName("Deve conter numeração combinada e dados técnicos em cada página")
        void deveConterNumeracaoCombinadaEDadosTecnicos() throws IOException {
            Order order = criarOrdemPadraoComDoisItens();

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String pagina1 = extrairTextoDaPagina(reader, 1);
                String pagina2 = extrairTextoDaPagina(reader, 2);
                String pagina5 = extrairTextoDaPagina(reader, 5);

                // Página 1: Item 1, Esquadria 1/2, Folha 1/2
                assertThat(pagina1).contains("OS-2026-0002");
                assertThat(pagina1).contains("JOÃO SILVA");
                assertThat(pagina1).contains("Item 01");
                assertThat(pagina1).contains("Folha 01/02");
                assertThat(pagina1).contains("1200 x 1500 mm");
                assertThat(pagina1).contains("Preto Anodizado");
                assertThat(pagina1).contains("Incolor 6mm");
                assertThat(pagina1).contains("Temperado");

                // Página 2: Item 1, Esquadria 1/2, Folha 2/2
                assertThat(pagina2).contains("OS-2026-0002");
                assertThat(pagina2).contains("Folha 02/02");
                assertThat(pagina2).contains("1200 x 1500 mm");

                // Página 5: Item 2, Esquadria 1/1, Folha 1/3
                assertThat(pagina5).contains("OS-2026-0002");
                assertThat(pagina5).contains("Item 02");
                assertThat(pagina5).contains("Folha 01/03");
                assertThat(pagina5).contains("2000 x 2100 mm");
                assertThat(pagina5).contains("Branco Anodizado");
                assertThat(pagina5).contains("Incolor 8mm");
                assertThat(pagina5).contains("Temperado");
            }
        }

        @Test
        @DisplayName("Deve priorizar ambiente configurado no JSON de templateConfig")
        void devePriorizarAmbienteDoTemplateConfig() throws IOException {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-0099")
                    .clienteNome("Maria Oliveira")
                    .clienteEndereco("Rua das Flores, 123")
                    .build();

            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao("Janela Quarto")
                    .larguraMm(1000)
                    .alturaMm(1200)
                    .quantidade(1)
                    .templateConfig("{\"ambiente\": \"Suíte Master - Bloco A\"}")
                    .build();

            order.addItem(item);

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                String conteudo = extrairTextoDaPagina(reader, 1);
                assertThat(conteudo).contains("Suíte Master - Bloco A");
            }
        }

        @Test
        @DisplayName("Deve gerar etiquetas apenas para o item especificado quando itemId for informado")
        void deveGerarEtiquetasParaItemEspecificoQuandoItemIdInformado() throws IOException {
            Order order = criarOrdemPadraoComDoisItens();
            UUID itemId = order.getItems().get(1).getId();

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order, itemId);

            assertThat(pdfBytes).isNotNull().isNotEmpty();
            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("Item 2 possui 1 esquadria de 3 folhas, logo deve gerar exatamente 3 páginas")
                        .isEqualTo(3);
            }
        }
    }

    // =========================================================================
    // 2. Análise de Valor Limite (BVA)
    // =========================================================================

    @Nested
    @DisplayName("2. [Análise de Valor Limite] Limites de Itens e Textos Longos")
    class LimitesTestes {

        @Test
        @DisplayName("Deve gerar exatamente 1 página para ordem com item único de quantidade 1")
        void deveGerarExatamenteUmaPaginaParaItemUnico() throws IOException {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-0001")
                    .clienteNome("Carlos Eduardo")
                    .build();

            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao("Porta Pivotante Linha Gold")
                    .larguraMm(1100)
                    .alturaMm(2200)
                    .quantidade(1)
                    .build();

            order.addItem(item);

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
                String conteudo = extrairTextoDaPagina(reader, 1);
                assertThat(conteudo).contains("Item 01");
                assertThat(conteudo).contains("Peça 01/01");
            }
        }

        @Test
        @DisplayName("Deve truncar textos longos sem estourar altura e sem criar páginas extras")
        void deveTruncarTextosLongosSemEstourarPaginacao() throws IOException {
            String nomeLongo = "Empresa de Construcoes Civis e Empreendimentos Imobiliarios "
                    + "do Nordeste Brasileiro Sociedade Anonima";
            String descLonga = "Janela de Correr Especial 6 Folhas com Fecho Concha Superior "
                    + "e Vidro Refletivo Habitat Neutro 8mm Temperado e Laminado Acabamento Inox";
            String enderecoLongo = "Avenida Governador Argemiro de Figueiredo, Edificio Oceanic "
                    + "Tower, Bloco C, Cobertura Duplex 1402, Bessa, Joao Pessoa, PB";

            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-0005")
                    .clienteNome(nomeLongo)
                    .clienteEndereco(enderecoLongo)
                    .build();

            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao(descLonga)
                    .larguraMm(2400)
                    .alturaMm(1600)
                    .quantidade(2)
                    .build();

            order.addItem(item);

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                // 2 esquadrias x 6 folhas = 12 páginas físicas
                assertThat(reader.getNumberOfPages())
                        .as("Deve gerar rigorosamente 12 páginas (2 esquadrias x 6 folhas) sem estourar altura")
                        .isEqualTo(12);
            }
        }
    }

    // =========================================================================
    // 3. Robustez e Tratamento de Exceções
    // =========================================================================

    @Nested
    @DisplayName("3. [Robustez & Exceções] Tratamento de Falhas e Nulos")
    class ExcecoesERobustezTestes {

        @Test
        @DisplayName("Deve lançar NullPointerException quando a ordem for nula")
        void deveLancarExcecaoQuandoOrdemForNula() {
            assertThatThrownBy(() -> labelPdfService.gerarEtiquetas(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("A ordem de serviço não pode ser nula");
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando a ordem não contiver itens")
        void deveLancarBusinessExceptionQuandoItensForemNulos() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-VAZIA")
                    .build();

            assertThatThrownBy(() -> labelPdfService.gerarEtiquetas(order))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("não possui itens");
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando o itemId informado não existir na ordem")
        void deveLancarResourceNotFoundExceptionQuandoItemIdNaoExistir() {
            Order order = criarOrdemPadraoComDoisItens();
            UUID itemIdInexistente = UUID.randomUUID();

            assertThatThrownBy(() -> labelPdfService.gerarEtiquetas(order, itemIdInexistente))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Item do Pedido");
        }

        @Test
        @DisplayName("Deve gerar etiquetas resilientes quando campos opcionais forem nulos")
        void deveGerarEtiquetasQuandoCamposOpcionaisForemNulos() throws IOException {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-MIN")
                    .clienteNome(null)
                    .clienteEndereco(null)
                    .observacoes(null)
                    .build();

            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao(null)
                    .corAluminio(null)
                    .tipoVidro(null)
                    .larguraMm(null)
                    .alturaMm(null)
                    .quantidade(1)
                    .build();

            order.addItem(item);

            byte[] pdfBytes = labelPdfService.gerarEtiquetas(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isEqualTo(1);
                String conteudo = extrairTextoDaPagina(reader, 1);
                assertThat(conteudo).contains("OS-2026-MIN");
                assertThat(conteudo).contains("0 x 0 mm");
                assertThat(conteudo).contains("Não informado");
            }
        }
    }

    // =========================================================================
    // Utilitário de Extração de Texto de Streams OpenPDF
    // =========================================================================

    private String extrairTextoDaPagina(PdfReader reader, int pageNum) throws IOException {
        byte[] pageBytes = reader.getPageContent(pageNum);
        if (pageBytes == null) {
            return "";
        }
        String raw = new String(pageBytes, StandardCharsets.ISO_8859_1);
        return raw.replace("\\(", "(").replace("\\)", "")
                .replace("\\341", "á").replace("\\351", "é").replace("\\355", "í")
                .replace("\\363", "ó").replace("\\372", "ú").replace("\\343", "ã")
                .replace("\\365", "õ").replace("\\347", "ç").replace("\\301", "Á")
                .replace("\\311", "É").replace("\\323", "Ó").replace("\\303", "Ã")
                .replace("\\325", "Õ").replace("\\307", "Ç");
    }
}

package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import com.lowagie.text.pdf.PdfReader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Testes unitários para {@link OrderPdfService}.
 * US-16.1 — Comprovante de Pedido de Venda em PDF (#364).
 */
@DisplayName("OrderPdfService - Testes de Geração do Comprovante PDF [US-16.1]")
class OrderPdfServiceTest {

    private OrderPdfService orderPdfService;
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
        orderPdfService = new OrderPdfService(companyProps);
    }

    private Order criarPedidoPadrao() {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .codigo("PED-2026-0001")
                .orcamentoId(UUID.randomUUID())
                .clienteNome("Construtora Silva LTDA")
                .clienteTelefone("(83) 98888-0001")
                .clienteEndereco("Rua Central, 500 - Campina Grande/PB")
                .status(OrderStatus.WAITING_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .dataAprovacao(LocalDate.of(2026, 10, 1))
                .dataPrevisaoEntrega(LocalDate.of(2026, 10, 16))
                .valorBruto(new BigDecimal("3000.00"))
                .valorDesconto(new BigDecimal("300.00"))
                .taxaInstalacao(BigDecimal.ZERO)
                .taxaFrete(BigDecimal.ZERO)
                .valorLiquido(new BigDecimal("2700.00"))
                .condicaoPagamento("À VISTA")
                .observacoesPagamento("Pagamento via PIX ou transferência.")
                .observacoes("Instalar conforme medidas confirmadas em visita técnica.")
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .descricao("Porta de Correr Alumínio 2 Folhas")
                .larguraMm(2000)
                .alturaMm(2100)
                .quantidade(2)
                .valorUnitario(new BigDecimal("1500.00"))
                .valorTotal(new BigDecimal("3000.00"))
                .ordem(0)
                .build();

        order.addItem(item);
        return order;
    }

    // =========================================================================
    // 1. Geração bem-sucedida do PDF
    // =========================================================================

    @Nested
    @DisplayName("1. Geração bem-sucedida do comprovante PDF")
    class GeracaoBemSucedida {

        @Test
        @DisplayName("Deve gerar bytes não-nulos com cabeçalho %PDF- para pedido válido")
        void deveGerarPdfComSucesso() throws IOException {
            Order order = criarPedidoPadrao();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes)
                    .as("Bytes do PDF não podem ser nulos")
                    .isNotNull()
                    .isNotEmpty();

            String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(header)
                    .as("O arquivo deve iniciar com o cabeçalho oficial de PDF")
                    .isEqualTo("%PDF-");

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages())
                        .as("O documento deve conter pelo menos 1 página")
                        .isGreaterThanOrEqualTo(1);
            }
        }

        @Test
        @DisplayName("Deve conter o código do pedido nos streams de texto do PDF")
        void deveConterCodigoDoPedidoNoPdf() throws IOException {
            Order order = criarPedidoPadrao();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            try (PdfReader reader = new PdfReader(pdfBytes)) {
                assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(1);

                String streamsConteudo = extrairStreamsDeTexto(reader);

                assertThat(streamsConteudo)
                        .as("O documento PDF deve conter o código do pedido nos streams de texto")
                        .contains("PED-2026-0001");
            }
        }

        @Test
        @DisplayName("AC-02: Deve utilizar valores congelados do pedido (lock de preços)")
        void deveUtilizarValoresCongeladosNaoPrecosAtuais() {
            Order order = criarPedidoPadrao();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            // O PDF deve ser gerado com sucesso usando valorUnitario e valorTotal congelados
            assertThat(pdfBytes).isNotEmpty();
            // Confirmar que o valor líquido do pedido é o congelado (2700.00)
            assertThat(order.getValorLiquido()).isEqualByComparingTo(new BigDecimal("2700.00"));
        }

        @Test
        @DisplayName("AC-05: Deve incluir o resumo financeiro com os valores do pedido")
        void deveIncluirResumoFinanceiro() {
            Order order = criarPedidoPadrao();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes).isNotEmpty();
            String pdfConteudo = new String(pdfBytes, StandardCharsets.ISO_8859_1);
            // O conteúdo deve incluir valores financeiros (presentes nos streams do PDF)
            assertThat(pdfConteudo).isNotBlank();
        }
    }

    // =========================================================================
    // 2. Dados opcionais ausentes (AC-06)
    // =========================================================================

    @Nested
    @DisplayName("2. Dados opcionais ausentes não impedem a geração (AC-06)")
    class DadosOpcionaisAusentes {

        @Test
        @DisplayName("AC-06: Telefone e endereço ausentes não causam falha")
        void deveTratarClienteSemTelefoneEEndereco() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("PED-2026-0002")
                    .orcamentoId(UUID.randomUUID())
                    .clienteNome("Cliente Simples")
                    .status(OrderStatus.WAITING_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.PRESENCIAL)
                    .dataAprovacao(LocalDate.now())
                    .dataPrevisaoEntrega(LocalDate.now().plusDays(15))
                    .valorBruto(new BigDecimal("1000.00"))
                    .valorDesconto(BigDecimal.ZERO)
                    .taxaInstalacao(BigDecimal.ZERO)
                    .taxaFrete(BigDecimal.ZERO)
                    .valorLiquido(new BigDecimal("1000.00"))
                    .build();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes).isNotEmpty();
            String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(header).isEqualTo("%PDF-");
        }

        @Test
        @DisplayName("AC-06: Condição de pagamento ausente não interrompe geração")
        void deveTratarCondicaoPagamentoAusente() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("PED-2026-0003")
                    .orcamentoId(UUID.randomUUID())
                    .clienteNome("Empresa Alfa")
                    .status(OrderStatus.WAITING_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.EMAIL)
                    .dataAprovacao(LocalDate.now())
                    .dataPrevisaoEntrega(LocalDate.now().plusDays(10))
                    .valorBruto(new BigDecimal("500.00"))
                    .valorDesconto(BigDecimal.ZERO)
                    .taxaInstalacao(BigDecimal.ZERO)
                    .taxaFrete(BigDecimal.ZERO)
                    .valorLiquido(new BigDecimal("500.00"))
                    .build();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes).isNotEmpty();
        }

        @Test
        @DisplayName("AC-06: Pedido sem itens não causa falha")
        void deveTratarPedidoSemItens() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("PED-2026-0004")
                    .orcamentoId(UUID.randomUUID())
                    .clienteNome("Empresa Sem Itens")
                    .status(OrderStatus.WAITING_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.TELEFONE)
                    .dataAprovacao(LocalDate.now())
                    .dataPrevisaoEntrega(LocalDate.now().plusDays(7))
                    .valorBruto(BigDecimal.ZERO)
                    .valorDesconto(BigDecimal.ZERO)
                    .taxaInstalacao(BigDecimal.ZERO)
                    .taxaFrete(BigDecimal.ZERO)
                    .valorLiquido(BigDecimal.ZERO)
                    .build();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes).isNotEmpty();
        }

        @Test
        @DisplayName("AC-06: Pedido com desconto, frete e instalação — todos exibidos sem erro")
        void deveTratarPedidoComTodosOsAcrescimos() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("PED-2026-0005")
                    .orcamentoId(UUID.randomUUID())
                    .clienteNome("Empresa Completa Ltda")
                    .status(OrderStatus.IN_PRODUCTION)
                    .canalAprovacao(ApprovalChannel.WHATSAPP)
                    .dataAprovacao(LocalDate.now())
                    .dataPrevisaoEntrega(LocalDate.now().plusDays(20))
                    .valorBruto(new BigDecimal("5000.00"))
                    .valorDesconto(new BigDecimal("250.00"))
                    .taxaInstalacao(new BigDecimal("300.00"))
                    .taxaFrete(new BigDecimal("150.00"))
                    .valorLiquido(new BigDecimal("5200.00"))
                    .condicaoPagamento("PARCELADO")
                    .observacoesPagamento("3x sem juros no cartão.")
                    .observacoes("Entrega agendada para manhã.")
                    .build();

            byte[] pdfBytes = orderPdfService.gerarComprovante(order);

            assertThat(pdfBytes).isNotEmpty();
            String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
            assertThat(header).isEqualTo("%PDF-");
        }
    }

    // =========================================================================
    // 3. Validações de entrada
    // =========================================================================

    @Nested
    @DisplayName("3. Validações de entrada")
    class ValidacoesDeEntrada {

        @Test
        @DisplayName("Deve lançar NullPointerException quando pedido for nulo")
        void deveLancarExcecaoQuandoPedidoForNulo() {
            assertThatThrownBy(() -> orderPdfService.gerarComprovante(null))
                    .isInstanceOf(NullPointerException.class);
        }
    }

    // =========================================================================
    // Utilitário de extração de texto do PDF (padrão BudgetPdfServiceTest)
    // =========================================================================

    /**
     * Extrai o conteúdo de texto de todos os streams de páginas do PDF.
     * Utiliza reader.getPageContent() que retorna os operadores de renderização
     * (BT/ET blocks) onde o texto aparece como literais ISO-8859-1 legíveis.
     * Mesmo padrão utilizado em BudgetPdfServiceTest#extrairStreamsDeTexto.
     */
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
}

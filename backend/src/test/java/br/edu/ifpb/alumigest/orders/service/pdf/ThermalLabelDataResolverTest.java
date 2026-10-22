package br.edu.ifpb.alumigest.orders.service.pdf;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Bateria de testes unitários formais para {@link ThermalLabelDataResolver}.
 * Testa regras de negócio de extração, fallbacks de endereço/ambiente e particionamento de peças.
 * US-17.1 — Resolução e normalização de dados de etiquetas térmicas (#448).
 */
@DisplayName("ThermalLabelDataResolver - Testes Unitários de Resolução de Dados [US-17.1]")
class ThermalLabelDataResolverTest {

    private ThermalLabelDataResolver resolver;
    private CompanyProperties companyProps;

    @BeforeEach
    void setUp() {
        companyProps = new CompanyProperties();
        companyProps.setRazaoSocial("Alumínio & Vidros PB");
        resolver = new ThermalLabelDataResolver(companyProps);
    }

    @Nested
    @DisplayName("1. Resolução Sequencial de Peças e Itens")
    class ResolucaoSequencialTestes {

        @Test
        @DisplayName("Deve gerar instâncias individuais de ThermalLabelData multiplicando pela quantidade")
        void deveGerarEtiquetasParaCadaPecaFisica() {
            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .codigo("OS-2026-0001")
                    .clienteNome("Marcos Souza")
                    .dataAprovacao(LocalDate.of(2026, 10, 15))
                    .build();

            OrderItem item1 = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao("Janela 2 Folhas")
                    .larguraMm(1200)
                    .alturaMm(1000)
                    .quantidade(2)
                    .corAluminio("Branco")
                    .tipoVidro("Incolor 6mm")
                    .ordem(1)
                    .build();

            OrderItem item2 = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao("Porta Giro")
                    .larguraMm(900)
                    .alturaMm(2100)
                    .quantidade(1)
                    .corAluminio("Preto")
                    .tipoVidro("Fumê 8mm")
                    .ordem(2)
                    .build();

            order.addItem(item1);
            order.addItem(item2);

            List<ThermalLabelData> etiquetas = resolver.resolveLabels(order);

            // Item 1 (2 janelas x 2 folhas = 4) + Item 2 (1 porta x 1 folha = 1) = 5 etiquetas
            assertThat(etiquetas).hasSize(5);

            // Etiqueta 1 (Item 1, Esquadria 1, Folha 1)
            assertThat(etiquetas.get(0))
                    .extracting(
                            ThermalLabelData::companyName,
                            ThermalLabelData::customerName,
                            ThermalLabelData::orderCode,
                            ThermalLabelData::itemIndex,
                            ThermalLabelData::pieceNumber,
                            ThermalLabelData::totalPieces,
                            ThermalLabelData::widthMm,
                            ThermalLabelData::heightMm,
                            ThermalLabelData::issueDate,
                            ThermalLabelData::labelBadge
                    ).containsExactly(
                            "ALUMÍNIO & VIDROS PB",
                            "MARCOS SOUZA",
                            "OS-2026-0001",
                            1,
                            1,
                            5,
                            1200,
                            1000,
                            LocalDate.of(2026, 10, 15),
                            "Item 01 • Esquadria 01/02 | Folha 01/02"
                    );

            // Etiqueta 2 (Item 1, Esquadria 1, Folha 2)
            assertThat(etiquetas.get(1))
                    .extracting(ThermalLabelData::itemIndex, ThermalLabelData::pieceNumber, ThermalLabelData::totalPieces, ThermalLabelData::labelBadge)
                    .containsExactly(1, 2, 5, "Item 01 • Esquadria 01/02 | Folha 02/02");

            // Etiqueta 3 (Item 1, Esquadria 2, Folha 1)
            assertThat(etiquetas.get(2))
                    .extracting(ThermalLabelData::itemIndex, ThermalLabelData::pieceNumber, ThermalLabelData::labelBadge)
                    .containsExactly(1, 3, "Item 01 • Esquadria 02/02 | Folha 01/02");

            // Etiqueta 4 (Item 1, Esquadria 2, Folha 2)
            assertThat(etiquetas.get(3))
                    .extracting(ThermalLabelData::itemIndex, ThermalLabelData::pieceNumber, ThermalLabelData::labelBadge)
                    .containsExactly(1, 4, "Item 01 • Esquadria 02/02 | Folha 02/02");

            // Etiqueta 5 (Item 2, Esquadria 1, Folha 1)
            assertThat(etiquetas.get(4))
                    .extracting(
                            ThermalLabelData::itemIndex,
                            ThermalLabelData::pieceNumber,
                            ThermalLabelData::totalPieces,
                            ThermalLabelData::widthMm,
                            ThermalLabelData::heightMm,
                            ThermalLabelData::aluminumColor,
                            ThermalLabelData::labelBadge
                    ).containsExactly(2, 5, 5, 900, 2100, "Preto", "Item 02 • Esquadria 01/01 | Peça 01/01");
        }

        @Test
        @DisplayName("Deve extrair código de produto quando houver produto associado")
        void deveExtrairCodigoProduto() {
            Product prod = new Product();
            UUID prodId = UUID.fromString("12345678-1234-1234-1234-123456789abc");
            ReflectionTestUtils.setField(prod, "id", prodId);
            ReflectionTestUtils.setField(prod, "name", "Janela Suprema");

            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .product(prod)
                    .descricao("Janela Suprema")
                    .quantidade(1)
                    .build();

            String codItem = resolver.extrairCodigoItem(item, 1);
            assertThat(codItem).isEqualTo("PRD-12345678");
        }

        @Test
        @DisplayName("Deve usar prefixo ITM-XX quando produto não possuir ID ou for nulo")
        void deveUsarPrefixoItemQuandoProdutoNulo() {
            OrderItem item = OrderItem.builder()
                    .id(UUID.randomUUID())
                    .descricao("Item Sob Medida")
                    .quantidade(1)
                    .build();

            String codItem = resolver.extrairCodigoItem(item, 5);
            assertThat(codItem).isEqualTo("ITM-05");
        }
    }

    @Nested
    @DisplayName("2. Extração de Linha de Alumínio e Grupo Funcional")
    class ExtracaoLinhaTestes {

        @Test
        @DisplayName("Deve priorizar groupName do DoorTemplateType")
        void devePriorizarGroupNameDoTemplateType() {
            Product prod = new Product();
            ReflectionTestUtils.setField(prod, "templateType", DoorTemplateType.SLIDING_WINDOW_2F);

            OrderItem item = OrderItem.builder()
                    .product(prod)
                    .descricao("Janela sem menção de linha")
                    .build();

            String linha = resolver.extrairLinhaOuGrupo(item);
            assertThat(linha).isEqualTo(DoorTemplateType.SLIDING_WINDOW_2F.getGroupName());
        }

        @ParameterizedTest(name = "Para descrição \"{0}\" deve extrair \"{1}\"")
        @CsvSource({
                "'Porta 4 folhas Linha GOLD brilhante', 'Linha Gold'",
                "'Janela 2 folhas Linha Suprema', 'Linha Suprema'",
                "'Porta Giro Linha Inova', 'Linha Inova'",
                "'Painel Fixo de Vidro', 'Esquadria'"
        })
        @DisplayName("Deve extrair linha a partir da descrição ou retornar fallback 'Esquadria'")
        void deveExtrairLinhaComBaseNaDescricao(String descricao, String resultadoEsperado) {
            OrderItem item = OrderItem.builder()
                    .descricao(descricao)
                    .build();

            String linha = resolver.extrairLinhaOuGrupo(item);
            assertThat(linha).isEqualTo(resultadoEsperado);
        }
    }

    @Nested
    @DisplayName("3. Extração e Fallbacks de Ambiente / Local")
    class ExtracaoAmbienteTestes {

        @ParameterizedTest(name = "JSON \"{0}\" deve extrair ambiente \"{1}\"")
        @CsvSource({
                "'{\"ambiente\": \"Varanda Gourmet\"}', 'Varanda Gourmet'",
                "'{\"room\": \"Cozinha Integrada\"}', 'Cozinha Integrada'",
                "'{\"local\": \"Área de Serviço\"}', 'Área de Serviço'"
        })
        @DisplayName("Deve extrair ambiente de diferentes chaves válidas no JSON templateConfig")
        void deveExtrairAmbienteDeDiferentesChavesJson(String json, String valorEsperado) {
            OrderItem item = OrderItem.builder()
                    .templateConfig(json)
                    .build();
            Order order = Order.builder().clienteEndereco("Rua Ignorada, 10").build();

            String local = resolver.extrairAmbienteOuLocal(item, order);
            assertThat(local).isEqualTo(valorEsperado);
        }

        @Test
        @DisplayName("Deve fazer fallback para endereço do cliente se templateConfig for nulo")
        void deveFazerFallbackParaEnderecoDoCliente() {
            OrderItem item = OrderItem.builder().templateConfig(null).build();
            Order order = Order.builder().clienteEndereco("Rua das Acácias, 50").build();

            String local = resolver.extrairAmbienteOuLocal(item, order);
            assertThat(local).isEqualTo("Rua das Acácias, 50");
        }

        @Test
        @DisplayName("Deve fazer fallback para observações se endereço for nulo")
        void deveFazerFallbackParaObservacoes() {
            OrderItem item = OrderItem.builder().templateConfig("").build();
            Order order = Order.builder().observacoes("Entregar na portaria B").build();

            String local = resolver.extrairAmbienteOuLocal(item, order);
            assertThat(local).isEqualTo("Entregar na portaria B");
        }

        @Test
        @DisplayName("Deve ser tolerante a JSON malformado e recorrer ao fallback sem estourar exceção")
        void deveSerToleranteAJsonMalformado() {
            OrderItem item = OrderItem.builder()
                    .templateConfig("{ chaveInvalidaSemFechamento: ")
                    .build();
            Order order = Order.builder().clienteEndereco("Rua Alternativa, 20").build();

            String local = resolver.extrairAmbienteOuLocal(item, order);
            assertThat(local).isEqualTo("Rua Alternativa, 20");
        }

        @Test
        @DisplayName("Deve retornar 'Não informado' se todos os campos forem vazios")
        void deveRetornarNaoInformadoQuandoTudoVazio() {
            OrderItem item = OrderItem.builder().build();
            Order order = Order.builder().build();

            String local = resolver.extrairAmbienteOuLocal(item, order);
            assertThat(local).isEqualTo("Não informado");
        }
    }

    @Nested
    @DisplayName("4. Validação e Tratamento de Erros de Entrada")
    class ValidacoesTestes {

        @Test
        @DisplayName("Deve lançar NullPointerException quando a ordem for nula")
        void deveLancarNullPointerExceptionParaOrdemNula() {
            assertThatThrownBy(() -> resolver.resolveLabels(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("A ordem de serviço não pode ser nula");
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando itens forem vazios")
        void deveLancarBusinessExceptionParaItensVazios() {
            Order orderComListaVazia = Order.builder().build();
            assertThatThrownBy(() -> resolver.resolveLabels(orderComListaVazia))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("não possui itens");
        }

        @Test
        @DisplayName("Deve usar fallback de Razão Social padrão quando CompanyProperties for nulo")
        void deveUsarFallbackDeEmpresaQuandoPropsNulo() {
            ThermalLabelDataResolver resolverSemProps = new ThermalLabelDataResolver(null);

            Order order = Order.builder()
                    .codigo("OS-1")
                    .build();
            order.addItem(OrderItem.builder().quantidade(1).build());

            List<ThermalLabelData> labels = resolverSemProps.resolveLabels(order);
            assertThat(labels.get(0).companyName()).isEqualTo("Alumiportas");
        }

        @Test
        @DisplayName("Deve ignorar itens com quantidade nula ou menor/igual a zero")
        void deveIgnorarItensComQuantidadeZeroOuNula() {
            Order order = Order.builder()
                    .codigo("OS-2026-QTD")
                    .build();

            OrderItem itemValido1 = OrderItem.builder().quantidade(2).descricao("Item Válido 1").ordem(1).build();
            OrderItem itemZerado = OrderItem.builder().quantidade(0).descricao("Item Cancelado").ordem(2).build();
            OrderItem itemNegativo = OrderItem.builder().quantidade(-1).descricao("Item Invalido").ordem(3).build();
            OrderItem itemQtdNula = OrderItem.builder().descricao("Item Sem Qtd").ordem(4).build();
            ReflectionTestUtils.setField(itemQtdNula, "quantidade", null);
            OrderItem itemValido2 = OrderItem.builder().quantidade(1).descricao("Item Válido 2").ordem(5).build();

            order.addItem(itemValido1);
            order.addItem(itemZerado);
            order.addItem(itemNegativo);
            order.addItem(itemQtdNula);
            order.addItem(itemValido2);

            List<ThermalLabelData> labels = resolver.resolveLabels(order);

            // Total de peças válidas: 2 + 1 = 3
            assertThat(labels).hasSize(3);
            assertThat(labels.get(0).description()).isEqualTo("Item Válido 1");
            assertThat(labels.get(0).pieceNumber()).isEqualTo(1);
            assertThat(labels.get(0).totalPieces()).isEqualTo(3);

            assertThat(labels.get(1).description()).isEqualTo("Item Válido 1");
            assertThat(labels.get(1).pieceNumber()).isEqualTo(2);

            assertThat(labels.get(2).description()).isEqualTo("Item Válido 2");
            assertThat(labels.get(2).pieceNumber()).isEqualTo(3);
            assertThat(labels.get(2).totalPieces()).isEqualTo(3);
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando todos os itens possuírem quantidade <= 0")
        void deveLancarBusinessExceptionQuandoTodosItensTiveremQuantidadeZero() {
            Order order = Order.builder()
                    .codigo("OS-ZERADA")
                    .build();
            order.addItem(OrderItem.builder().quantidade(0).build());

            assertThatThrownBy(() -> resolver.resolveLabels(order))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("não possui itens com quantidade válida");
        }
    }

    // =========================================================================
    // 5. Dedução de Folhas por Regex e Tipologia (#492 / #493)
    // =========================================================================

    @Nested
    @DisplayName("5. [Dedução de Folhas] Extração de Quantidade de Folhas por Modelo")
    class DeducaoFolhasTestes {

        @Test
        @DisplayName("Deve extrair folhas corretamente por padrão 'X Folhas'")
        void deveExtrairFolhasPorPadraoFolhas() {
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta de Correr 2 Folhas").build())).isEqualTo(2);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Janela de Correr 4 Folhas Suprema").build())).isEqualTo(4);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta 3 folhas sacada").build())).isEqualTo(3);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta de Giro 1 Folha").build())).isEqualTo(1);
        }

        @Test
        @DisplayName("Deve extrair folhas por sufixo 'XF' ou 'X fls'")
        void deveExtrairFolhasPorSufixosAbreviados() {
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Janela 2F Linha Suprema").build())).isEqualTo(2);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta 4F").build())).isEqualTo(4);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Janela 2 fls").build())).isEqualTo(2);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta 3 fls alumínio").build())).isEqualTo(3);
        }

        @Test
        @DisplayName("Deve extrair folhas por padrão 'X Planos'")
        void deveExtrairFolhasPorPadraoPlanos() {
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Porta de Correr 3 Planos Sacada").build())).isEqualTo(3);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Esquadria 2 planos").build())).isEqualTo(2);
        }

        @Test
        @DisplayName("Deve extrair folhas de templateConfig JSON quando descrição for genérica")
        void deveExtrairFolhasDeTemplateConfigQuandoDescricaoGenerica() {
            OrderItem item = OrderItem.builder()
                    .descricao("Esquadria Sob Medida")
                    .templateConfig("{\"templateType\": \"SLIDING_DOOR_4F\"}")
                    .build();

            assertThat(resolver.extrairQuantidadeFolhas(item)).isEqualTo(4);
        }

        @Test
        @DisplayName("Deve retornar fallback 1 quando item, descrição ou templateConfig forem nulos/inválidos")
        void deveRetornarFallbackUmParaCasosNulosOuSemFolhas() {
            assertThat(resolver.extrairQuantidadeFolhas(null)).isEqualTo(1);
            assertThat(resolver.extrairQuantidadeFolhas(OrderItem.builder().descricao(null).build())).isEqualTo(1);
            assertThat(resolver.extrairQuantidadeFolhas(OrderItem.builder().descricao("").build())).isEqualTo(1);
            assertThat(resolver.extrairQuantidadeFolhas(OrderItem.builder().descricao("Painel Fixo").build())).isEqualTo(1);
            assertThat(resolver.extrairQuantidadeFolhas(
                    OrderItem.builder().descricao("Esquadria").templateConfig("invalid json").build())).isEqualTo(1);
        }
    }
}

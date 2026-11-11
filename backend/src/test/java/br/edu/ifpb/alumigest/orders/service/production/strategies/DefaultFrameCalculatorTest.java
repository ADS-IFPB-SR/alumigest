package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.dto.production.AccessoryDto;
import br.edu.ifpb.alumigest.orders.dto.production.AluminumCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.GlassCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Testes Unitários: DefaultFrameCalculator")
class DefaultFrameCalculatorTest {

    private DefaultFrameCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new DefaultFrameCalculator();
    }

    @Test
    @DisplayName("supports - Deve retornar true para qualquer item")
    void supports_ShouldReturnTrueForAllItems() {
        OrderItem item = OrderItem.builder()
                .descricao("Qualquer tipologia")
                .larguraMm(1000)
                .alturaMm(1000)
                .build();

        assertThat(calculator.supports(item)).isTrue();
    }

    @Test
    @DisplayName("calculateCuts - Deve ignorar item ou builder nulo")
    void calculateCuts_ShouldIgnoreNullArguments() {
        Order order = Order.builder().codigo("OS-2026-0099").clienteNome("Teste Nulo").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        calculator.calculateCuts(null, builder);
        calculator.calculateCuts(OrderItem.builder().build(), null);

        ProductionSheetResponse response = builder.build();
        assertThat(response.glassCuts()).isEmpty();
        assertThat(response.aluminumCuts()).isEmpty();
        assertThat(response.accessories()).isEmpty();
    }

    @Test
    @DisplayName("calculateCuts - Deve gerar cortes de vidro, moldura e acessórios para espelhos")
    void calculateCuts_ShouldGenerateCutsForMirror() {
        Order order = Order.builder().codigo("OS-2026-0017").clienteNome("Iron Fitness").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .descricao("Espelho de Parede Musculação")
                .tipoVidro("Espelho Cebrace 4mm Bisotado")
                .corAluminio("Prata")
                .larguraMm(2500)
                .alturaMm(2000)
                .quantidade(2)
                .valorUnitario(new BigDecimal("1800.00"))
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts())
                .hasSize(1)
                .extracting(GlassCutDto::glassType, GlassCutDto::widthMm, GlassCutDto::heightMm, GlassCutDto::quantity)
                .containsExactly(tuple("Espelho Cebrace 4mm Bisotado", 2500, 2000, 2));

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::lengthMm, AluminumCutDto::quantity)
                .containsExactly(tuple("MOLD-01", 2500, 4), tuple("MOLD-02", 2000, 4));

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("FIX-ESP", 8), tuple("SIL-001", 2));
    }

    @Test
    @DisplayName("calculateCuts - Deve gerar cortes de perfis, vidro e acessórios para Box de Banheiro")
    void calculateCuts_ShouldGenerateCutsForBox() {
        Order order = Order.builder().codigo("OS-2026-0005").clienteNome("Cliente Box").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .descricao("Box Frontal 2 Folhas Vidro Temperado")
                .tipoVidro("Incolor 8mm Temperado")
                .corAluminio("Branco")
                .larguraMm(1200)
                .alturaMm(1900)
                .quantidade(1)
                .valorUnitario(new BigDecimal("850.00"))
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts())
                .hasSize(2)
                .extracting(GlassCutDto::glassType, GlassCutDto::widthMm, GlassCutDto::heightMm)
                .containsExactly(
                        tuple("Incolor 8mm Temperado (Folha Fixa)", 625, 1900),
                        tuple("Incolor 8mm Temperado (Folha Móvel)", 625, 1900));

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::quantity)
                .containsExactly(tuple("BX-001", 1), tuple("BX-002", 1), tuple("BX-003", 2));

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("KIT-BOX", 1), tuple("ROLD-BX", 2), tuple("VED-001", 3));
    }

    @Test
    @DisplayName("calculateCuts - Deve gerar descontos corretos para porta de Giro / Pivotante")
    void calculateCuts_ShouldGenerateCutsForSwingAndPivot() {
        Order order = Order.builder().codigo("OS-2026-0018").clienteNome("Cliente Giro").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .descricao("Porta Pivotante de Entrada")
                .tipoVidro("Laminado 10mm")
                .corAluminio("Preto")
                .larguraMm(1000)
                .alturaMm(2200)
                .quantidade(1)
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts())
                .extracting(GlassCutDto::widthMm, GlassCutDto::heightMm)
                .containsExactly(tuple(920, 2120));

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::lengthMm)
                .containsExactly(
                        tuple("BAT-01", 1000),
                        tuple("BAT-02", 2200),
                        tuple("FOL-01", 940),
                        tuple("FOL-02", 2160));

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("DOBR-01", 3), tuple("FECH-01", 1));
    }

    @Test
    @DisplayName("calculateCuts - Deve gerar descontos e braços articulados para Maxim-Ar / Basculante")
    void calculateCuts_ShouldGenerateCutsForAwning() {
        Order order = Order.builder().codigo("OS-2026-0019").clienteNome("Cliente Maxim").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .descricao("Janela Basculante Banheiro")
                .tipoVidro("Canelado 4mm")
                .larguraMm(800)
                .alturaMm(600)
                .quantidade(2)
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts())
                .extracting(GlassCutDto::widthMm, GlassCutDto::heightMm, GlassCutDto::quantity)
                .containsExactly(tuple(750, 550, 2));

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::lengthMm)
                .containsExactly(
                        tuple("MX-001", 800),
                        tuple("MX-002", 600),
                        tuple("MX-003", 770),
                        tuple("MX-004", 570));

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("BRAC-01", 4), tuple("FECH-02", 2));
    }

    @Test
    @DisplayName("calculateCuts - Deve aplicar fallback estrutural genérico e tratar campos opcionais vazios")
    void calculateCuts_ShouldGenerateGenericFallbackWithoutGlassWhenBlank() {
        Order order = Order.builder().codigo("OS-2026-0020").clienteNome("Cliente Genérico").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .larguraMm(null)
                .alturaMm(null)
                .quantidade(0)
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts()).isEmpty();

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::description, AluminumCutDto::quantity)
                .containsExactly(
                        tuple("EST-001", "Perfil Estrutural Superior/Inferior (Padrão)", 2),
                        tuple("EST-002", "Perfil Estrutural Lateral (Padrão)", 2));

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("KIT-FIX", 1), tuple("CAL-001", 1));
    }

    @Test
    @DisplayName("calculateCuts - Deve ler nome do Produto, usar descrição quando tipoVidro vazio e evitar cortes negativos")
    void calculateCuts_ShouldUseProductNameAndDescriptionFallbackAndClampNegativeCuts() {
        Product product = mock(Product.class);
        when(product.getName()).thenReturn("Porta de Giro Linha Econômica");

        Order order = Order.builder().codigo("OS-2026-0021").clienteNome("Cliente Produto").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .product(product)
                .descricao("Vidro Incolor Temperado 8mm")
                .tipoVidro("   ")
                .larguraMm(40)
                .alturaMm(30)
                .quantidade(null)
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.glassCuts())
                .extracting(GlassCutDto::glassType, GlassCutDto::widthMm, GlassCutDto::heightMm, GlassCutDto::quantity)
                .containsExactly(tuple("Vidro Incolor Temperado 8mm", 0, 0, 1));

        assertThat(response.aluminumCuts())
                .extracting(AluminumCutDto::profileCode, AluminumCutDto::lengthMm, AluminumCutDto::quantity)
                .containsExactly(
                        tuple("BAT-01", 40, 1),
                        tuple("BAT-02", 30, 2),
                        tuple("FOL-01", 0, 2),
                        tuple("FOL-02", 0, 2));
    }

    @Test
    @DisplayName("calculateCuts - Deve classificar Maxim-Ar pelo nome do produto")
    void calculateCuts_ShouldClassifyMaximFromProductName() {
        Product product = mock(Product.class);
        when(product.getName()).thenReturn("Maxim-Ar 1 Folha");

        Order order = Order.builder().codigo("OS-2026-0022").clienteNome("Cliente Produto Maxim").build();
        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .product(product)
                .descricao("Ventilação")
                .larguraMm(600)
                .alturaMm(600)
                .quantidade(1)
                .build();

        calculator.calculateCuts(item, builder);
        ProductionSheetResponse response = builder.build();

        assertThat(response.accessories())
                .extracting(AccessoryDto::code, AccessoryDto::quantity)
                .containsExactly(tuple("BRAC-01", 2), tuple("FECH-02", 1));
    }
}


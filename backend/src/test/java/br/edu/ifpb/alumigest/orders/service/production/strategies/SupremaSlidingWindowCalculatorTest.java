package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.dto.production.AccessoryDto;
import br.edu.ifpb.alumigest.orders.dto.production.AluminumCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.GlassCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Testes Unitários: SupremaSlidingWindowCalculator")
class SupremaSlidingWindowCalculatorTest {

    private SupremaSlidingWindowCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new SupremaSlidingWindowCalculator();
    }

    @Test
    @DisplayName("supports - Deve retornar true quando o produto for Janela de Correr Suprema")
    void supports_ShouldReturnTrue_WhenProductMatches() {
        Product product = mock(Product.class);
        when(product.getName()).thenReturn("Janela de Correr 2 Folhas Linha Suprema");

        OrderItem item = OrderItem.builder()
                .product(product)
                .descricao("Item Janela")
                .larguraMm(1200)
                .alturaMm(1200)
                .quantidade(1)
                .valorUnitario(new BigDecimal("1000.00"))
                .build();

        assertThat(calculator.supports(item)).isTrue();
    }

    @Test
    @DisplayName("supports - Deve retornar true via fallback de descrição quando produto for nulo")
    void supports_ShouldReturnTrue_WhenProductIsNullButDescriptionMatches() {
        OrderItem item = OrderItem.builder()
                .product(null)
                .descricao("Janela de Correr 2 Folhas Suprema sob medida")
                .larguraMm(1400)
                .alturaMm(1200)
                .quantidade(2)
                .valorUnitario(new BigDecimal("1200.00"))
                .build();

        assertThat(calculator.supports(item)).isTrue();
    }

    @Test
    @DisplayName("supports - Deve retornar false quando tipologia for diferente")
    void supports_ShouldReturnFalse_WhenNotMatching() {
        Product product = mock(Product.class);
        when(product.getName()).thenReturn("Porta Pivotante Linha Gold");

        OrderItem item = OrderItem.builder()
                .product(product)
                .descricao("Porta Pivotante")
                .larguraMm(900)
                .alturaMm(2100)
                .quantidade(1)
                .valorUnitario(new BigDecimal("2000.00"))
                .build();

        assertThat(calculator.supports(item)).isFalse();
    }

    @Test
    @DisplayName("supports - Deve retornar false quando item for nulo")
    void supports_ShouldReturnFalse_WhenItemIsNull() {
        assertThat(calculator.supports(null)).isFalse();
    }

    @Test
    @DisplayName("calculateCuts - Deve calcular corretamente corte de alumínio, vidros e acessórios com folgas")
    void calculateCuts_ShouldCalculateAllComponentsCorrectly() {
        Order order = Order.builder()
                .codigo("OS-2026-0042")
                .clienteNome("Antônio Figueiredo")
                .build();

        ProductionSheetBuilder builder = new ProductionSheetBuilder(order);

        OrderItem item = OrderItem.builder()
                .descricao("Janela de Correr 2 Folhas Suprema")
                .larguraMm(1200)
                .alturaMm(1000)
                .quantidade(2)
                .tipoVidro("Verde 8mm")
                .valorUnitario(new BigDecimal("1500.00"))
                .build();

        calculator.calculateCuts(item, builder);

        ProductionSheetResponse response = builder.build();

        // 1. Cortes de Alumínio
        assertThat(response.aluminumCuts()).hasSize(4);

        // Marco lateral: altura (1000mm), 90°, 2 * 2 = 4 peças
        AluminumCutDto marcoLateral = response.aluminumCuts().get(0);
        assertThat(marcoLateral.profileCode()).isEqualTo("SU-001");
        assertThat(marcoLateral.lengthMm()).isEqualTo(1000);
        assertThat(marcoLateral.cutAngle()).isEqualTo("90°");
        assertThat(marcoLateral.quantity()).isEqualTo(4);

        // Marco sup/inf: largura (1200mm), 90°, 2 * 2 = 4 peças
        AluminumCutDto marcoSupInf = response.aluminumCuts().get(1);
        assertThat(marcoSupInf.profileCode()).isEqualTo("SU-002");
        assertThat(marcoSupInf.lengthMm()).isEqualTo(1200);
        assertThat(marcoSupInf.cutAngle()).isEqualTo("90°");
        assertThat(marcoSupInf.quantity()).isEqualTo(4);

        // Perfil montante: altura (1000 - 42 = 958mm), 90°, 4 * 2 = 8 peças
        AluminumCutDto montante = response.aluminumCuts().get(2);
        assertThat(montante.profileCode()).isEqualTo("SU-039");
        assertThat(montante.lengthMm()).isEqualTo(958);
        assertThat(montante.cutAngle()).isEqualTo("90°");
        assertThat(montante.quantity()).isEqualTo(8);

        // Perfil travessa: largura ((1200 / 2) + 15 = 615mm), 45°, 4 * 2 = 8 peças
        AluminumCutDto travessa = response.aluminumCuts().get(3);
        assertThat(travessa.profileCode()).isEqualTo("SU-040");
        assertThat(travessa.lengthMm()).isEqualTo(615);
        assertThat(travessa.cutAngle()).isEqualTo("45°");
        assertThat(travessa.quantity()).isEqualTo(8);

        // 2. Vidros: largura (615 - 12 = 603mm), altura (958 - 12 = 946mm), 2 * 2 = 4 peças
        assertThat(response.glassCuts()).hasSize(1);
        GlassCutDto vidro = response.glassCuts().get(0);
        assertThat(vidro.glassType()).isEqualTo("Verde 8mm");
        assertThat(vidro.widthMm()).isEqualTo(603);
        assertThat(vidro.heightMm()).isEqualTo(946);
        assertThat(vidro.quantity()).isEqualTo(4);

        // 3. Acessórios
        assertThat(response.accessories()).hasSize(2);
        AccessoryDto roldana = response.accessories().get(0);
        assertThat(roldana.code()).isEqualTo("ROL-112");
        assertThat(roldana.quantity()).isEqualTo(8);

        AccessoryDto borracha = response.accessories().get(1);
        assertThat(borracha.code()).isEqualTo("GUA-080");
        assertThat(borracha.quantity()).isGreaterThan(0);
    }
}

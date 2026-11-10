package br.edu.ifpb.alumigest.orders.service.production.strategies;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.service.production.ProductionSheetBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

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
    @DisplayName("calculateCuts - Deve gerar cortes de vidro e moldura para espelhos")
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

        assertThat(response.glassCuts()).hasSize(1);
        assertThat(response.glassCuts().get(0).glassType()).isEqualTo("Espelho Cebrace 4mm Bisotado");
        assertThat(response.glassCuts().get(0).widthMm()).isEqualTo(2500);
        assertThat(response.glassCuts().get(0).heightMm()).isEqualTo(2000);
        assertThat(response.glassCuts().get(0).quantity()).isEqualTo(2);

        assertThat(response.aluminumCuts()).isNotEmpty();
        assertThat(response.accessories()).isNotEmpty();
    }

    @Test
    @DisplayName("calculateCuts - Deve gerar cortes de perfis e vidro para Box de Banheiro")
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

        assertThat(response.glassCuts()).hasSize(2); // Folha fixa e folha móvel
        assertThat(response.aluminumCuts()).isNotEmpty();
        assertThat(response.accessories()).isNotEmpty();
    }
}


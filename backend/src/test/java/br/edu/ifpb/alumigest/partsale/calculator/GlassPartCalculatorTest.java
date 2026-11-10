package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class GlassPartCalculatorTest {

    private GlassPartCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new GlassPartCalculator();
    }

    @Test
    @DisplayName("Deve aplicar a área mínima de faturamento (0.25m²) quando a área da peça for inferior")
    void shouldApplyMinimumBillableAreaWhenPieceIsTooSmall() {
        // Dado uma peça de 300x400 = 0.12m², preço de R$ 100
        CalculatePartItemRequest request = new CalculatePartItemRequest(
                MaterialCategoryType.GLASS, 300, 400, 1, new BigDecimal("100.00"), null
        );

        // Quando
        CalculatePartItemResponse response = calculator.calculate(request);

        // Então a área cobrada sobe para 0.25 e o preço é proporcional aos 0.25m² (R$ 25,00)
        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("0.2500");
        assertThat(response.unitPrice()).isEqualByComparingTo("100.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("25.00");
    }

    @Test
    @DisplayName("Deve faturar a área exata quando a área da peça for maior que o mínimo")
    void shouldBillExactAreaWhenPieceIsLargerThanMinimum() {
        // Dado uma peça de 1000x2000 = 2.00m², preço de R$ 100
        CalculatePartItemRequest request = new CalculatePartItemRequest(
                MaterialCategoryType.GLASS, 1000, 2000, 1, new BigDecimal("100.00"), null
        );

        // Quando
        CalculatePartItemResponse response = calculator.calculate(request);

        // Então a área faturável é igual a área líquida (2.00)
        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("2.0000");
        assertThat(response.unitPrice()).isEqualByComparingTo("100.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("200.00");
    }
}
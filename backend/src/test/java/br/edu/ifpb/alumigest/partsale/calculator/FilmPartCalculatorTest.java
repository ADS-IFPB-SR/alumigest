package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class FilmPartCalculatorTest {

    private FilmPartCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new FilmPartCalculator();
    }

    @Test
    @DisplayName("Deve faturar a área total com acréscimo do fator de perda da bobina")
    void shouldBillAreaWithLossFactorApplied() {
        // Dado um corte de 1000x1000 (1.00m²) e 15% de perda passado no Request
        // O Request novo exige: category, width, height, quantity, unitPrice, lossFactor
        CalculatePartItemRequest request = new CalculatePartItemRequest(
                MaterialCategoryType.FILM, 1000, 1000, 1, new BigDecimal("50.00"), new BigDecimal("0.15")
        );

        // Quando
        CalculatePartItemResponse response = calculator.calculate(request);

        // Então a área faturável tem que ter +15% (1.15) e o preço (1.15 * 50 = 57.50)
        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("1.1500");
        assertThat(response.unitPrice()).isEqualByComparingTo("50.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("57.50");
    }
}
package br.edu.ifpb.alumigest.partsale.calculator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("HardwarePartCalculator [US-46.1] - Formal QA (EP, BVA & Branch Coverage)")
class HardwarePartCalculatorTest {

  private HardwarePartCalculator calculator;

  @BeforeEach
  void setUp() {
    calculator = new HardwarePartCalculator();
  }

  @Test
  @DisplayName("Deve retornar categoria HARDWARE")
  void shouldReturnHardwareCategory() {
    assertThat(calculator.getCategory()).isEqualTo(MaterialCategoryType.HARDWARE);
  }

  @Nested
  @DisplayName("Partição de Equivalência (EP)")
  class EquivalencePartitioning {

    @Test
    @DisplayName("EP1: Deve calcular com sucesso ferragem por unidade válida")
    void shouldCalculateHardwareValidQuantity() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          10,
          new BigDecimal("28.50"),
          null
      );

      CalculatePartItemResponse response = calculator.calculate(request);

      assertThat(response).isNotNull();
      assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("10.0000");
      assertThat(response.unitPrice()).isEqualByComparingTo("28.50");
      assertThat(response.totalPrice()).isEqualByComparingTo("285.00");
    }

    @Test
    @DisplayName("EP2: Deve lançar exceção quando requisição for nula")
    void shouldThrowExceptionWhenRequestIsNull() {
      assertThatThrownBy(() -> calculator.calculate(null))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("nula");
    }
  }

  @Nested
  @DisplayName("Análise de Valor Limite e Decisão (BVA & Branch Coverage)")
  class BoundaryAndBranchCoverage {

    @Test
    @DisplayName("BVA1: Quantidade mínima válida (Qtd = 1)")
    void shouldCalculateMinimumValidQuantity() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          1,
          new BigDecimal("28.50"),
          null
      );

      CalculatePartItemResponse response = calculator.calculate(request);

      assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("1.0000");
      assertThat(response.totalPrice()).isEqualByComparingTo("28.50");
    }

    @Test
    @DisplayName("BVA2: Quantidade nula deve lançar exceção")
    void shouldRejectNullQuantity() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          null,
          new BigDecimal("28.50"),
          null
      );

      assertThatThrownBy(() -> calculator.calculate(request))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("positiva");
    }

    @Test
    @DisplayName("BVA3: Quantidade zero ou negativa deve lançar exceção")
    void shouldRejectZeroOrNegativeQuantity() {
      CalculatePartItemRequest requestZero = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          0,
          new BigDecimal("28.50"),
          null
      );

      CalculatePartItemRequest requestNegative = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          -5,
          new BigDecimal("28.50"),
          null
      );

      assertThatThrownBy(() -> calculator.calculate(requestZero))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("positiva");

      assertThatThrownBy(() -> calculator.calculate(requestNegative))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("positiva");
    }

    @Test
    @DisplayName("BVA4: Preço unitário nulo deve lançar exceção")
    void shouldRejectNullUnitPrice() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          2,
          null,
          null
      );

      assertThatThrownBy(() -> calculator.calculate(request))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("negativo");
    }

    @Test
    @DisplayName("BVA5: Preço unitário negativo deve ser rejeitado")
    void shouldRejectNegativeUnitPrice() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          2,
          new BigDecimal("-0.01"),
          null
      );

      assertThatThrownBy(() -> calculator.calculate(request))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("negativo");
    }

    @Test
    @DisplayName("BVA6: Preço unitário zero é válido (bonificação ou brinde)")
    void shouldAcceptZeroUnitPrice() {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          5,
          BigDecimal.ZERO,
          null
      );

      CalculatePartItemResponse response = calculator.calculate(request);

      assertThat(response.unitPrice()).isEqualByComparingTo("0.00");
      assertThat(response.totalPrice()).isEqualByComparingTo("0.00");
    }
  }
}

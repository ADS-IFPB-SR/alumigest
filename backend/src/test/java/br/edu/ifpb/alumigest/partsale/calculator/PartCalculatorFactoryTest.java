package br.edu.ifpb.alumigest.partsale.calculator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("PartCalculatorFactory [US-46.1] - Formal QA Tests")
class PartCalculatorFactoryTest {

  @Nested
  @DisplayName("Partição de Equivalência (EP)")
  class EquivalencePartitioning {

    @Test
    @DisplayName("EP1: Deve resolver com sucesso calculadora cadastrada para a categoria")
    void shouldResolveRegisteredCalculator() {
      PartItemCalculator hardwareCalc = mock(PartItemCalculator.class);
      when(hardwareCalc.getCategory()).thenReturn(MaterialCategoryType.HARDWARE);

      PartCalculatorFactory factory = new PartCalculatorFactory(List.of(hardwareCalc));

      PartItemCalculator resolved = factory.getCalculator(MaterialCategoryType.HARDWARE);
      assertThat(resolved).isSameAs(hardwareCalc);
    }

    @Test
    @DisplayName("EP2: Deve lançar exceção quando não houver calculadora cadastrada para a categoria")
    void shouldThrowWhenCalculatorNotRegistered() {
      PartItemCalculator hardwareCalc = mock(PartItemCalculator.class);
      when(hardwareCalc.getCategory()).thenReturn(MaterialCategoryType.HARDWARE);

      PartCalculatorFactory factory = new PartCalculatorFactory(List.of(hardwareCalc));

      assertThatThrownBy(() -> factory.getCalculator(MaterialCategoryType.GLASS))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Calculadora não encontrada para a categoria: GLASS");
    }
  }

  @Nested
  @DisplayName("Análise de Valor Limite e Decisão (BVA & Branch Coverage)")
  class BoundaryAndBranchCoverage {

    @Test
    @DisplayName("BVA1: Deve rejeitar categoria nula com IllegalArgumentException")
    void shouldRejectNullCategory() {
      PartCalculatorFactory factory = new PartCalculatorFactory(List.of());

      assertThatThrownBy(() -> factory.getCalculator(null))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("A categoria do material não pode ser nula");
    }
  }
}


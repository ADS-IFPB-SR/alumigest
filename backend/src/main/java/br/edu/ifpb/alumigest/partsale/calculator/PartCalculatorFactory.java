package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Fábrica de estratégias de cálculo para o módulo de venda de partes.
 */
@Component
public class PartCalculatorFactory {

  private final Map<MaterialCategoryType, PartItemCalculator> calculators;

  public PartCalculatorFactory(List<PartItemCalculator> calculatorList) {
    this.calculators = calculatorList.stream()
        .collect(Collectors.toMap(PartItemCalculator::getCategory, Function.identity()));
  }

  public PartItemCalculator getCalculator(MaterialCategoryType category) {
    if (category == null) {
      throw new IllegalArgumentException("A categoria do material não pode ser nula");
    }
    PartItemCalculator calculator = calculators.get(category);
    if (calculator == null) {
      throw new IllegalArgumentException("Calculadora não encontrada para a categoria: " + category);
    }
    return calculator;
  }
}

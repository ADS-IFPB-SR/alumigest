package br.edu.ifpb.alumigest.budgets.calculator;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MaterialCalculatorFactory {

    private final Map<CategoryType, MaterialQuantityCalculator> calculators;

    @Autowired
    public MaterialCalculatorFactory(List<MaterialQuantityCalculator> calculatorList) {

        this.calculators = calculatorList.stream()
                .collect(Collectors.toMap(MaterialQuantityCalculator::getCategoryType, Function.identity()));
    }

    public MaterialQuantityCalculator getCalculator(CategoryType categoryType) {
        MaterialQuantityCalculator calculator = calculators.get(categoryType);

        if (calculator == null) {
            throw new IllegalArgumentException("Não existe calculadora para a categoria:" + categoryType);
        }
        return calculator;
    }

}

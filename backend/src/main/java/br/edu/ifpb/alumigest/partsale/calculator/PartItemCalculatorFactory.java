package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PartItemCalculatorFactory {

    private final Map<PartMaterialType, PartItemCalculator> calculators;

    // O Spring injeta automaticamente as duas implementações (Glass e Film) na lista
    public PartItemCalculatorFactory(List<PartItemCalculator> calculatorList) {
        this.calculators = calculatorList.stream()
                .collect(Collectors.toMap(
                        calc -> {
                            if (calc.supports(PartMaterialType.GLASS)) return PartMaterialType.GLASS;
                            if (calc.supports(PartMaterialType.FILM)) return PartMaterialType.FILM;
                            throw new IllegalArgumentException("Calculador não suportado: " + calc.getClass().getName());
                        },
                        Function.identity()
                ));
    }

    public PartItemCalculator getCalculator(PartMaterialType type) {
        PartItemCalculator calculator = calculators.get(type);
        if (calculator == null) {
            throw new IllegalArgumentException("Nenhum motor de cálculo encontrado para o tipo: " + type);
        }
        return calculator;
    }
}
package br.edu.ifpb.alumigest.budgets.calculator;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class HardwareQuantityCalculator implements MaterialQuantityCalculator {

    @Override
    public CategoryType getCategoryType() {
        return CategoryType.HARDWARE;
    }

    @Override
    public BigDecimal calculate(TemplateType templateType, int widthMm, int heightMm, int quantity,
            BigDecimal requestedMaterialQty) {

        if (requestedMaterialQty == null) {
            return BigDecimal.ZERO;
        }

        return requestedMaterialQty.multiply(BigDecimal.valueOf(quantity));
    }

}

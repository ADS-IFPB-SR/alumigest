package br.edu.ifpb.alumigest.budgets.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

@Component
public class GlassQuantityCalculator implements MaterialQuantityCalculator {

    @Override
    public CategoryType getCategoryType() {
        return CategoryType.GLASS;
    }

    @Override
    public BigDecimal calculate(TemplateType templateType, int widthMm, int heightMm, int quantity,
            BigDecimal requestedMaterialQty) {

        BigDecimal widthM = BigDecimal.valueOf(widthMm).divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        BigDecimal heightM = BigDecimal.valueOf(heightMm).divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

        BigDecimal areaPerItem = widthM.multiply(heightM);

        // Regra RN-V03: Mínimo 0.25m2 por unidade
        BigDecimal MIN_AREA = new BigDecimal("0.25");
        if (areaPerItem.compareTo(MIN_AREA) < 0) {
            areaPerItem = MIN_AREA;
        }

        BigDecimal totalArea = areaPerItem.multiply(BigDecimal.valueOf(quantity));

        return totalArea.setScale(2, RoundingMode.CEILING);
    }

}

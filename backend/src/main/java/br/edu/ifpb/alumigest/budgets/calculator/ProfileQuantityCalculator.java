package br.edu.ifpb.alumigest.budgets.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

@Component
public class ProfileQuantityCalculator implements MaterialQuantityCalculator {

    @Override
    public CategoryType getCategoryType() {
        return CategoryType.PROFILE;
    }

    @Override
    public BigDecimal calculate(TemplateType templateType, int widthMm, int heightMm, int quantity,
            BigDecimal requestedMaterialQty) {

        BigDecimal w = BigDecimal.valueOf(widthMm).divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        BigDecimal h = BigDecimal.valueOf(heightMm).divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

        BigDecimal totalPerUnit;

        switch (templateType) {

            case SLIDING_1_LEAF:
                // Trilhos (2W) + Batentes (2H) + Quadro da única folha (2W + 2H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(4)).add(h.multiply(BigDecimal.valueOf(4)));
                break;

            case SLIDING_2_LEAF:
                // Trilhos (2W) + Batentes (2H) + Quadros das 2 folhas (4H + 2W)
                totalPerUnit = w.multiply(BigDecimal.valueOf(4)).add(h.multiply(BigDecimal.valueOf(6)));
                break;

            case SLIDING_4_LEAF:
                // Trilhos (2W) + Batentes (2H) + Quadros das 4 folhas (8H + 4W)
                totalPerUnit = w.multiply(BigDecimal.valueOf(4)).add(h.multiply(BigDecimal.valueOf(10)));
                break;

            case SWING_1_LEAF:
                // Marco (W + 2H) + Quadro da folha (2W + 2H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(3)).add(h.multiply(BigDecimal.valueOf(4)));
                break;

            case SWING_2_LEAF:
                // Marco (W + 2H) + Quadros das 2 folhas (2W + 4H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(3)).add(h.multiply(BigDecimal.valueOf(6)));
                break;

            case MAX_AR_WINDOW_1_LEAF:
            case MAX_AR_WINDOW_INVERSE_1_LEAF:
                // Marco perimetral (2W + 2H) + Caixilho da folha (2W + 2H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(4)).add(h.multiply(BigDecimal.valueOf(4)));
                break;

            case DRAWER_FRONT:
                // Frente de Gaveta: Quadro perimetral (2W + 2H)
                totalPerUnit = w.add(h).multiply(BigDecimal.valueOf(2));
                break;

            case FIXED_PANEL:
                // Arremate perimetral da fachada (2W + 2H)
                totalPerUnit = w.add(h).multiply(BigDecimal.valueOf(2));
                break;

            default:
                // Fallback de segurança para 2W + 2H
                totalPerUnit = w.add(h).multiply(BigDecimal.valueOf(2));
                break;
        }

        // Multiplica o total de metros lineares de 1 unidade pela quantidade de janelas
        BigDecimal totalMeters = totalPerUnit.multiply(BigDecimal.valueOf(quantity));

        // Retorna com 2 casas decimais arredondadas para cima (ex: 12.35m)
        return totalMeters.setScale(2, RoundingMode.CEILING);
    }

}

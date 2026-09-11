package br.edu.ifpb.alumigest.budgets.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

/**
 * Motor de Cálculo Físico de Perfis de Alumínio.
 * 
 * Determina o consumo linear total em metros (m) para perfis de esquadrias
 * com base na largura (W), altura (H), quantidade de folhas e tipologia.
 * 
 * Regras Físicas Paramétricas:
 * - 1 Folha (Giro / Correr / Maxim-ar): 2 Larguras + 2 Alturas (2W + 2H)
 * - 2 Folhas (Correr / Giro): 2 Larguras (trilhos superior e inferior) + 4 Alturas (2 laterais por folha) (2W + 4H)
 * - 3 Folhas (Correr): 2 Larguras + 6 Alturas (2W + 6H)
 * - 4 Folhas (Correr): 2 Larguras + 8 Alturas (2W + 8H)
 */
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

        if (templateType == null) {
            totalPerUnit = w.add(h).multiply(BigDecimal.valueOf(2));
            return totalPerUnit.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.CEILING);
        }

        switch (templateType) {

            case SWING_1_LEAF:
                // 1 Folha de giro (2W + 2H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(2)));
                break;

            case SWING_2_LEAF:
                // 2 Folhas de giro (2W + 4H) -> Ex: 1600x2150 => 2*(1.6) + 4*(2.15) = 3.20 + 8.60 = 11.80m (~12m)
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(4)));
                break;

            case SLIDING_1_LEAF:
                // 1 Folha de correr (2W + 2H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(2)));
                break;

            case SLIDING_2_LEAF:
                // 2 Folhas de correr (2W + 4H) -> Ex: 1600x2150 => 2*(1.6) + 4*(2.15) = 11.80m
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(4)));
                break;

            case SLIDING_3_LEAF:
                // 3 Folhas de correr (2W + 6H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(6)));
                break;

            case SLIDING_4_LEAF:
                // 4 Folhas de correr (2W + 8H)
                totalPerUnit = w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(8)));
                break;

            case MAX_AR_WINDOW_1_LEAF:
            case MAX_AR_WINDOW_INVERSE_1_LEAF:
            case DRAWER_FRONT:
            case FIXED_PANEL:
            default:
                // Fallback de segurança para 1 quadro (2W + 2H)
                totalPerUnit = w.add(h).multiply(BigDecimal.valueOf(2));
                break;
        }

        // Multiplica o total de metros lineares de 1 unidade pela quantidade de janelas
        BigDecimal totalMeters = totalPerUnit.multiply(BigDecimal.valueOf(quantity));

        // Retorna com 2 casas decimais arredondadas para cima (ex: 12.35m)
        return totalMeters.setScale(2, RoundingMode.CEILING);
    }

}

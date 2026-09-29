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

        BigDecimal totalPerUnit = switch (templateType) {
            case SWING_1_LEAF, SLIDING_1_LEAF ->
                // 1 Folha (2W + 2H)
                w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(2)));

            case SWING_2_LEAF, SLIDING_2_LEAF ->
                // 2 Folhas (2W + 4H) -> Ex: 1600x2150 => 2*(1.6) + 4*(2.15) = 11.80m
                w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(4)));

            case SLIDING_3_LEAF ->
                // 3 Folhas de correr (2W + 6H)
                w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(6)));

            case SLIDING_4_LEAF ->
                // 4 Folhas de correr (2W + 8H)
                w.multiply(BigDecimal.valueOf(2)).add(h.multiply(BigDecimal.valueOf(8)));

            default ->
                // Fallback de segurança para 1 quadro (2W + 2H)
                w.add(h).multiply(BigDecimal.valueOf(2));
        };

        // Multiplica o total de metros lineares de 1 unidade pela quantidade de janelas
        BigDecimal totalMeters = totalPerUnit.multiply(BigDecimal.valueOf(quantity));

        // Retorna com 2 casas decimais arredondadas para cima (ex: 12.35m)
        return totalMeters.setScale(2, RoundingMode.CEILING);
    }

}

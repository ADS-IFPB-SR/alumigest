package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import java.math.BigDecimal;
import java.util.List;

/**
 * Contexto geométrico e dimensional imutável para a renderização do esquema técnico de usinagem e corte.
 *
 * @param templateType     tipo do modelo de esquadria (ex: GIRO_1F, CORRER_2F)
 * @param widthMm          largura real em milímetros
 * @param heightMm         altura real em milímetros
 * @param openingDirection sentido de abertura da folha
 * @param drillingHoles    lista imutável de furos técnicos com posições relativas e cotas
 * @param handle           dados do puxador posicionado ou null caso ausente
 */
public record TechnicalMachiningContext(
        String templateType,
        BigDecimal widthMm,
        BigDecimal heightMm,
        OpeningDirection openingDirection,
        List<DrillingHolePoint> drillingHoles,
        TechnicalHandle handle
) {

    public TechnicalMachiningContext {
        drillingHoles = drillingHoles != null ? List.copyOf(drillingHoles) : List.of();
    }

    public boolean hasDrilling() {
        return drillingHoles != null && !drillingHoles.isEmpty();
    }

    public boolean hasHandle() {
        return handle != null;
    }

    public boolean isOpeningLeft() {
        return openingDirection == OpeningDirection.RIGHT_TO_LEFT;
    }

    /**
     * Retorna a proporção de aspecto (largura / altura) limitada para renderização harmoniosa.
     */
    public float getAspectRatio() {
        if (widthMm != null && heightMm != null && heightMm.compareTo(BigDecimal.ZERO) > 0) {
            float ratio = widthMm.floatValue() / heightMm.floatValue();
            return Math.clamp(ratio, 0.40f, 2.20f);
        }
        return 0.75f;
    }
}

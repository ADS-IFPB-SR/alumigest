package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import java.math.BigDecimal;
import java.util.List;

/**
 * Contexto geométrico e dimensional imutável para a renderização do esquema técnico de usinagem.
 *
 * @param templateType     tipo do modelo de esquadria (ex: GIRO_1F, CORRER_2F)
 * @param widthMm          largura real em milímetros
 * @param heightMm         altura real em milímetros
 * @param openingDirection sentido de abertura da folha
 * @param drillingHoles    lista imutável de furos técnicos com posições relativas e cotas
 * @param handle           dados do puxador posicionado ou null caso ausente
 * @param leafCount        quantidade de folhas construtivas da esquadria
 * @param sliding          indica se a esquadria é da família de correr
 */
public record TechnicalMachiningContext(
        String templateType,
        BigDecimal widthMm,
        BigDecimal heightMm,
        OpeningDirection openingDirection,
        List<DrillingHolePoint> drillingHoles,
        TechnicalHandle handle,
        int leafCount,
        boolean sliding
) {

    public TechnicalMachiningContext {
        drillingHoles = drillingHoles != null ? List.copyOf(drillingHoles) : List.of();
        leafCount = Math.max(1, leafCount);
    }

    /**
     * Construtor de conveniência com valores padrão para folha única não-corrediça.
     */
    public TechnicalMachiningContext(
            String templateType,
            BigDecimal widthMm,
            BigDecimal heightMm,
            OpeningDirection openingDirection,
            List<DrillingHolePoint> drillingHoles,
            TechnicalHandle handle
    ) {
        this(templateType, widthMm, heightMm, openingDirection, drillingHoles, handle, 1, false);
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

    /**
     * Indica se a esquadria pertence à tipologia de correr.
     */
    public boolean isSliding() {
        return sliding;
    }

    /**
     * Retorna o número de folhas construtivas da esquadria (1 a 4).
     */
    public int getLeafCount() {
        return leafCount;
    }

    /**
     * Indica se a esquadria é uma porta ou esquadria de giro duplo (2 folhas de abrir).
     */
    public boolean isDoubleSwingDoor() {
        if (sliding) {
            return false;
        }
        if (leafCount != 2) {
            return false;
        }
        if (templateType == null) {
            return true;
        }
        String upper = templateType.toUpperCase(java.util.Locale.ROOT);
        return upper.contains("SWING") || upper.contains("GIRO") || upper.contains("2F")
                || upper.contains("2_LEAF");
    }

    /**
     * Indica se a esquadria pertence à tipologia de giro (abrir / pivotante).
     */
    public boolean isSwingDoor() {
        if (sliding) {
            return false;
        }
        if (templateType == null) {
            return false;
        }
        String upper = templateType.toUpperCase(java.util.Locale.ROOT);
        return upper.contains("SWING") || upper.contains("GIRO") || upper.contains("PIVOT");
    }

    /**
     * Indica se a esquadria viola a recomendação da NBR 10821 para portas de giro
     * com altura superior a 1800mm e menos de 3 dobradiças.
     */
    public boolean hasNbr10821Warning() {
        if (!isSwingDoor()) {
            return false;
        }
        if (heightMm == null || heightMm.compareTo(BigDecimal.valueOf(1800)) <= 0) {
            return false;
        }
        int count = drillingHoles != null ? drillingHoles.size() : 0;
        return count > 0 && count < 3;
    }
}

package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

/**
 * Representa os dados dimensionais e visuais de posicionamento do puxador no esquema de usinagem.
 *
 * @param onRightSide  indica se o puxador fica no montante direito (true) ou esquerdo (false)
 * @param lengthRatio  comprimento relativo do puxador em relação à altura da folha (ex: 0.25f)
 * @param centerYRatio posição vertical relativa do centro do puxador (padrão 0.5f = centro)
 * @param label        texto da cota técnica (ex: "Puxador (25cm)", "Puxador 400mm")
 */
public record TechnicalHandle(
        boolean onRightSide,
        float lengthRatio,
        float centerYRatio,
        String label
) {

    public TechnicalHandle {
        lengthRatio = Math.clamp(lengthRatio, 0.10f, 0.85f);
        centerYRatio = Math.clamp(centerYRatio, 0.15f, 0.85f);
        if (label == null || label.isBlank()) {
            label = "Puxador";
        }
    }
}

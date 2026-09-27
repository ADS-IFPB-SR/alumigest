package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

/**
 * Representa um ponto de furação ou usinagem técnica calculada na folha da esquadria.
 *
 * @param yRatio      posição relativa vertical normalizada (0.0f = base inferior, 1.0f = topo superior)
 * @param diameterMm  diâmetro do furo em milímetros (padrão 10mm para dobradiça/pivô)
 * @param label       anotação técnica de cota (ex: "Furo Dobradiça", "Dist. Iguais", "Ø 10mm")
 */
public record DrillingHolePoint(float yRatio, float diameterMm, String label) {

    public DrillingHolePoint {
        yRatio = Math.clamp(yRatio, 0.05f, 0.95f);
        if (diameterMm <= 0) {
            diameterMm = 10.0f;
        }
        if (label == null || label.isBlank()) {
            label = String.format(java.util.Locale.ROOT, "Ø %.0fmm", diameterMm);
        }
    }
}

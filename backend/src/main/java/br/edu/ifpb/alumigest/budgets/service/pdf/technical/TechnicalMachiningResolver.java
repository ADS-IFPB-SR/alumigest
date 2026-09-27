package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.catalog.domain.HandlePosition;
import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Utilitário para resolução e normalização paramétrica do contexto de usinagem
 * a partir das configurações salvas no {@link BudgetItem}.
 */
public final class TechnicalMachiningResolver {

    private static final Logger log = LoggerFactory.getLogger(TechnicalMachiningResolver.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private static final float RAIO_PADRAO_MM = 10.0f;
    private static final float DEFAULT_HANDLE_LENGTH_MM = 250.0f;

    private TechnicalMachiningResolver() {
        throw new UnsupportedOperationException("Classe utilitária não pode ser instanciada.");
    }

    /**
     * Resolve o contexto técnico de usinagem e puxador com base nos dados do item de orçamento.
     *
     * @param item item do orçamento com metadados e configurações
     * @return contexto imutável normalizado e pronto para renderização
     */
    public static TechnicalMachiningContext resolve(BudgetItem item) {
        if (item == null) {
            return new TechnicalMachiningContext(null, null, null, null, List.of(), null);
        }

        BigDecimal widthMm = item.getWidthMm();
        BigDecimal heightMm = item.getHeightMm();
        String templateType = item.getTemplateType();

        OpeningDirection openingDirection = extrairOpeningDirection(item);
        List<DrillingHolePoint> drillingHoles = extrairFuracoes(item, heightMm, templateType);
        TechnicalHandle handle = extrairPuxador(item, heightMm, openingDirection);

        return new TechnicalMachiningContext(
                templateType,
                widthMm,
                heightMm,
                openingDirection,
                drillingHoles,
                handle
        );
    }

    private static OpeningDirection extrairOpeningDirection(BudgetItem item) {
        String rawConfig = item.getTemplateConfig();
        if (rawConfig == null || rawConfig.isBlank()) {
            return null;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(rawConfig.trim());
            if (node.has("openingDirection") && !node.get("openingDirection").isNull()) {
                String val = node.get("openingDirection").asText().toUpperCase();
                if ("LEFT".equals(val)) {
                    return OpeningDirection.RIGHT_TO_LEFT;
                }
                if ("RIGHT".equals(val)) {
                    return OpeningDirection.LEFT_TO_RIGHT;
                }
                return OpeningDirection.valueOf(val);
            }
        } catch (Exception ex) {
            log.debug("Não foi possível extrair openingDirection do templateConfig: {}", ex.getMessage());
        }
        return null;
    }

    private static List<DrillingHolePoint> extrairFuracoes(BudgetItem item, BigDecimal heightMm, String templateType) {
        List<DrillingHolePoint> pontos = new ArrayList<>();
        String raw = item.getDrillingConfig();

        if (raw != null && !raw.isBlank() && !"{}".equals(raw.trim()) && !"NONE".equalsIgnoreCase(raw.trim())) {
            try {
                JsonNode node = OBJECT_MAPPER.readTree(raw.trim());
                String modeStr = node.has("mode") && !node.get("mode").isNull() ? node.get("mode").asText().toUpperCase() : "";
                boolean isCustom = "CUSTOM".equals(modeStr) || "CUSTOM_DISTANCES".equals(modeStr);

                if (isCustom && node.has("customDistancesMm")) {
                    JsonNode distances = node.get("customDistancesMm");
                    if (distances.isArray() && !distances.isEmpty()) {
                        float h = heightMm != null && heightMm.compareTo(BigDecimal.ZERO) > 0 ? heightMm.floatValue() : 2100f;
                        for (JsonNode dNode : distances) {
                            float dist = (float) dNode.asDouble();
                            float yRatio = Math.clamp(dist / h, 0.08f, 0.92f);
                            pontos.add(new DrillingHolePoint(yRatio, RAIO_PADRAO_MM, String.format("%.0f mm", dist)));
                        }
                    }
                } else {
                    int count = 3;
                    if (node.has("holesCount") && !node.get("holesCount").isNull()) {
                        count = Math.clamp(node.get("holesCount").asInt(), 1, 6);
                    }
                    pontos.addAll(gerarPontosEquidistantes(count));
                }
            } catch (Exception ex) {
                log.debug("Falha ao parsear drillingConfig: {}", ex.getMessage());
            }
        }

        if (pontos.isEmpty() && templateType != null) {
            String upper = templateType.toUpperCase();
            if (upper.contains("GIRO") || upper.contains("PIVOT") || upper.contains("PORTA")) {
                pontos.addAll(gerarPontosEquidistantes(3));
            } else if (upper.contains("MAXIM") || upper.contains("BASCULANTE")) {
                pontos.addAll(gerarPontosEquidistantes(2));
            }
        }

        return pontos;
    }

    private static List<DrillingHolePoint> gerarPontosEquidistantes(int count) {
        List<DrillingHolePoint> pontos = new ArrayList<>();
        if (count <= 1) {
            pontos.add(new DrillingHolePoint(0.50f, RAIO_PADRAO_MM, "Furo Central"));
            return pontos;
        }

        float yMin = 0.12f;
        float yMax = 0.88f;
        float step = (yMax - yMin) / (count - 1);

        for (int i = 0; i < count; i++) {
            float y = yMin + (i * step);
            pontos.add(new DrillingHolePoint(y, RAIO_PADRAO_MM, "Dist. Iguais"));
        }
        return pontos;
    }

    private static TechnicalHandle extrairPuxador(BudgetItem item, BigDecimal heightMm, OpeningDirection direction) {
        String raw = item.getHandleConfig();
        if (raw == null || raw.isBlank() || "{}".equals(raw.trim()) || "NONE".equalsIgnoreCase(raw.trim())) {
            return null;
        }

        try {
            JsonNode node = OBJECT_MAPPER.readTree(raw.trim());
            if (node.has("handleType") && "NONE".equalsIgnoreCase(node.get("handleType").asText())) {
                return null;
            }

            float lengthMm = DEFAULT_HANDLE_LENGTH_MM;
            if (node.has("lengthMm") && !node.get("lengthMm").isNull()) {
                lengthMm = (float) node.get("lengthMm").asDouble();
            }

            HandlePosition position = null;
            if (node.has("position") && !node.get("position").isNull()) {
                try {
                    position = HandlePosition.valueOf(node.get("position").asText().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                    position = null;
                }
            }

            boolean onRightSide = true;
            if (position == HandlePosition.LEFT) {
                onRightSide = false;
            } else if (position == HandlePosition.RIGHT) {
                onRightSide = true;
            } else if (direction == OpeningDirection.RIGHT_TO_LEFT) {
                onRightSide = false;
            }

            float h = heightMm != null && heightMm.compareTo(BigDecimal.ZERO) > 0 ? heightMm.floatValue() : 2100f;
            float lengthRatio = Math.clamp(lengthMm / h, 0.12f, 0.60f);

            String label;
            if (lengthMm >= 1000f) {
                label = String.format("Puxador (%.1fm)", lengthMm / 1000f);
            } else if (lengthMm % 10 == 0) {
                label = String.format("Puxador (%.0fcm)", lengthMm / 10f);
            } else {
                label = String.format("Puxador (%.0fmm)", lengthMm);
            }

            return new TechnicalHandle(onRightSide, lengthRatio, 0.50f, label);
        } catch (Exception ex) {
            log.debug("Falha ao parsear handleConfig: {}", ex.getMessage());
            return null;
        }
    }
}

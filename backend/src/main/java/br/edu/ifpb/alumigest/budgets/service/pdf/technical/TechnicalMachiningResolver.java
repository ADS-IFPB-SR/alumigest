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

    private static final String FIELD_OPENING_DIRECTION = "openingDirection";
    private static final String FIELD_HOLES_COUNT = "holesCount";
    private static final String FIELD_LENGTH_MM = "lengthMm";
    private static final String FIELD_POSITION = "position";
    private static final String FIELD_HANDLE_TYPE = "handleType";
    private static final String FIELD_CUSTOM_DISTANCES = "customDistancesMm";
    private static final String FIELD_MODE = "mode";

    private static final float RAIO_PADRAO_MM = 10.0f;
    private static final float DEFAULT_HANDLE_LENGTH_MM = 250.0f;
    private static final float DEFAULT_HEIGHT_MM = 2100.0f;

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
            if (node.has(FIELD_OPENING_DIRECTION) && !node.get(FIELD_OPENING_DIRECTION).isNull()) {
                String val = node.get(FIELD_OPENING_DIRECTION).asText().toUpperCase();
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
        List<DrillingHolePoint> pontos = parseDrillingJson(item.getDrillingConfig(), heightMm);
        if (pontos.isEmpty() && templateType != null) {
            pontos.addAll(fallbackFuracoesPorTemplate(templateType));
        }
        return pontos;
    }

    private static List<DrillingHolePoint> parseDrillingJson(String raw, BigDecimal heightMm) {
        List<DrillingHolePoint> pontos = new ArrayList<>();
        if (raw == null || raw.isBlank() || "{}".equals(raw.trim()) || "NONE".equalsIgnoreCase(raw.trim())) {
            return pontos;
        }

        try {
            JsonNode node = OBJECT_MAPPER.readTree(raw.trim());
            String modeStr = node.has(FIELD_MODE) && !node.get(FIELD_MODE).isNull()
                    ? node.get(FIELD_MODE).asText().toUpperCase()
                    : "";
            boolean isCustom = "CUSTOM".equals(modeStr) || "CUSTOM_DISTANCES".equals(modeStr);

            if (isCustom && node.has(FIELD_CUSTOM_DISTANCES)) {
                pontos.addAll(parseCustomDistances(node.get(FIELD_CUSTOM_DISTANCES), heightMm));
            } else {
                pontos.addAll(parseEquidistantHoles(node));
            }
        } catch (Exception ex) {
            log.debug("Falha ao parsear drillingConfig: {}", ex.getMessage());
        }
        return pontos;
    }

    private static List<DrillingHolePoint> parseCustomDistances(JsonNode distances, BigDecimal heightMm) {
        List<DrillingHolePoint> pontos = new ArrayList<>();
        if (distances != null && distances.isArray()) {
            float h = heightMm != null && heightMm.compareTo(BigDecimal.ZERO) > 0
                    ? heightMm.floatValue()
                    : DEFAULT_HEIGHT_MM;

            for (JsonNode dNode : distances) {
                float dist = (float) dNode.asDouble();
                float yRatio = Math.clamp(dist / h, 0.08f, 0.92f);
                pontos.add(new DrillingHolePoint(yRatio, RAIO_PADRAO_MM, String.format("%.0f mm", dist)));
            }
        }
        return pontos;
    }

    private static List<DrillingHolePoint> parseEquidistantHoles(JsonNode node) {
        int count = 3;
        if (node.has(FIELD_HOLES_COUNT) && !node.get(FIELD_HOLES_COUNT).isNull()) {
            count = Math.clamp(node.get(FIELD_HOLES_COUNT).asInt(), 1, 6);
        }
        return gerarPontosEquidistantes(count);
    }

    private static List<DrillingHolePoint> fallbackFuracoesPorTemplate(String templateType) {
        String upper = templateType.toUpperCase();
        if (upper.contains("GIRO") || upper.contains("PIVOT") || upper.contains("PORTA")
                || upper.contains("DOOR") || upper.contains("SWING")) {
            return gerarPontosEquidistantes(3);
        }
        if (upper.contains("MAXIM") || upper.contains("BASCULANTE") || upper.contains("AWNING")) {
            return gerarPontosEquidistantes(2);
        }
        return List.of();
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
            JsonNode typeNode = node.has(FIELD_HANDLE_TYPE) ? node.get(FIELD_HANDLE_TYPE) : node.get("type");
            if (typeNode != null && !typeNode.isNull() && "NONE".equalsIgnoreCase(typeNode.asText())) {
                return null;
            }

            float lengthMm = parseHandleLengthMm(node);
            HandlePosition position = parseHandlePosition(node);
            boolean onRightSide = resolveHandleSide(position, direction);

            float h = heightMm != null && heightMm.compareTo(BigDecimal.ZERO) > 0
                    ? heightMm.floatValue()
                    : DEFAULT_HEIGHT_MM;
            float lengthRatio = Math.clamp(lengthMm / h, 0.12f, 0.60f);

            return new TechnicalHandle(onRightSide, lengthRatio, 0.50f, formatHandleLabel(lengthMm));
        } catch (Exception ex) {
            log.debug("Falha ao parsear handleConfig: {}", ex.getMessage());
            return null;
        }
    }

    private static float parseHandleLengthMm(JsonNode node) {
        if (node.has(FIELD_LENGTH_MM) && !node.get(FIELD_LENGTH_MM).isNull()) {
            return (float) node.get(FIELD_LENGTH_MM).asDouble();
        }
        return DEFAULT_HANDLE_LENGTH_MM;
    }

    private static HandlePosition parseHandlePosition(JsonNode node) {
        if (node.has(FIELD_POSITION) && !node.get(FIELD_POSITION).isNull()) {
            try {
                return HandlePosition.valueOf(node.get(FIELD_POSITION).asText().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }
        return null;
    }

    private static boolean resolveHandleSide(HandlePosition position, OpeningDirection direction) {
        if (position == HandlePosition.LEFT) {
            return false;
        }
        if (position == HandlePosition.RIGHT) {
            return true;
        }
        return direction != OpeningDirection.RIGHT_TO_LEFT;
    }

    private static String formatHandleLabel(float lengthMm) {
        if (lengthMm >= 1000f) {
            return String.format("Puxador (%.1fm)", lengthMm / 1000f);
        }
        if (lengthMm % 10 == 0) {
            return String.format("Puxador (%.0fcm)", lengthMm / 10f);
        }
        return String.format("Puxador (%.0fmm)", lengthMm);
    }
}

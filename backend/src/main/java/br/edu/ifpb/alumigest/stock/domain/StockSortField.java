package br.edu.ifpb.alumigest.stock.domain;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.Locale;

/**
 * Critérios permitidos (whitelist) para ordenação de saldos de estoque.
 *
 * <p>Encapsula a estratégia de ordenação para garantir conformidade com o Open/Closed Principle
 * e impedir ordenação dinâmica arbitrária.
 */
public enum StockSortField {

    NAME(Comparator.comparing(StockSortField::safeName, String.CASE_INSENSITIVE_ORDER)),

    AVAILABLE(
        Comparator.comparing(StockSortField::safeAvailable)
            .thenComparing(StockSortField::safeName, String.CASE_INSENSITIVE_ORDER)
    ),

    CRITICALITY(
        Comparator.comparingInt(StockSortField::criticalityRank)
            .thenComparing(StockSortField::safeAvailable)
            .thenComparing(StockSortField::safeName, String.CASE_INSENSITIVE_ORDER)
    );

    private final Comparator<StockItemResponseDTO> comparator;

    StockSortField(Comparator<StockItemResponseDTO> comparator) {
        this.comparator = comparator;
    }

    /**
     * Converte um parâmetro textual opcional em um critério válido de ordenação.
     *
     * @param rawValue parâmetro informado na requisição REST
     * @return critério correspondente ou {@link #NAME} quando omitido
     */
    public static StockSortField fromParam(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return NAME;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        for (StockSortField field : values()) {
            if (field.name().equals(normalized)) {
                return field;
            }
        }
        throw new BusinessException(
            "Critério de ordenação inválido: '" + rawValue
                + "'. Valores aceitos: NAME, AVAILABLE, CRITICALITY."
        );
    }

    /**
     * Retorna o comparador associado ao critério.
     *
     * @return comparador determinístico de {@link StockItemResponseDTO}
     */
    public Comparator<StockItemResponseDTO> comparator() {
        return comparator;
    }

    private static String safeName(StockItemResponseDTO dto) {
        return dto.materialName() != null ? dto.materialName() : "";
    }

    private static BigDecimal safeAvailable(StockItemResponseDTO dto) {
        return dto.availableQuantity() != null ? dto.availableQuantity() : BigDecimal.ZERO;
    }

    private static int criticalityRank(StockItemResponseDTO dto) {
        if (dto.alertStatus() == null) {
            return 3;
        }
        return switch (dto.alertStatus()) {
            case NEED_PURCHASE -> 0;
            case ORDER_POINT -> 1;
            case IN_STOCK -> 2;
        };
    }
}

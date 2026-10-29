package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculadora especialista para perfis e barras de alumínio em metro linear (US-46.2).
 * Converte comprimento em milímetros para metros faturáveis, aplicando fator de perda de corte.
 */
@Component
public class AluminumProfilePartCalculator implements PartItemCalculator {

    private static final int MAX_STANDARD_BAR_LENGTH_MM = 6000;
    private static final BigDecimal MILLIMETERS_PER_METER = BigDecimal.valueOf(1000);

    @Override
    public MaterialCategoryType getCategory() {
        return MaterialCategoryType.PROFILE;
    }

    @Override
    public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("A requisição de cálculo não pode ser nula");
        }
        if (request.heightMm() == null || request.heightMm() <= 0) {
            throw new IllegalArgumentException("O comprimento do perfil de alumínio deve ser maior que zero");
        }
        if (request.heightMm() > MAX_STANDARD_BAR_LENGTH_MM) {
            throw new IllegalArgumentException("O comprimento do perfil de alumínio não pode exceder o tamanho padrão da barra industrial (6000 mm)");
        }
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new IllegalArgumentException("A quantidade de barras ou peças deve ser maior que zero");
        }
        if (request.unitPrice() == null || request.unitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O preço unitário por metro deve ser maior que zero");
        }

        // Conversão de comprimento (mm) para metros lineares
        BigDecimal lengthMeters = BigDecimal.valueOf(request.heightMm())
            .divide(MILLIMETERS_PER_METER, 4, RoundingMode.HALF_UP);

        // Metragem líquida = comprimento (m) * quantidade de peças
        BigDecimal netMeters = lengthMeters.multiply(BigDecimal.valueOf(request.quantity()));

        // Fator de perda de corte (se nulo ou negativo, adota 0)
        BigDecimal lossFactor = (request.lossFactor() != null && request.lossFactor().compareTo(BigDecimal.ZERO) >= 0)
            ? request.lossFactor()
            : BigDecimal.ZERO;

        // Metragem faturável com perda (escala 4 casas decimais)
        BigDecimal billableMeters = netMeters.multiply(BigDecimal.ONE.add(lossFactor))
            .setScale(4, RoundingMode.HALF_UP);

        // Preço total com arredondamento monetário HALF_EVEN (escala 2 casas decimais)
        BigDecimal totalPrice = billableMeters.multiply(request.unitPrice())
            .setScale(2, RoundingMode.HALF_EVEN);

        return new CalculatePartItemResponse(
            billableMeters,
            request.unitPrice().setScale(2, RoundingMode.HALF_EVEN),
            totalPrice
        );
    }
}

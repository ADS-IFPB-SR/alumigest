package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class GlassPartCalculator implements PartItemCalculator {

    private static final BigDecimal MIN_BILLABLE_AREA = new BigDecimal("0.2500");
    private static final BigDecimal ONE_MILLION = new BigDecimal("1000000");

    @Override
    public MaterialCategoryType getCategory() {
        return MaterialCategoryType.GLASS;
    }

    @Override
    public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
        BigDecimal rawArea = BigDecimal.valueOf(request.widthMm())
            .multiply(BigDecimal.valueOf(request.heightMm()))
            .divide(ONE_MILLION, 4, RoundingMode.HALF_UP);

        BigDecimal billableUnitArea = rawArea.max(MIN_BILLABLE_AREA);
        BigDecimal totalArea = billableUnitArea.multiply(BigDecimal.valueOf(request.quantity()));
        BigDecimal totalPrice = totalArea.multiply(request.unitPrice());

        return new CalculatePartItemResponse(totalArea, request.unitPrice(), totalPrice);
    }
}
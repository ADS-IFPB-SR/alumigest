package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class FilmPartCalculator implements PartItemCalculator {

    private static final BigDecimal ONE_MILLION = new BigDecimal("1000000");

    @Override
    public MaterialCategoryType getCategory() {
        return MaterialCategoryType.FILM;
    }

    @Override
    public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
        if (request.widthMm() == null || request.heightMm() == null || request.quantity() == null || request.unitPrice() == null) {
            throw new IllegalArgumentException("Largura, altura, quantidade e preço unitário são obrigatórios para o cálculo de película.");
        }

        BigDecimal netArea = BigDecimal.valueOf(request.widthMm())
            .multiply(BigDecimal.valueOf(request.heightMm()))
            .divide(ONE_MILLION, 4, RoundingMode.HALF_EVEN)
            .multiply(BigDecimal.valueOf(request.quantity()));

        BigDecimal lossFactor = request.lossFactor() != null ? request.lossFactor() : BigDecimal.ZERO;
        BigDecimal billableArea = netArea.multiply(BigDecimal.ONE.add(lossFactor)).setScale(4, RoundingMode.HALF_EVEN);
        
        BigDecimal totalPrice = billableArea.multiply(request.unitPrice()).setScale(2, RoundingMode.HALF_EVEN);

        return new CalculatePartItemResponse(billableArea, request.unitPrice().setScale(2, RoundingMode.HALF_EVEN), totalPrice, false);
    }
}
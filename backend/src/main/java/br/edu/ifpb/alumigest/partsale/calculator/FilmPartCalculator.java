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
        // Cálculo da área líquida em m² (L x A / 1.000.000) * Qtd
        BigDecimal netArea = BigDecimal.valueOf(request.widthMm())
            .multiply(BigDecimal.valueOf(request.heightMm()))
            .divide(ONE_MILLION, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(request.quantity()));

        // Pega o lossFactor do REQUEST e aplica o acréscimo de perda de bobina
        BigDecimal lossFactor = request.lossFactor() != null ? request.lossFactor() : BigDecimal.ZERO;
        BigDecimal billableArea = netArea.multiply(BigDecimal.ONE.add(lossFactor));
        
        // Valor total usando o preço unitário do request
        BigDecimal totalPrice = billableArea.multiply(request.unitPrice());

        // Retorna exatamente a assinatura do DTO de resposta: (área faturável, preço unitário, total)
        return new CalculatePartItemResponse(billableArea, request.unitPrice(), totalPrice);
    }
}
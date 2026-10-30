package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

/**
 * Calculadora especialista para venda avulsa de ferragens por unidade (US-46.1).
 */
@Component
public class HardwarePartCalculator implements PartItemCalculator {

  @Override
  public MaterialCategoryType getCategory() {
    return MaterialCategoryType.HARDWARE;
  }

  @Override
  public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("A requisição de cálculo não pode ser nula");
    }
    if (request.quantity() == null || request.quantity() <= 0) {
      throw new IllegalArgumentException("A quantidade deve ser positiva");
    }
    if (request.unitPrice() == null || request.unitPrice().compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("O preço unitário não pode ser negativo");
    }

    BigDecimal qty = BigDecimal.valueOf(request.quantity());
    BigDecimal unitPrice = request.unitPrice().setScale(2, RoundingMode.HALF_EVEN);
    BigDecimal totalPrice = unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_EVEN);
    BigDecimal calculatedUnitMeasure = qty.setScale(4, RoundingMode.HALF_UP);

    return new CalculatePartItemResponse(
        calculatedUnitMeasure,
        unitPrice,
        totalPrice
    );
  }
}

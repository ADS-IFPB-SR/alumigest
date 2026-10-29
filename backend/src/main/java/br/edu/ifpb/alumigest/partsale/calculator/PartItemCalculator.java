package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;

/**
 * Contrato Strategy para cálculos especialistas de cada categoria de material avulso.
 */
public interface PartItemCalculator {

    MaterialCategoryType getCategory();

    CalculatePartItemResponse calculate(CalculatePartItemRequest request);
}

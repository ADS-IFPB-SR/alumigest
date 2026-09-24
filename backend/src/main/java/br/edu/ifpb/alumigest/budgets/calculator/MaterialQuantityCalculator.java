package br.edu.ifpb.alumigest.budgets.calculator;

import java.math.BigDecimal;

public interface MaterialQuantityCalculator {

    // Identifica qual categoria a classe sabe calcular
    CategoryType getCategoryType();

    // Calcula a quantidade de material necessário com base no template, dimensões e
    // quantidade
    BigDecimal calculate(TemplateType templateType, int widthMm, int heightMm, int quantity,
            BigDecimal requestedMaterialQty);
}

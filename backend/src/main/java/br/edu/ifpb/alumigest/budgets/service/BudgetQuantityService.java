package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.calculator.CategoryType;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialCalculatorFactory;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BudgetQuantityService {

    private final MaterialCalculatorFactory calculatorFactory;
    private final MaterialRepository materialRepository;
    private final br.edu.ifpb.alumigest.catalog.repository.ProductRepository productRepository;

    public BudgetQuantityService(MaterialCalculatorFactory calculatorFactory, MaterialRepository materialRepository, br.edu.ifpb.alumigest.catalog.repository.ProductRepository productRepository) {
        this.calculatorFactory = calculatorFactory;
        this.materialRepository = materialRepository;
        this.productRepository = productRepository;
    }

    /**
     * Calcula as quantidades matemáticas de todos os materiais do orçamento baseando-se nas dimensões da esquadria.
     */
    public void calculateQuantities(Budget budget) {
        if (budget.getItems() == null) {
            return;
        }
        for (BudgetItem item : budget.getItems()) {
            processBudgetItem(item);
        }
    }

    private void processBudgetItem(BudgetItem item) {
        br.edu.ifpb.alumigest.catalog.domain.Product productEntity = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + item.getProduct().getId()));
        item.setProduct(productEntity);
        item.setProductName(productEntity.getName());

        TemplateType template = resolveTemplateType(item.getTemplateType());

        if (item.getOptions() != null) {
            for (BudgetItemOption option : item.getOptions()) {
                processItemOption(item, option, template);
            }
        }
    }

    private TemplateType resolveTemplateType(String rawTemplateType) {
        if (rawTemplateType == null) {
            return null;
        }
        try {
            return TemplateType.valueOf(rawTemplateType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void processItemOption(BudgetItem item, BudgetItemOption option, TemplateType template) {
        Material material = materialRepository.findById(option.getMaterial().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado: " + option.getMaterial().getId()));

        option.setMaterialName(material.getName());
        option.setUnitMeasure(material.getUnitMeasure() != null ? material.getUnitMeasure().name() : "");

        BigDecimal calculatedQty = computeQuantity(item, option, template);
        if (calculatedQty != null) {
            option.setQuantity(calculatedQty);
        } else if (option.getQuantity() == null) {
            option.setQuantity(BigDecimal.ZERO);
        }
    }

    private BigDecimal computeQuantity(BudgetItem item, BudgetItemOption option, TemplateType template) {
        if (template == null || option.getCategoryType() == null) {
            return option.getQuantity() != null ? option.getQuantity() : BigDecimal.ZERO;
        }

        try {
            CategoryType calcCategory = CategoryType.valueOf(option.getCategoryType().name());
            MaterialQuantityCalculator calculator = calculatorFactory.getCalculator(calcCategory);

            return calculator.calculate(
                    template,
                    item.getWidthMm().intValue(),
                    item.getHeightMm().intValue(),
                    item.getQuantity(),
                    option.getQuantity()
            );
        } catch (IllegalArgumentException e) {
            return option.getQuantity() != null ? option.getQuantity() : BigDecimal.ZERO;
        }
    }
}

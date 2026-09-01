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
        for (BudgetItem item : budget.getItems()) {
            
            // Resolve o produto no banco de dados para salvar os metadados
            br.edu.ifpb.alumigest.catalog.domain.Product productEntity = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + item.getProduct().getId()));
            item.setProduct(productEntity);
            item.setProductName(productEntity.getName());
            
            TemplateType template = null;
            if (item.getTemplateType() != null) {
                try {
                    template = TemplateType.valueOf(item.getTemplateType().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Ignora caso o templateType enviado não seja coberto ainda pelas calculadoras
                }
            }

            for (BudgetItemOption option : item.getOptions()) {
                Material material = materialRepository.findById(option.getMaterial().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado: " + option.getMaterial().getId()));

                // Preenche os dados reais vindos do banco de dados para caching do orçamento
                option.setMaterialName(material.getName());
                option.setUnitMeasure(material.getUnitMeasure() != null ? material.getUnitMeasure().name() : "");

                if (option.getCategoryType() == null) {
                    if (material.getGroup() != null && material.getGroup().getCode() != null) {
                        String grpCode = material.getGroup().getCode().toUpperCase();
                        if (grpCode.contains("VIDRO")) {
                            option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.GLASS);
                        } else if (grpCode.contains("ALUMINIO") || grpCode.contains("PERFIL")) {
                            option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.PROFILE);
                        } else if (grpCode.contains("PELICULA")) {
                            option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.FILM);
                        } else if (grpCode.contains("ROL")) {
                            option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.ROLLERS);
                        } else {
                            option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.HARDWARE);
                        }
                    } else {
                        option.setCategoryType(br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.HARDWARE);
                    }
                }

                if (template != null && option.getCategoryType() != null) {
                    try {
                        CategoryType calcCategory = CategoryType.valueOf(option.getCategoryType().name());
                        MaterialQuantityCalculator calculator = calculatorFactory.getCalculator(calcCategory);
                        
                        BigDecimal qty = calculator.calculate(
                            template,
                            item.getWidthMm().intValue(),
                            item.getHeightMm().intValue(),
                            item.getQuantity(),
                            option.getQuantity() // Se for nulo, a calculadora lida com isso (ex: hardware)
                        );
                        
                        option.setQuantity(qty);
                    } catch (IllegalArgumentException e) {
                        // Se não tiver calculadora pra categoria, mantém a quantity enviada ou zera
                        if (option.getQuantity() == null) {
                            option.setQuantity(BigDecimal.ZERO);
                        }
                    }
                } else if (option.getQuantity() == null) {
                    // Fallback
                    option.setQuantity(BigDecimal.ZERO);
                }
            }
        }
    }
}

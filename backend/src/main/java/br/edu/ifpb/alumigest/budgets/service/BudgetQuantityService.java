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
                template = TemplateType.parse(item.getTemplateType());
            }

            for (BudgetItemOption option : item.getOptions()) {
                Material material = materialRepository.findById(option.getMaterial().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado: " + option.getMaterial().getId()));

                // Preenche os dados reais vindos do banco de dados para caching do orçamento
                option.setMaterialName(material.getName());
                option.setUnitMeasure(material.getUnitMeasure() != null ? material.getUnitMeasure().name() : "");


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

    public br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO previewCalculation(
            br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO request) {

        int w = request.widthMm().intValue();
        int h = request.heightMm().intValue();
        int qty = (request.quantity() != null && request.quantity() > 0) ? request.quantity() : 1;

        BigDecimal widthM = request.widthMm().divide(BigDecimal.valueOf(1000), 4, java.math.RoundingMode.HALF_UP);
        BigDecimal heightM = request.heightMm().divide(BigDecimal.valueOf(1000), 4, java.math.RoundingMode.HALF_UP);

        BigDecimal unitPhysicalArea = widthM.multiply(heightM).setScale(4, java.math.RoundingMode.HALF_UP);
        BigDecimal totalPhysicalArea = unitPhysicalArea.multiply(BigDecimal.valueOf(qty)).setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal unitPerimeter = widthM.add(heightM).multiply(BigDecimal.valueOf(2)).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalPerimeter = unitPerimeter.multiply(BigDecimal.valueOf(qty)).setScale(2, java.math.RoundingMode.HALF_UP);

        TemplateType template = TemplateType.parse(request.templateType());

        java.util.List<br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO.BudgetItemOptionCalculationResultDTO> results = new java.util.ArrayList<>();

        if (request.options() != null) {
            for (br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO opt : request.options()) {
                CategoryType calcCategory = CategoryType.parse(opt.categoryType());

                BigDecimal suggested = BigDecimal.ZERO;
                BigDecimal physicalMin = BigDecimal.ZERO;

                if (calcCategory != null) {
                    try {
                        MaterialQuantityCalculator calculator = calculatorFactory.getCalculator(calcCategory);
                        suggested = calculator.calculate(template, w, h, qty, null);
                    } catch (IllegalArgumentException e) {
                        suggested = BigDecimal.ONE;
                    }

                    if (calcCategory == CategoryType.GLASS || calcCategory == CategoryType.FILM) {
                        physicalMin = totalPhysicalArea;
                    } else if (calcCategory == CategoryType.PROFILE) {
                        physicalMin = totalPerimeter;
                    } else {
                        physicalMin = BigDecimal.valueOf(qty);
                    }
                }

                boolean isBelow = false;
                String warningMessage = null;

                if (opt.manualQuantity() != null && opt.manualQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    if (physicalMin.compareTo(BigDecimal.ZERO) > 0 && opt.manualQuantity().compareTo(physicalMin) < 0) {
                        isBelow = true;
                        if (calcCategory == CategoryType.GLASS) {
                            warningMessage = String.format("A quantidade inserida (%.2f m²) é inferior à área física do vão (%.2f m²). Risco de corte insuficiente!",
                                    opt.manualQuantity(), physicalMin);
                        } else if (calcCategory == CategoryType.PROFILE) {
                            warningMessage = String.format("A metragem de perfil inserida (%.2f m) é inferior ao perímetro mínimo do vão (%.2f m). Risco de barra insuficiente!",
                                    opt.manualQuantity(), physicalMin);
                        } else {
                            warningMessage = String.format("A quantidade informada (%.2f) é inferior ao mínimo físico necessário (%.2f).",
                                    opt.manualQuantity(), physicalMin);
                        }
                    }
                }

                results.add(new br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO.BudgetItemOptionCalculationResultDTO(
                        opt.materialId(),
                        opt.categoryType(),
                        suggested,
                        physicalMin,
                        isBelow,
                        warningMessage
                ));
            }
        }

        return new br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO(
                totalPhysicalArea,
                totalPerimeter,
                results
        );
    }
}

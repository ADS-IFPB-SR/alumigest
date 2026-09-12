package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.calculator.CategoryType;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialCalculatorFactory;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO.BudgetItemOptionCalculationResultDTO;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetQuantityService {

    private final MaterialCalculatorFactory calculatorFactory;
    private final MaterialRepository materialRepository;
    private final ProductRepository productRepository;

    public BudgetQuantityService(MaterialCalculatorFactory calculatorFactory,
                                 MaterialRepository materialRepository,
                                 ProductRepository productRepository) {
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
        Product productEntity = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + item.getProduct().getId()));
        item.setProduct(productEntity);
        item.setProductName(productEntity.getName());

        String rawTemplate = item.getTemplateType();
        if ((rawTemplate == null || rawTemplate.isBlank()) && productEntity.getTemplateType() != null) {
            rawTemplate = productEntity.getTemplateType().name();
            item.setTemplateType(rawTemplate);
        }
        TemplateType template = resolveTemplateType(rawTemplate);
        if (item.getOptions() != null) {
            for (BudgetItemOption option : item.getOptions()) {
                processItemOption(item, option, template);
            }
        }
    }

    public BudgetItemCalculationResponseDTO previewCalculation(BudgetItemCalculationRequestDTO request) {
        int w = request.widthMm().intValue();
        int h = request.heightMm().intValue();
        int qty = (request.quantity() != null && request.quantity() > 0) ? request.quantity() : 1;

        BigDecimal widthM = request.widthMm().divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        BigDecimal heightM = request.heightMm().divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

        BigDecimal unitPhysicalArea = widthM.multiply(heightM).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalPhysicalArea = unitPhysicalArea.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

        BigDecimal unitPerimeter = widthM.add(heightM).multiply(BigDecimal.valueOf(2)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPerimeter = unitPerimeter.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

        TemplateType template = TemplateType.parse(request.templateType());
        List<BudgetItemOptionCalculationResultDTO> results = new ArrayList<>();

        if (request.options() != null) {
            for (BudgetItemOptionCalculationDTO opt : request.options()) {
                results.add(calculateOptionResult(opt, template, w, h, qty, totalPhysicalArea, totalPerimeter));
            }
        }

        return new BudgetItemCalculationResponseDTO(
                totalPhysicalArea,
                totalPerimeter,
                results
        );
    }

    private BudgetItemOptionCalculationResultDTO calculateOptionResult(
            BudgetItemOptionCalculationDTO opt,
            TemplateType template,
            int w,
            int h,
            int qty,
            BigDecimal totalPhysicalArea,
            BigDecimal totalPerimeter) {

        CategoryType calcCategory = CategoryType.parse(opt.categoryType());
        BigDecimal suggested = BigDecimal.ZERO;
        BigDecimal physicalMin = BigDecimal.ZERO;

        if (calcCategory != null) {
            suggested = computeSuggestedQuantity(calcCategory, template, w, h, qty);
            physicalMin = switch (calcCategory) {
                case GLASS, FILM -> totalPhysicalArea;
                case PROFILE -> (suggested != null && suggested.compareTo(BigDecimal.ZERO) > 0) ? suggested : totalPerimeter;
                default -> BigDecimal.valueOf(qty);
            };
        }

        boolean isBelow = isBelowMinimum(opt.manualQuantity(), physicalMin);
        String warningMessage = isBelow ? buildWarningMessage(calcCategory, opt.manualQuantity(), physicalMin) : null;

        return new BudgetItemOptionCalculationResultDTO(
                opt.materialId(),
                opt.categoryType(),
                suggested,
                physicalMin,
                isBelow,
                warningMessage
        );
    }

    private BigDecimal computeSuggestedQuantity(CategoryType category, TemplateType template, int w, int h, int qty) {
        try {
            MaterialQuantityCalculator calculator = calculatorFactory.getCalculator(category);
            return calculator.calculate(template, w, h, qty, null);
        } catch (IllegalArgumentException e) {
            return BigDecimal.ONE;
        }
    }

    private boolean isBelowMinimum(BigDecimal manualQty, BigDecimal physicalMin) {
        return manualQty != null
                && manualQty.compareTo(BigDecimal.ZERO) > 0
                && physicalMin.compareTo(BigDecimal.ZERO) > 0
                && manualQty.compareTo(physicalMin) < 0;
    }

    private String buildWarningMessage(CategoryType category, BigDecimal manualQty, BigDecimal physicalMin) {
        if (category == CategoryType.GLASS) {
            return String.format("A quantidade inserida (%.2f m²) é inferior à área física do vão (%.2f m²). Risco de corte insuficiente!",
                    manualQty, physicalMin);
        }
        if (category == CategoryType.PROFILE) {
            return String.format("A metragem de perfil inserida (%.2f m) é inferior ao consumo físico necessário da esquadria (%.2f m). Risco de barra insuficiente!",
                    manualQty, physicalMin);
        }
        return String.format("A quantidade informada (%.2f) é inferior ao mínimo físico necessário (%.2f).",
                manualQty, physicalMin);
    }

    private TemplateType resolveTemplateType(String rawTemplateType) {
        if (rawTemplateType == null) {
            return null;
        }
        return TemplateType.parse(rawTemplateType);
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
            CategoryType calcCategory = CategoryType.parse(option.getCategoryType().name());
            if (calcCategory == null) {
                return option.getQuantity() != null ? option.getQuantity() : BigDecimal.ZERO;
            }
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

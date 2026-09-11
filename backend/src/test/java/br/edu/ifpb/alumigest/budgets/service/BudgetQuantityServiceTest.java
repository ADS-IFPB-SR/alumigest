package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.calculator.CategoryType;
import br.edu.ifpb.alumigest.budgets.calculator.GlassQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialCalculatorFactory;
import br.edu.ifpb.alumigest.budgets.calculator.ProfileQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class BudgetQuantityServiceTest {

    private BudgetQuantityService budgetQuantityService;
    private MaterialCalculatorFactory calculatorFactory;

    @BeforeEach
    void setUp() {
        GlassQuantityCalculator glassCalculator = new GlassQuantityCalculator();
        ProfileQuantityCalculator profileCalculator = new ProfileQuantityCalculator();

        calculatorFactory = new MaterialCalculatorFactory(List.of(glassCalculator, profileCalculator));

        budgetQuantityService = new BudgetQuantityService(calculatorFactory, null, null);
    }

    @Test
    @DisplayName("Deve calcular preview de cálculo com área e perímetro físicos corretos")
    void previewCalculation_ShouldCalculatePhysicalMetrics() {
        UUID glassId = UUID.randomUUID();
        BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                "SLIDING_DOOR_2F",
                new BigDecimal("2000"), // 2.0m
                new BigDecimal("2100"), // 2.1m
                1,
                List.of(
                        new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                glassId, "GLASS", null
                        )
                )
        );

        BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

        assertNotNull(response);
        // Área física: 2.0 * 2.1 = 4.20 m2
        assertEquals(new BigDecimal("4.20"), response.physicalAreaM2());
        // Perímetro: (2.0 + 2.1) * 2 = 8.20 m
        assertEquals(new BigDecimal("8.20"), response.physicalPerimeterM());

        assertFalse(response.options().isEmpty());
        var glassResult = response.options().getFirst();
        assertEquals(new BigDecimal("4.20"), glassResult.suggestedQuantity());
        assertFalse(glassResult.isBelowPhysicalMinimum());
    }

    @Test
    @DisplayName("Deve emitir warning quando quantidade manual for menor que o vão físico")
    void previewCalculation_ShouldEmitWarningWhenBelowPhysicalMinimum() {
        UUID glassId = UUID.randomUUID();
        BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                "SLIDING_DOOR_2F",
                new BigDecimal("2000"),
                new BigDecimal("2100"),
                1,
                List.of(
                        new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                glassId, "GLASS", new BigDecimal("1.50") // 1.50 < 4.20
                        )
                )
        );

        BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

        assertNotNull(response);
        var glassResult = response.options().getFirst();
        assertTrue(glassResult.isBelowPhysicalMinimum());
        assertNotNull(glassResult.warningMessage());
        assertTrue(glassResult.warningMessage().contains("inferior à área física do vão"));
    }

    @Test
    @DisplayName("GlassQuantityCalculator deve respeitar quantidade manual informada pelo vidraceiro")
    void glassQuantityCalculator_ShouldRespectManualQuantity() {
        GlassQuantityCalculator calculator = new GlassQuantityCalculator();
        BigDecimal manualQty = new BigDecimal("5.50");

        BigDecimal result = calculator.calculate(TemplateType.SLIDING_2_LEAF, 1000, 1000, 1, manualQty);

        assertEquals(manualQty, result);
    }
}

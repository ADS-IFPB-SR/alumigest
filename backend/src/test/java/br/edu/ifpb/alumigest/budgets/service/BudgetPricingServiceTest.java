package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetPricingServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @InjectMocks
    private BudgetPricingService budgetPricingService;

    private Budget budget;
    private BudgetItem item;
    private BudgetItemOption option1;
    private BudgetItemOption option2;
    private Material material1;
    private Material material2;

    @BeforeEach
    void setUp() {
        budget = new Budget();
        
        item = new BudgetItem();
        item.setLaborCost(new BigDecimal("150.00")); // Mão de obra do item: R$ 150

        // Mock dos Materiais
        material1 = new Material();
        material1.setId(UUID.randomUUID());
        material1.setSalePrice(new BigDecimal("50.00")); // R$ 50/unidade

        material2 = new Material();
        material2.setId(UUID.randomUUID());
        material2.setSalePrice(new BigDecimal("10.50")); // R$ 10.50/unidade

        // Opção 1: 2 unidades do Material 1 (2 * 50 = 100)
        option1 = new BudgetItemOption();
        option1.setMaterial(material1);
        option1.setQuantity(new BigDecimal("2.00"));

        // Opção 2: 4 unidades do Material 2 (4 * 10.50 = 42)
        option2 = new BudgetItemOption();
        option2.setMaterial(material2);
        option2.setQuantity(new BigDecimal("4.00"));

        item.addOption(option1);
        item.addOption(option2);
        budget.addItem(item);
    }

    @Test
    @DisplayName("Deve somar corretamente múltiplos materiais e mão de obra (Sem Desconto)")
    void calculatePricing_Success_WithoutDiscount() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));

        // Act
        budgetPricingService.calculatePricing(budget);

        // Assert
        // Material 1: 2 * 50 = 100
        // Material 2: 4 * 10.50 = 42
        // Labor Cost: 150
        // Total esperado: 292.00
        assertEquals(new BigDecimal("292.00"), budget.getSubtotal());
        assertEquals(new BigDecimal("0.00"), budget.getDiscountValue());
        assertEquals(new BigDecimal("292.00"), budget.getTotal());
        
        // Verifica se as opções também foram atualizadas internamente
        assertEquals(new BigDecimal("50.00"), option1.getUnitPrice());
        assertEquals(new BigDecimal("100.00"), option1.getTotalPrice());
    }

    @Test
    @DisplayName("Deve calcular exato desconto de 15% aplicando arredondamento HALF_UP")
    void calculatePricing_Success_With15PercentDiscount() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));
        
        budget.setDiscountPercent(new BigDecimal("15.00")); // 15% de desconto

        // Act
        budgetPricingService.calculatePricing(budget);

        // Assert
        // Subtotal = 292.00
        // Desconto = 292 * 0.15 = 43.80
        // Total = 292 - 43.80 = 248.20
        assertEquals(new BigDecimal("292.00"), budget.getSubtotal());
        assertEquals(new BigDecimal("43.80"), budget.getDiscountValue());
        assertEquals(new BigDecimal("248.20"), budget.getTotal());
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException se o desconto for maior que 100%")
    void calculatePricing_ThrowsException_WhenDiscountExceeds100() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));
        
        budget.setDiscountPercent(new BigDecimal("105.00")); // 105% (Ilegal)

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            budgetPricingService.calculatePricing(budget);
        });

        assertEquals("O desconto percentual não pode ser maior que 100%", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException se o material não for encontrado no repositório")
    void calculatePricing_ThrowsException_WhenMaterialNotFound() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.empty()); // Banco de dados não achou

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            budgetPricingService.calculatePricing(budget);
        });

        assertTrue(exception.getMessage().contains("Material não encontrado"));
    }
}

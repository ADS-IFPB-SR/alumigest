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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
    @DisplayName("[Particionamento de Equivalência] Deve calcular materiais no item e consolidar mão de obra no budgetSubtotal sem desconto")
    void calculatePricing_Success_WithoutDiscount() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));

        // Act
        budgetPricingService.calculatePricing(budget);

        // Assert
        // Material 1: 2 * 50 = 100
        // Material 2: 4 * 10.50 = 42
        // Subtotal estrito do item (apenas materiais): 142.00
        // Labor Cost: 150.00
        // Subtotal bruto do orçamento: 142 + 150 = 292.00
        assertEquals(new BigDecimal("142.00"), item.getSubtotal());
        assertEquals(new BigDecimal("292.00"), budget.getSubtotal());
        assertEquals(new BigDecimal("0.00"), budget.getDiscountValue());
        assertEquals(new BigDecimal("292.00"), budget.getTotal());
        
        // Verifica se as opções também foram atualizadas internamente
        assertEquals(new BigDecimal("50.00"), option1.getUnitPrice());
        assertEquals(new BigDecimal("100.00"), option1.getTotalPrice());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve calcular exato desconto de 15% aplicando arredondamento HALF_UP")
    void calculatePricing_Success_With15PercentDiscount() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));
        
        budget.setDiscountPercent(new BigDecimal("15.00")); // 15% de desconto

        // Act
        budgetPricingService.calculatePricing(budget);

        // Assert
        // Item Subtotal (materiais): 142.00
        // Subtotal Geral = 292.00
        // Desconto = 292 * 0.15 = 43.80
        // Total = 292 - 43.80 = 248.20
        assertEquals(new BigDecimal("142.00"), item.getSubtotal());
        assertEquals(new BigDecimal("292.00"), budget.getSubtotal());
        assertEquals(new BigDecimal("43.80"), budget.getDiscountValue());
        assertEquals(new BigDecimal("248.20"), budget.getTotal());
    }

    @Test
    @DisplayName("[Regressão Bug #333] Deve isolar mão de obra do subtotal do item e calcular totais corretamente (Cenário Issue #333)")
    void calculatePricing_ShouldNotEmbedLaborCostInItemSubtotal_Issue333Scenario() {
        // Arrange - Cenário fiel da issue #333:
        // Item: R$ 4.840,18 em materiais
        // Mão de Obra: R$ 2.000,00
        // Desconto: 11%
        // Esperado: item.subtotal = 4.840,18, budget.subtotal = 6.840,18, desconto = 752,42, total = 6.087,76
        Budget customBudget = new Budget();
        BudgetItem customItem = new BudgetItem();
        customItem.setLaborCost(new BigDecimal("2000.00"));
        customItem.setQuantity(1);

        Material mat = new Material();
        mat.setId(UUID.randomUUID());
        mat.setSalePrice(new BigDecimal("4840.18"));

        BudgetItemOption opt = new BudgetItemOption();
        opt.setMaterial(mat);
        opt.setQuantity(new BigDecimal("1.00"));
        customItem.addOption(opt);
        customBudget.addItem(customItem);
        customBudget.setDiscountPercent(new BigDecimal("11.00"));

        when(materialRepository.findById(mat.getId())).thenReturn(Optional.of(mat));

        // Act
        budgetPricingService.calculatePricing(customBudget);

        // Assert
        assertEquals(new BigDecimal("4840.18"), customItem.getSubtotal(),
                "O subtotal do item deve conter estritamente os materiais sem embutir mão de obra");
        assertEquals(new BigDecimal("6840.18"), customBudget.getSubtotal(),
                "O subtotal do orçamento deve consolidar materiais + mão de obra");
        assertEquals(new BigDecimal("752.42"), customBudget.getDiscountValue(),
                "O desconto de 11% deve incidir sobre R$ 6.840,18 resultando em R$ 752,42");
        assertEquals(new BigDecimal("6087.76"), customBudget.getTotal(),
                "O total final líquido deve ser exatamente R$ 6.087,76");
    }

    @Test
    @DisplayName("[Particionamento de Equivalência] Deve multiplicar materiais pela quantidade de esquadrias sem multiplicar mão de obra unitária fixa")
    void calculatePricing_ShouldMultiplyMaterialsByItemQuantity() {
        // Arrange: 2 esquadrias com materiais = 100.00 cada (total materiais = 200.00) e MO fixa = 50.00
        Budget multiQtyBudget = new Budget();
        BudgetItem multiItem = new BudgetItem();
        multiItem.setQuantity(2);
        multiItem.setLaborCost(new BigDecimal("50.00"));

        Material mat = new Material();
        mat.setId(UUID.randomUUID());
        mat.setSalePrice(new BigDecimal("100.00"));

        BudgetItemOption opt = new BudgetItemOption();
        opt.setMaterial(mat);
        opt.setQuantity(new BigDecimal("1.00"));
        multiItem.addOption(opt);
        multiQtyBudget.addItem(multiItem);

        when(materialRepository.findById(mat.getId())).thenReturn(Optional.of(mat));

        // Act
        budgetPricingService.calculatePricing(multiQtyBudget);

        // Assert
        assertEquals(new BigDecimal("200.00"), multiItem.getSubtotal());
        assertEquals(new BigDecimal("250.00"), multiQtyBudget.getSubtotal());
        assertEquals(new BigDecimal("250.00"), multiQtyBudget.getTotal());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve lançar IllegalArgumentException se o desconto for maior que 100%")
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
    @DisplayName("[Tratamento de Exceção] Deve lançar ResourceNotFoundException se o material não for encontrado no repositório")
    void calculatePricing_ThrowsException_WhenMaterialNotFound() {
        // Arrange
        when(materialRepository.findById(material1.getId())).thenReturn(Optional.empty()); // Banco de dados não achou

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            budgetPricingService.calculatePricing(budget);
        });

        assertTrue(exception.getMessage().contains("Material não encontrado"));
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve precificar esquadria sem ferragem (#335)")
    void calculatePricing_Success_WithoutHardware() {
        Budget b = new Budget();
        BudgetItem esquadria = new BudgetItem();
        esquadria.setLaborCost(new BigDecimal("200.00"));

        // Apenas Vidro (material1) e Perfil (material2), sem nenhuma opção de ferragem
        BudgetItemOption vidro = new BudgetItemOption();
        vidro.setMaterial(material1);
        vidro.setQuantity(new BigDecimal("3.00")); // 3 * 50 = 150

        BudgetItemOption perfil = new BudgetItemOption();
        perfil.setMaterial(material2);
        perfil.setQuantity(new BigDecimal("5.00")); // 5 * 10.50 = 52.50

        esquadria.addOption(vidro);
        esquadria.addOption(perfil);
        b.addItem(esquadria);

        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));

        budgetPricingService.calculatePricing(b);

        assertEquals(new BigDecimal("202.50"), esquadria.getSubtotal());
        assertEquals(new BigDecimal("402.50"), b.getSubtotal());
        assertEquals(new BigDecimal("402.50"), b.getTotal());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve aceitar ferragem com quantidade zero (#335)")
    void calculatePricing_Success_WithZeroQuantityHardware() {
        Budget b = new Budget();
        BudgetItem esquadria = new BudgetItem();
        esquadria.setLaborCost(new BigDecimal("100.00"));

        // Vidro com valor normal
        BudgetItemOption vidro = new BudgetItemOption();
        vidro.setMaterial(material1);
        vidro.setQuantity(new BigDecimal("2.00")); // 2 * 50 = 100

        // Ferragem com quantidade zero
        BudgetItemOption ferragemZero = new BudgetItemOption();
        ferragemZero.setMaterial(material2);
        ferragemZero.setQuantity(BigDecimal.ZERO); // 0 * 10.50 = 0

        esquadria.addOption(vidro);
        esquadria.addOption(ferragemZero);
        b.addItem(esquadria);

        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));

        budgetPricingService.calculatePricing(b);

        assertEquals(new BigDecimal("0.00"), ferragemZero.getTotalPrice());
        assertEquals(new BigDecimal("100.00"), esquadria.getSubtotal());
        assertEquals(new BigDecimal("200.00"), b.getSubtotal());
        assertEquals(new BigDecimal("200.00"), b.getTotal());
    }

    // =========================================================================
    // REGRESSÃO #372 (BUG-023): laborCost é o valor fixo da linha do orçamento
    // (rateio da MO geral feito pelo BudgetEditor) e NÃO é multiplicado pela
    // quantidade de esquadrias — mesma regra do BudgetPdfService e do BudgetDetailPage.
    // =========================================================================

    @ParameterizedTest(name = "quantidade = {0}")
    @ValueSource(ints = {1, 2, 5})
    @DisplayName("[Regressão #372] Mão de obra da linha deve ser somada uma única vez, independentemente da quantidade")
    void calculatePricing_ShouldAddLaborCostOncePerLine_RegardlessOfQuantity(int quantity) {
        Budget b = new Budget();
        BudgetItem esquadria = criarItemComMaterial(material1, quantity, new BigDecimal("150.00"));
        b.addItem(esquadria);

        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));

        budgetPricingService.calculatePricing(b);

        BigDecimal materiaisEsperados = new BigDecimal("50.00").multiply(BigDecimal.valueOf(quantity));
        assertEquals(materiaisEsperados, esquadria.getSubtotal(),
                "O subtotal do item deve conter apenas materiais × quantidade");
        assertEquals(materiaisEsperados.add(new BigDecimal("150.00")), b.getSubtotal(),
                "A mão de obra (R$ 150) deve entrar uma única vez no subtotal bruto");
        assertEquals(0, new BigDecimal("150.00").compareTo(b.getSubtotal().subtract(esquadria.getSubtotal())),
                "A parcela de mão de obra do orçamento deve ser R$ 150, sem multiplicar pela quantidade");
    }

    @Test
    @DisplayName("[Regressão #372] laborCost nulo deve ser tratado como zero sem lançar exceção")
    void calculatePricing_ShouldTreatNullLaborCostAsZero() {
        Budget b = new Budget();
        BudgetItem esquadria = criarItemComMaterial(material1, 3, null);
        b.addItem(esquadria);

        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));

        assertDoesNotThrow(() -> budgetPricingService.calculatePricing(b));

        assertEquals(new BigDecimal("150.00"), esquadria.getSubtotal());
        assertEquals(new BigDecimal("150.00"), b.getSubtotal());
        assertEquals(new BigDecimal("150.00"), b.getTotal());
    }

    @Test
    @DisplayName("[Regressão #372] Múltiplos itens: mão de obra total deve ser a soma dos laborCost das linhas")
    void calculatePricing_ShouldSumLaborCostPerLine_WithMultipleItems() {
        // Item A: 2 esquadrias, MO da linha R$ 150 | Item B: 3 esquadrias, MO da linha R$ 100
        Budget b = new Budget();
        BudgetItem itemA = criarItemComMaterial(material1, 2, new BigDecimal("150.00")); // 2 × 50 = 100
        BudgetItem itemB = criarItemComMaterial(material2, 3, new BigDecimal("100.00")); // 3 × 10.50 = 31.50
        b.addItem(itemA);
        b.addItem(itemB);

        when(materialRepository.findById(material1.getId())).thenReturn(Optional.of(material1));
        when(materialRepository.findById(material2.getId())).thenReturn(Optional.of(material2));

        budgetPricingService.calculatePricing(b);

        assertEquals(new BigDecimal("100.00"), itemA.getSubtotal());
        assertEquals(new BigDecimal("31.50"), itemB.getSubtotal());

        BigDecimal totalMaoDeObra = b.getSubtotal().subtract(itemA.getSubtotal()).subtract(itemB.getSubtotal());
        assertEquals(0, new BigDecimal("250.00").compareTo(totalMaoDeObra),
                "Mão de obra total deve ser 150 + 100 = 250 (e não 2×150 + 3×100 = 600)");
        assertEquals(new BigDecimal("381.50"), b.getSubtotal());
        assertEquals(new BigDecimal("381.50"), b.getTotal());
    }

    private BudgetItem criarItemComMaterial(Material material, int quantity, BigDecimal laborCost) {
        BudgetItem esquadria = new BudgetItem();
        esquadria.setQuantity(quantity);
        esquadria.setLaborCost(laborCost);

        BudgetItemOption opt = new BudgetItemOption();
        opt.setMaterial(material);
        opt.setQuantity(new BigDecimal("1.00"));
        esquadria.addOption(opt);
        return esquadria;
    }
}

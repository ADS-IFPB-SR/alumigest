package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.calculator.GlassQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.MaterialCalculatorFactory;
import br.edu.ifpb.alumigest.budgets.calculator.ProfileQuantityCalculator;
import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO;
import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BudgetQuantityService - Testes de Cálculo de Quantidades [Joseph Nichollas]")
class BudgetQuantityServiceTest {

    private BudgetQuantityService budgetQuantityService;
    private MaterialCalculatorFactory calculatorFactory;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        GlassQuantityCalculator glassCalculator = new GlassQuantityCalculator();
        ProfileQuantityCalculator profileCalculator = new ProfileQuantityCalculator();

        calculatorFactory = new MaterialCalculatorFactory(List.of(glassCalculator, profileCalculator));

        budgetQuantityService = new BudgetQuantityService(calculatorFactory, materialRepository, productRepository);
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

    @Test
    @DisplayName("Deve calcular 11.80m de perfil para porta de giro 2 folhas (1600x2150)")
    void previewCalculation_ShouldCalculateProfilesForSwingDoor2F_With11Point80M() {
        UUID profileId = UUID.randomUUID();
        BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                "SWING_DOOR_2F",
                new BigDecimal("1600"), // 1.60m
                new BigDecimal("2150"), // 2.15m
                1,
                List.of(
                        new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                profileId, "PROFILE", null
                        )
                )
        );

        BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

        assertNotNull(response);
        assertFalse(response.options().isEmpty());
        var profileResult = response.options().getFirst();
        // 2W + 4H = 2 * 1.60 + 4 * 2.15 = 3.20 + 8.60 = 11.80m
        assertEquals(new BigDecimal("11.80"), profileResult.suggestedQuantity());
        assertEquals(new BigDecimal("11.80"), profileResult.physicalMinimumQuantity());
        assertFalse(profileResult.isBelowPhysicalMinimum());
    }

    // =========================================================================
    // CASOS COMPLEMENTARES DE COBERTURA E VALIDAÇÕES FÍSICAS [Joseph Nichollas]
    // =========================================================================

    @Nested
    @DisplayName("Casos Complementares de Cobertura e Validações Físicas [Joseph Nichollas]")
    class CasosComplementaresJosephTest {

        @Test
        @DisplayName("Deve emitir warning quando metragem de perfil for inferior ao mínimo físico")
        void previewCalculation_DeveEmitirWarningParaPerfilAbaixoDoMinimo() {
            UUID profileId = UUID.randomUUID();
            BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                    "SWING_DOOR_2F",
                    new BigDecimal("1600"),
                    new BigDecimal("2150"),
                    1,
                    List.of(
                            new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                    profileId, "PROFILE", new BigDecimal("5.00") // 5.00m < 11.80m
                            )
                    )
            );

            BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

            assertNotNull(response);
            var profileResult = response.options().getFirst();
            assertTrue(profileResult.isBelowPhysicalMinimum());
            assertNotNull(profileResult.warningMessage());
            assertTrue(profileResult.warningMessage().contains("A metragem de perfil inserida"));
            assertTrue(profileResult.warningMessage().contains("Risco de barra insuficiente!"));
        }

        @Test
        @DisplayName("Deve lidar com categoria desconhecida ou nula sem falhar")
        void previewCalculation_ComCategoriaDesconhecidaOuNula() {
            UUID matId = UUID.randomUUID();
            BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                    "SLIDING_DOOR_2F",
                    new BigDecimal("1000"),
                    new BigDecimal("1000"),
                    1,
                    List.of(
                            new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                    matId, "INEXISTENTE", new BigDecimal("3.00")
                            )
                    )
            );

            BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

            assertNotNull(response);
            var optResult = response.options().getFirst();
            assertEquals(BigDecimal.ZERO, optResult.suggestedQuantity());
            assertEquals(BigDecimal.ZERO, optResult.physicalMinimumQuantity());
            assertFalse(optResult.isBelowPhysicalMinimum());
        }

        @Test
        @DisplayName("calculateQuantities: Retorna sem erros quando orçamento não possui itens")
        void calculateQuantities_DeveRetornarSemErrosQuandoBudgetNaoTemItens() {
            Budget budget = new Budget();
            budget.setItems(null);

            assertDoesNotThrow(() -> budgetQuantityService.calculateQuantities(budget));
        }

        @Test
        @DisplayName("calculateQuantities: Processa item e calcula quantidades das opções com sucesso")
        void calculateQuantities_DeveCalcularItensComSucesso() {
            UUID productId = UUID.randomUUID();
            Product product = new Product();
            product.setId(productId);
            product.setName("Janela de Correr 2 Folhas");
            product.setTemplateType(DoorTemplateType.SLIDING_DOOR_2F);

            UUID matId = UUID.randomUUID();
            Material material = new Material();
            material.setId(matId);
            material.setName("Vidro Temperado Incolor 8mm");
            material.setUnitMeasure(UnitMeasure.M2);

            BudgetItemOption option = new BudgetItemOption();
            option.setMaterial(material);
            option.setCategoryType(MaterialCategoryType.GLASS);
            option.setQuantity(null);

            BudgetItem item = new BudgetItem();
            item.setProduct(product);
            item.setTemplateType("SLIDING_DOOR_2F");
            item.setWidthMm(new BigDecimal("1200.00"));
            item.setHeightMm(new BigDecimal("1000.00"));
            item.setQuantity(1);
            item.setOptions(new ArrayList<>(List.of(option)));

            Budget budget = new Budget();
            budget.setItems(new ArrayList<>(List.of(item)));

            when(productRepository.findById(productId)).thenReturn(Optional.of(product));
            when(materialRepository.findById(matId)).thenReturn(Optional.of(material));

            budgetQuantityService.calculateQuantities(budget);

            assertEquals("Janela de Correr 2 Folhas", item.getProductName());
            assertEquals("Vidro Temperado Incolor 8mm", option.getMaterialName());
            assertEquals("M2", option.getUnitMeasure());
            assertNotNull(option.getQuantity());
            assertTrue(option.getQuantity().compareTo(BigDecimal.ZERO) > 0);
        }

        @Test
        @DisplayName("calculateQuantities: Lança ResourceNotFoundException se produto não for encontrado")
        void calculateQuantities_DeveLancarExcecaoQuandoProdutoNaoExiste() {
            UUID productId = UUID.randomUUID();
            Product product = new Product();
            product.setId(productId);

            BudgetItem item = new BudgetItem();
            item.setProduct(product);

            Budget budget = new Budget();
            budget.setItems(new ArrayList<>(List.of(item)));

            when(productRepository.findById(productId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> budgetQuantityService.calculateQuantities(budget));
        }

        @Test
        @DisplayName("calculateQuantities: Lança ResourceNotFoundException se material não for encontrado")
        void calculateQuantities_DeveLancarExcecaoQuandoMaterialNaoExiste() {
            UUID productId = UUID.randomUUID();
            Product product = new Product();
            product.setId(productId);
            product.setName("Janela Teste");

            UUID matId = UUID.randomUUID();
            Material material = new Material();
            material.setId(matId);

            BudgetItemOption option = new BudgetItemOption();
            option.setMaterial(material);

            BudgetItem item = new BudgetItem();
            item.setProduct(product);
            item.setOptions(new ArrayList<>(List.of(option)));

            Budget budget = new Budget();
            budget.setItems(new ArrayList<>(List.of(item)));

            when(productRepository.findById(productId)).thenReturn(Optional.of(product));
            when(materialRepository.findById(matId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> budgetQuantityService.calculateQuantities(budget));
        }

        @Test
        @DisplayName("calculateQuantities: Usa templateType do produto quando o item tiver templateType nulo")
        void calculateQuantities_UsaTemplateTypeDoProdutoQuandoItemNulo() {
            UUID productId = UUID.randomUUID();
            Product product = new Product();
            product.setId(productId);
            product.setName("Janela Produto");
            product.setTemplateType(DoorTemplateType.SLIDING_DOOR_2F);

            UUID matId = UUID.randomUUID();
            Material material = new Material();
            material.setId(matId);
            material.setName("Perfil Alumínio");
            material.setUnitMeasure(UnitMeasure.METRO);

            BudgetItemOption option = new BudgetItemOption();
            option.setMaterial(material);
            option.setCategoryType(MaterialCategoryType.PROFILE);

            BudgetItem item = new BudgetItem();
            item.setProduct(product);
            item.setTemplateType("   "); // em branco, força fallback para o templateType do produto
            item.setWidthMm(new BigDecimal("1000.00"));
            item.setHeightMm(new BigDecimal("1000.00"));
            item.setQuantity(1);
            item.setOptions(new ArrayList<>(List.of(option)));

            Budget budget = new Budget();
            budget.setItems(new ArrayList<>(List.of(item)));

            when(productRepository.findById(productId)).thenReturn(Optional.of(product));
            when(materialRepository.findById(matId)).thenReturn(Optional.of(material));

            budgetQuantityService.calculateQuantities(budget);

            assertEquals("SLIDING_DOOR_2F", item.getTemplateType());
            assertNotNull(option.getQuantity());
        }

        @Test
        @DisplayName("previewCalculation: Cobertura de opções nulas e quantidade padrão 1")
        void previewCalculation_ComOpcoesNulasEQuantidadeNula() {
            BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                    "SLIDING_DOOR_2F",
                    new BigDecimal("1500"),
                    new BigDecimal("1200"),
                    null, // quantidade nula deve assumir 1
                    null  // opções nulas
            );

            BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

            assertNotNull(response);
            assertEquals(1.80, response.physicalAreaM2().doubleValue(), 0.01);
            assertTrue(response.options().isEmpty());
        }

        @Test
        @DisplayName("previewCalculation: Cobertura de FILM, COMPONENT genérico e alerta padrão")
        void previewCalculation_ComFilmEComponenteGenerico() {
            UUID matFilm = UUID.randomUUID();
            UUID matComp = UUID.randomUUID();

            BudgetItemCalculationRequestDTO request = new BudgetItemCalculationRequestDTO(
                    "SLIDING_DOOR_2F",
                    new BigDecimal("1000"),
                    new BigDecimal("1000"),
                    2,
                    List.of(
                            new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                    matFilm, "FILM", new BigDecimal("0.50") // abaixo da área física total de 2.00 m²
                            ),
                            new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                                    matComp, "HARDWARE", new BigDecimal("0.50") // abaixo do mínimo de 2 unidades
                            )
                    )
            );

            BudgetItemCalculationResponseDTO response = budgetQuantityService.previewCalculation(request);

            assertNotNull(response);
            assertEquals(2, response.options().size());

            var filmResult = response.options().getFirst();
            assertTrue(filmResult.isBelowPhysicalMinimum());

            var compResult = response.options().get(1);
            assertTrue(compResult.isBelowPhysicalMinimum());
            assertNotNull(compResult.warningMessage());
            assertTrue(compResult.warningMessage().contains("inferior ao mínimo físico necessário"));
        }

        @Test
        @DisplayName("calculateQuantities: Lida com template nulo e categoryType nulo")
        void calculateQuantities_ComTemplateNuloECategoryNula() {
            UUID productId = UUID.randomUUID();
            Product product = new Product();
            product.setId(productId);
            product.setName("Produto Sem Template");
            product.setTemplateType(null);

            UUID matId = UUID.randomUUID();
            Material material = new Material();
            material.setId(matId);

            BudgetItemOption option = new BudgetItemOption();
            option.setMaterial(material);
            option.setCategoryType(null);
            option.setQuantity(new BigDecimal("10.00"));

            BudgetItem item = new BudgetItem();
            item.setProduct(product);
            item.setTemplateType(null);
            item.setOptions(new ArrayList<>(List.of(option)));

            Budget budget = new Budget();
            budget.setItems(new ArrayList<>(List.of(item)));

            when(productRepository.findById(productId)).thenReturn(Optional.of(product));
            when(materialRepository.findById(matId)).thenReturn(Optional.of(material));

            budgetQuantityService.calculateQuantities(budget);

            assertEquals(new BigDecimal("10.00"), option.getQuantity());
        }
    }
}

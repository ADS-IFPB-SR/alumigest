package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemOptionRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BudgetIntegrationTest {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    @Autowired
    private br.edu.ifpb.alumigest.catalog.repository.ProductRepository productRepository;

    @Autowired
    private br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository productCategoryRepository;

    private Client savedClient;
    private br.edu.ifpb.alumigest.catalog.domain.Product savedProduct;
    private Material savedGlass;
    private Material savedProfile;

    @BeforeEach
    void setUp() {
        Client client = new Client();
        client.setFullName("Integration Test Client");
        client.setDocumentNumber("12345678901");
        client.setEmail("test@test.com");
        client.setPhone("83999999999");
        savedClient = clientRepository.save(client);

        br.edu.ifpb.alumigest.catalog.domain.ProductCategory productCategory = new br.edu.ifpb.alumigest.catalog.domain.ProductCategory();
        productCategory.setName("Janelas");
        productCategory = productCategoryRepository.save(productCategory);

        br.edu.ifpb.alumigest.catalog.domain.Product product = new br.edu.ifpb.alumigest.catalog.domain.Product();
        product.setName("Janela Correr 2 Folhas");
        product.setCategory(productCategory);
        product.setLaborCost(new BigDecimal("150.00"));
        savedProduct = productRepository.save(product);

        MaterialGroup glassGroup = new MaterialGroup();
        glassGroup.setCode("GRP-VID");
        glassGroup.setName("Vidros");
        glassGroup.setCalculationType(CalculationType.SQUARE_METER);
        glassGroup = materialGroupRepository.save(glassGroup);

        Material glass = new Material();
        glass.setName("Vidro Temperado Incolor 8mm");
        glass.setGroup(glassGroup);
        glass.setUnitMeasure(UnitMeasure.M2);
        glass.setSalePrice(new BigDecimal("200.00")); // R$ 200 por m2
        savedGlass = materialRepository.save(glass);

        MaterialGroup profileGroup = new MaterialGroup();
        profileGroup.setCode("GRP-PERF");
        profileGroup.setName("Perfis");
        profileGroup.setCalculationType(CalculationType.LINEAR_METER);
        profileGroup = materialGroupRepository.save(profileGroup);

        Material profile = new Material();
        profile.setName("Perfil Alumínio Branco");
        profile.setGroup(profileGroup);
        profile.setUnitMeasure(UnitMeasure.METRO);
        profile.setSalePrice(new BigDecimal("50.00")); // R$ 50 por metro
        savedProfile = materialRepository.save(profile);
    }

    @Test
    void testEndToEnd_BudgetCreation_WithAutoQuantitiesAndPricing() {
        // Arrange
        // Opção 1: Vidro (Sem enviar quantidade)
        BudgetItemOptionRequestDTO glassOption = new BudgetItemOptionRequestDTO(
                savedGlass.getId(),
                MaterialCategoryType.GLASS,
                null, // A MÁGICA DA 6.3: O Backend calcula!
                "Temperado",
                "Incolor"
        );

        // Opção 2: Perfil (Sem enviar quantidade)
        BudgetItemOptionRequestDTO profileOption = new BudgetItemOptionRequestDTO(
                savedProfile.getId(),
                MaterialCategoryType.PROFILE,
                null,
                "Liso",
                "Branco"
        );

        // Item de Orçamento (Janela 2.0m x 1.5m = 3.0m2)
        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(
                savedProduct.getId(), // productId (agora salvo no DB)
                new BigDecimal("2000.00"), // 2000 mm = 2.0 m
                new BigDecimal("1500.00"), // 1500 mm = 1.5 m
                1,
                new BigDecimal("150.00"), // laborCost
                "SLIDING_2_LEAF",
                null, null, null, null,
                List.of(glassOption, profileOption)
        );

        BudgetRequestDTO request = new BudgetRequestDTO(
                savedClient.getId(),
                new BigDecimal("10.00"), // 10% discount
                "Teste de Integração E2E",
                List.of(itemRequest)
        );

        // Act
        BudgetResponseDTO response = budgetService.create(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(BudgetStatus.DRAFT);
        
        // Verifica cálculo do Vidro (Area = 2.0 * 1.5 = 3.0 m2)
        // O GlassQuantityCalculator deve ter feito: 3.00
        var savedGlassOption = response.items().get(0).options().stream()
                .filter(o -> o.materialId().equals(savedGlass.getId()))
                .findFirst().orElseThrow();
                
        assertThat(savedGlassOption.quantity()).isEqualByComparingTo("3.00");
        assertThat(savedGlassOption.unitPrice()).isEqualByComparingTo("200.00");
        assertThat(savedGlassOption.totalPrice()).isEqualByComparingTo("600.00"); // 3 * 200

        // Verifica cálculo do Perfil (Perímetro Sliding 2 Leaf = 4W + 6H = 4*2 + 6*1.5 = 8 + 9 = 17m)
        var savedProfileOption = response.items().get(0).options().stream()
                .filter(o -> o.materialId().equals(savedProfile.getId()))
                .findFirst().orElseThrow();

        assertThat(savedProfileOption.quantity()).isEqualByComparingTo("17.00");
        assertThat(savedProfileOption.unitPrice()).isEqualByComparingTo("50.00");
        assertThat(savedProfileOption.totalPrice()).isEqualByComparingTo("850.00"); // 17 * 50

        // Verifica Subtotal e Total do Orçamento
        // Material Total: 600 + 850 = 1450
        // Labor Cost: 150
        // Subtotal = 1600.00
        assertThat(response.subtotal()).isEqualByComparingTo("1600.00");
        
        // Desconto 10% de 1600 = 160
        assertThat(response.discountValue()).isEqualByComparingTo("160.00");
        
        // Total = 1600 - 160 = 1440
        assertThat(response.total()).isEqualByComparingTo("1440.00");
    }
}

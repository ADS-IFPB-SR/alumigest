package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetCreateRequest;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.catalog.domain.Material;
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

        br.edu.ifpb.alumigest.catalog.domain.Product product = new br.edu.ifpb.alumigest.catalog.domain.Product();
        product.setName("Janela Correr 2 Folhas");
        product.setTemplateType(br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType.SLIDING_DOOR_2F);
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
        glass.setSalePrice(new BigDecimal("200.00"));
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
        profile.setSalePrice(new BigDecimal("50.00"));
        savedProfile = materialRepository.save(profile);
    }

    @Test
    void testEndToEnd_BudgetCreation_WithAutoQuantitiesAndPricing() {
        // Arrange
        BudgetCreateRequest request = new BudgetCreateRequest(
                savedClient.getId(),
                "Teste de Integração E2E"
        );

        // Act
        BudgetResponseDTO response = budgetService.create(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(BudgetStatus.DRAFT);
        assertThat(response.clientId()).isEqualTo(savedClient.getId());
        assertThat(response.notes()).isEqualTo("Teste de Integração E2E");
    }
}
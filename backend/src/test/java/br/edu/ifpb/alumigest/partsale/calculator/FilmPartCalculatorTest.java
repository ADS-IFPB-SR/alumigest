package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class FilmPartCalculatorTest {

    private FilmPartCalculator calculator;
    private Material mockMaterial;
    private UUID materialId;

    @BeforeEach
    void setUp() {
        calculator = new FilmPartCalculator();
        materialId = UUID.randomUUID();
        
        mockMaterial = new Material();
        mockMaterial.setId(materialId);
        mockMaterial.setSalePrice(new BigDecimal("50.00")); // R$ 50 por m²
    }

    @Test
    @DisplayName("Deve faturar a área total com acréscimo do fator de perda da bobina")
    void shouldBillAreaWithLossFactorApplied() {
        // Dado um corte de 1000x1000 (1.00m²) e 15% de perda passado no Request
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                materialId, PartMaterialType.FILM, 1000, 1000, 1, new BigDecimal("0.15")
        );

        // Quando
        CalculatePartItemResponseDTO response = calculator.calculate(request, mockMaterial);

        // Então a área faturável tem que ter +15%
        assertThat(response.netArea()).isEqualByComparingTo("1.0000");
        assertThat(response.billableArea()).isEqualByComparingTo("1.1500");
        assertThat(response.totalPrice()).isEqualByComparingTo("57.50"); // 1.15 * 50
    }
}
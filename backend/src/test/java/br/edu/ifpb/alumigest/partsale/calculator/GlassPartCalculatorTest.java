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

class GlassPartCalculatorTest {

    private GlassPartCalculator calculator;
    private Material mockMaterial;
    private UUID materialId;

    @BeforeEach
    void setUp() {
        calculator = new GlassPartCalculator();
        materialId = UUID.randomUUID();
        
        mockMaterial = new Material();
        mockMaterial.setId(materialId);
        mockMaterial.setSalePrice(new BigDecimal("100.00")); // R$ 100 por m²
    }

    @Test
    @DisplayName("Deve aplicar a área mínima de faturamento (0.25m²) quando a área da peça for inferior")
    void shouldApplyMinimumBillableAreaWhenPieceIsTooSmall() {
        // Dado uma peça de 300x400 = 0.12m²
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                materialId, PartMaterialType.GLASS, 300, 400, 1, null
        );

        // Quando
        CalculatePartItemResponseDTO response = calculator.calculate(request, mockMaterial);

        // Então a área cobrada sobe para 0.25 e o preço é proporcional aos 0.25m²
        assertThat(response.netArea()).isEqualByComparingTo("0.1200");
        assertThat(response.billableArea()).isEqualByComparingTo("0.2500");
        assertThat(response.totalPrice()).isEqualByComparingTo("25.00");
    }

    @Test
    @DisplayName("Deve faturar a área exata quando a área da peça for maior que o mínimo")
    void shouldBillExactAreaWhenPieceIsLargerThanMinimum() {
        // Dado uma peça de 1000x2000 = 2.00m²
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                materialId, PartMaterialType.GLASS, 1000, 2000, 1, null
        );

        // Quando
        CalculatePartItemResponseDTO response = calculator.calculate(request, mockMaterial);

        // Então a área faturável é igual a área líquida
        assertThat(response.netArea()).isEqualByComparingTo("2.0000");
        assertThat(response.billableArea()).isEqualByComparingTo("2.0000");
        assertThat(response.totalPrice()).isEqualByComparingTo("200.00");
    }
}
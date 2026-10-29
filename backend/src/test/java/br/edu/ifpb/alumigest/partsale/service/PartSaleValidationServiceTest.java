package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PartSaleValidationServiceTest {

    private PartSaleValidationService validationService;
    private Material catalogMaterial;

    @BeforeEach
    void setUp() {
        validationService = new PartSaleValidationService();
        
        catalogMaterial = new Material();
        catalogMaterial.setId(UUID.randomUUID());
        catalogMaterial.setMaxWidthMm(new BigDecimal("3210.00"));  // Chapa jumbo: 3210mm
        catalogMaterial.setMaxHeightMm(new BigDecimal("6000.00")); // Chapa jumbo: 6000mm
    }

    @Test
    @DisplayName("Não deve lançar erro se as dimensões solicitadas couberem na chapa de fábrica")
    void shouldNotThrowExceptionIfDimensionsAreValid() {
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                catalogMaterial.getId(), PartMaterialType.GLASS, 1500, 2000, 1, null
        );

        assertThatCode(() -> validationService.validatePhysicalLimits(request, catalogMaterial))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Deve lançar BusinessException se a largura for maior que a capacidade da chapa")
    void shouldThrowBusinessExceptionIfWidthIsExceeded() {
        // Largura 3500mm (estoura os 3210mm)
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                catalogMaterial.getId(), PartMaterialType.GLASS, 3500, 2000, 1, null
        );

        assertThatThrownBy(() -> validationService.validatePhysicalLimits(request, catalogMaterial))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("excede o limite máximo");
    }

    @Test
    @DisplayName("Deve lançar BusinessException se a altura for maior que a capacidade da chapa")
    void shouldThrowBusinessExceptionIfHeightIsExceeded() {
        // Altura 6500mm (estoura os 6000mm)
        CalculatePartItemRequestDTO request = new CalculatePartItemRequestDTO(
                catalogMaterial.getId(), PartMaterialType.GLASS, 1000, 6500, 1, null
        );

        assertThatThrownBy(() -> validationService.validatePhysicalLimits(request, catalogMaterial))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("excede o limite máximo");
    }
}
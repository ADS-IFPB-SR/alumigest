package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlassServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialGroupRepository groupRepository;

    @InjectMocks
    private GlassService glassService;

    private GlassCreateDTO validDto;
    private MaterialGroup glassGroup;

    @BeforeEach
    void setUp() {
        // Preparando DTO de sucesso simulando a criação de um vidro comum
        validDto = new GlassCreateDTO(
                "Vidro Temperado Incolor 4mm",
                "Incolor",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00")
        );

        // Preparando Entidade base do Grupo de Vidros
        glassGroup = new MaterialGroup();
        glassGroup.setId(UUID.randomUUID());
        glassGroup.setCode("VIDRO");
        glassGroup.setName("Vidros Planos");
    }

    @Test
    @DisplayName("Deve criar um vidro com sucesso e retornar o DTO")
    void shouldCreateGlassSuccessfully() {
        // Arrange
        when(groupRepository.findByCodeIgnoreCase("VIDRO")).thenReturn(Optional.of(glassGroup));

        Material savedMaterial = new Material();
        savedMaterial.setId(UUID.randomUUID());
        savedMaterial.setGroup(glassGroup);
        savedMaterial.setName(validDto.name());
        savedMaterial.setColorFinish(validDto.colorFinish());
        savedMaterial.setThicknessMm(validDto.thicknessMm());
        savedMaterial.setCostPrice(validDto.costPrice());
        savedMaterial.setSalePrice(validDto.salePrice());
        savedMaterial.setUnitMeasure(UnitMeasure.M2);
        savedMaterial.setActive(true);

        when(materialRepository.save(any(Material.class))).thenReturn(savedMaterial);

        // Act
        GlassResponseDTO response = glassService.create(validDto);

        // Assert
        assertNotNull(response);
        assertEquals(savedMaterial.getId(), response.id());
        assertEquals(validDto.name(), response.name());
        assertEquals(validDto.thicknessMm(), response.thicknessMm());
        assertTrue(response.isActive());
        assertEquals(UnitMeasure.M2.name(), response.unitMeasure());

        // Verifica se os métodos foram realmente chamados
        verify(groupRepository, times(1)).findByCodeIgnoreCase("VIDRO");

        ArgumentCaptor<Material> materialCaptor = ArgumentCaptor.forClass(Material.class);
        verify(materialRepository, times(1)).save(materialCaptor.capture());

        // Assegura que o mapeamento interno antes de salvar ocorreu da maneira correta
        Material capturedMaterial = materialCaptor.getValue();
        assertEquals(UnitMeasure.M2, capturedMaterial.getUnitMeasure());
        assertTrue(capturedMaterial.isActive());
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException quando a espessura for inválida")
    void shouldThrowExceptionWhenThicknessIsInvalid() {
        // Arrange
        GlassCreateDTO invalidThicknessDto = new GlassCreateDTO(
                "Vidro Fora do Padrão",
                "Fumê",
                new BigDecimal("5"), // Espessura não permitida (5mm)
                new BigDecimal("50.00"),
                new BigDecimal("100.00")
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            glassService.create(invalidThicknessDto);
        });

        assertEquals("Espessura inválida. Permitido apenas: 2mm, 4mm, 6mm, 8mm, 10mm.", exception.getMessage());

        // Verifica que os repositórios sequer foram tocados devido à falha rápida (fail-fast)
        verifyNoInteractions(groupRepository, materialRepository);
    }

    @Test
    @DisplayName("Deve lançar IllegalStateException quando o grupo de vidros não existir")
    void shouldThrowExceptionWhenGlassGroupNotFound() {
        // Arrange
        when(groupRepository.findByCodeIgnoreCase("VIDRO")).thenReturn(Optional.empty());

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            glassService.create(validDto);
        });

        assertEquals("Grupo de materiais 'VIDRO' não configurado no sistema.", exception.getMessage());

        // Garante que o material não foi salvo
        verify(materialRepository, never()).save(any(Material.class));
    }
}
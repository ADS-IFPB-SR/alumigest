package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GlassService — Testes Unitários de Serviço de Vidros")
class GlassServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialGroupRepository groupRepository;

    @InjectMocks
    private GlassService glassService;

    private GlassCreateDTO validDto;
    private MaterialGroup glassGroup;
    private Material sampleGlass;
    private static final UUID GLASS_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        validDto = new GlassCreateDTO(
                "Vidro Temperado Incolor 4mm",
                "Incolor",
                "70071900",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00"),
                new BigDecimal("2000"),
                new BigDecimal("3000")
        );

        glassGroup = new MaterialGroup();
        glassGroup.setId(UUID.randomUUID());
        glassGroup.setCode("VIDRO");
        glassGroup.setName("Vidros Planos");

        sampleGlass = new Material();
        sampleGlass.setId(GLASS_ID);
        sampleGlass.setGroup(glassGroup);
        sampleGlass.setName("Vidro Temperado Incolor 4mm");
        sampleGlass.setColorFinish("Incolor");
        sampleGlass.setThicknessMm(new BigDecimal("4"));
        sampleGlass.setCostPrice(new BigDecimal("80.00"));
        sampleGlass.setSalePrice(new BigDecimal("150.00"));
        sampleGlass.setUnitMeasure(UnitMeasure.M2);
        sampleGlass.setActive(true);
        sampleGlass.setFamilyCode("FAM-VIDRO");
    }

    @Nested
    @DisplayName("Criação de Vidro (create)")
    class CreateTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Sucesso] Deve criar vidro com sucesso e retornar DTO")
        void shouldCreateGlassSuccessfully() {
            when(groupRepository.findByCodeIgnoreCase("VIDRO")).thenReturn(Optional.of(glassGroup));
            when(materialRepository.save(any(Material.class))).thenReturn(sampleGlass);

            GlassResponseDTO response = glassService.create(validDto);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(GLASS_ID);
            assertThat(response.name()).isEqualTo(validDto.name());
            assertThat(response.thicknessMm()).isEqualTo(validDto.thicknessMm());
            assertThat(response.active()).isTrue();
            assertThat(response.unitMeasure()).isEqualTo(UnitMeasure.M2.name());

            ArgumentCaptor<Material> captor = ArgumentCaptor.forClass(Material.class);
            verify(materialRepository).save(captor.capture());
            assertThat(captor.getValue().getUnitMeasure()).isEqualTo(UnitMeasure.M2);
            assertThat(captor.getValue().isActive()).isTrue();
        }

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Espessura Inválida (3mm, 5mm, 12mm)] Deve lançar IllegalArgumentException")
        void shouldThrowExceptionWhenThicknessIsInvalid() {
            GlassCreateDTO invalidDto = new GlassCreateDTO(
                    "Vidro 5mm Inválido",
                    "Fumê",
                    "70071900",
                    new BigDecimal("5"), // BVA: 5mm não é permitido
                    new BigDecimal("50.00"),
                    new BigDecimal("100.00"),
                    new BigDecimal("2000"),
                    new BigDecimal("3000")
            );

            assertThatThrownBy(() -> glassService.create(invalidDto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Espessura inválida. Permitido apenas: 2mm, 4mm, 6mm, 8mm, 10mm.");

            verifyNoInteractions(groupRepository, materialRepository);
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - Grupo Inexistente] Deve lançar IllegalStateException quando grupo VIDRO não existir")
        void shouldThrowExceptionWhenGlassGroupNotFound() {
            when(groupRepository.findByCodeIgnoreCase("VIDRO")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> glassService.create(validDto))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Grupo de materiais 'VIDRO' não configurado no sistema.");

            verify(materialRepository, never()).save(any(Material.class));
        }
    }

    @Nested
    @DisplayName("Listagem de Vidros (findAllGlasses)")
    class FindAllTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Busca Paginada com Filtros] Deve mapear resultados para DTOs")
        void shouldFindAllGlassesWithFilters() {
            when(groupRepository.findByCodeIgnoreCase("VIDRO")).thenReturn(Optional.of(glassGroup));
            Pageable pageable = PageRequest.of(0, 10);
            when(materialRepository.findAllByGroupWithFilters(glassGroup.getId(), new BigDecimal("4"), "Incolor", pageable))
                    .thenReturn(new PageImpl<>(List.of(sampleGlass), pageable, 1));

            Page<GlassResponseDTO> result = glassService.findAllGlasses(new BigDecimal("4"), "Incolor", pageable);

            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).name()).isEqualTo("Vidro Temperado Incolor 4mm");
        }
    }

    @Nested
    @DisplayName("Atualização de Vidro (update)")
    class UpdateTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Sucesso] Deve atualizar todos os campos do vidro")
        void shouldUpdateGlassSuccessfully() {
            GlassUpdateDTO updateDto = new GlassUpdateDTO(
                    "Vidro Incolor 6mm Atualizado",
                    "Verde",
                    new BigDecimal("6"), // BVA: 6mm permitido
                    "70071900",
                    new BigDecimal("95.00"),
                    new BigDecimal("180.00"),
                    true,
                    new BigDecimal("2200"),
                    new BigDecimal("3200"),
                    "FAM-VIDRO-NOVA"
            );

            when(materialRepository.findById(GLASS_ID)).thenReturn(Optional.of(sampleGlass));
            when(materialRepository.save(any(Material.class))).thenReturn(sampleGlass);

            GlassResponseDTO response = glassService.update(GLASS_ID, updateDto);

            assertThat(response).isNotNull();
            verify(materialRepository).save(sampleGlass);
            assertThat(sampleGlass.getName()).isEqualTo("Vidro Incolor 6mm Atualizado");
            assertThat(sampleGlass.getColorFinish()).isEqualTo("Verde");
            assertThat(sampleGlass.getThicknessMm()).isEqualByComparingTo(new BigDecimal("6"));
            assertThat(sampleGlass.getFamilyCode()).isEqualTo("FAM-VIDRO-NOVA");
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - FamilyCode Nulo] Deve manter FamilyCode quando dto.familyCode for nulo")
        void shouldKeepFamilyCodeWhenNullInUpdateDto() {
            GlassUpdateDTO updateDto = new GlassUpdateDTO(
                    "Vidro Incolor 4mm",
                    "Incolor",
                    new BigDecimal("4"),
                    "70071900",
                    new BigDecimal("80.00"),
                    new BigDecimal("150.00"),
                    true,
                    new BigDecimal("2000"),
                    new BigDecimal("3000"),
                    null // familyCode nulo
            );

            when(materialRepository.findById(GLASS_ID)).thenReturn(Optional.of(sampleGlass));
            when(materialRepository.save(any(Material.class))).thenReturn(sampleGlass);

            glassService.update(GLASS_ID, updateDto);

            assertThat(sampleGlass.getFamilyCode()).isEqualTo("FAM-VIDRO"); // mantido
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - ID Inexistente] Deve lançar ResourceNotFoundException")
        void shouldThrowResourceNotFoundWhenUpdatingNonExistingGlass() {
            UUID unknownId = UUID.randomUUID();
            GlassUpdateDTO updateDto = new GlassUpdateDTO(
                    "Nome", "Cor", new BigDecimal("4"), "70071900",
                    BigDecimal.ONE, BigDecimal.TEN, true, BigDecimal.TEN, BigDecimal.TEN, "FAM"
            );

            when(materialRepository.findById(unknownId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> glassService.update(unknownId, updateDto))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Vidro não encontrado.");
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - Grupo Incompatível] Deve lançar IllegalArgumentException quando material não for vidro")
        void shouldThrowExceptionWhenMaterialGroupIsNotGlass() {
            MaterialGroup aluminumGroup = new MaterialGroup();
            aluminumGroup.setCode("ALUMINIO");
            Material wrongMaterial = new Material();
            wrongMaterial.setGroup(aluminumGroup);

            when(materialRepository.findById(GLASS_ID)).thenReturn(Optional.of(wrongMaterial));

            GlassUpdateDTO updateDto = new GlassUpdateDTO(
                    "Nome", "Cor", new BigDecimal("4"), "70071900",
                    BigDecimal.ONE, BigDecimal.TEN, true, BigDecimal.TEN, BigDecimal.TEN, "FAM"
            );

            assertThatThrownBy(() -> glassService.update(GLASS_ID, updateDto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("O material especificado não pertence ao grupo de vidros.");
        }
    }

    @Nested
    @DisplayName("Exclusão Lógica de Vidro (delete)")
    class DeleteTests {

        @Test
        @DisplayName("[Técnica: Transição de Estados - Inativação] Deve marcar vidro como active=false")
        void shouldSoftDeleteGlass() {
            when(materialRepository.findById(GLASS_ID)).thenReturn(Optional.of(sampleGlass));
            when(materialRepository.save(any(Material.class))).thenReturn(sampleGlass);

            glassService.delete(GLASS_ID);

            assertThat(sampleGlass.isActive()).isFalse();
            verify(materialRepository).save(sampleGlass);
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - ID Inexistente] Deve lançar ResourceNotFoundException na exclusão")
        void shouldThrowResourceNotFoundWhenDeletingNonExistingGlass() {
            UUID unknownId = UUID.randomUUID();
            when(materialRepository.findById(unknownId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> glassService.delete(unknownId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Vidro não encontrado.");
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - Grupo Incompatível] Deve rejeitar exclusão se grupo não for VIDRO")
        void shouldThrowExceptionWhenDeletingNonGlassMaterial() {
            MaterialGroup otherGroup = new MaterialGroup();
            otherGroup.setCode("FERRAGEM");
            Material wrongMaterial = new Material();
            wrongMaterial.setGroup(otherGroup);

            when(materialRepository.findById(GLASS_ID)).thenReturn(Optional.of(wrongMaterial));

            assertThatThrownBy(() -> glassService.delete(GLASS_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("O material especificado não pertence ao grupo de vidros.");
        }
    }
}

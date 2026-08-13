package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileUpdateDTO;
import br.edu.ifpb.alumigest.catalog.mapper.AluminumProfileMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AluminumProfileServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialGroupRepository materialGroupRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();
    private AluminumProfileMapper aluminumProfileMapper = new AluminumProfileMapper(objectMapper);

    @InjectMocks
    private AluminumProfileService aluminumProfileService;

    private static final UUID MATERIAL_ID = UUID.randomUUID();
    private static final UUID GROUP_ID    = UUID.randomUUID();

    private MaterialGroup aluminumGroup;
    private Material      aluminumMaterial;

    @BeforeEach
    void setUp() {
        aluminumGroup = new MaterialGroup(
                GROUP_ID,
                "ALUMINIO",
                "Perfis de Alumínio e Puxadores",
                CalculationType.LINEAR_METER,
                "Perfis, trilhos e puxadores calculados por metro linear e barras de 3m/6m",
                true,
                true
        );

        aluminumMaterial = new Material();
        aluminumMaterial.setId(MATERIAL_ID);
        aluminumMaterial.setName("Perfil S83 Linha Rometal");
        aluminumMaterial.setCommercialReference("S83");
        aluminumMaterial.setNcmCode("76042990");
        aluminumMaterial.setColorFinish("Branco");
        aluminumMaterial.setStandardLengthM(new BigDecimal("6.00"));
        aluminumMaterial.setUnitMeasure(UnitMeasure.METRO);
        aluminumMaterial.setCostPrice(new BigDecimal("45.00"));
        aluminumMaterial.setSalePrice(new BigDecimal("65.00"));
        aluminumMaterial.setActive(true);
        aluminumMaterial.setGroup(aluminumGroup);
        aluminumMaterial.setCreatedAt(OffsetDateTime.now());
        aluminumMaterial.setUpdatedAt(OffsetDateTime.now());
    }

    @Nested
    @DisplayName("Testes para create()")
    class CreateTests {

        @Test
        @DisplayName("Deve cadastrar um perfil de alumínio com sucesso quando referência e cor não existirem")
        void shouldCreateAluminumProfileSuccessfully() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Perfil S83 Linha Rometal",
                    "S83", "Rometal",
                    "76042990",
                    "Branco",
                    new BigDecimal("6.00"),
                    new BigDecimal("45.00"),
                    new BigDecimal("65.00"),
                    new BigDecimal("1.500")
            );

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findActiveByGroupAndCommercialReferenceAndColorFinish(
                    GROUP_ID, "S83", "Branco"))
                    .thenReturn(Optional.empty());
            when(materialRepository.save(any(Material.class)))
                    .thenReturn(aluminumMaterial);

            AluminumProfileResponseDTO response = aluminumProfileService.create(request);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(MATERIAL_ID);
            assertThat(response.commercialReference()).isEqualTo("S83");
            assertThat(response.colorFinish()).isEqualTo("Branco");
            assertThat(response.standardLengthM()).isEqualByComparingTo(new BigDecimal("6.00"));
            assertThat(response.unitMeasure()).isEqualTo(UnitMeasure.METRO);
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("65.00"));
            assertThat(response.active()).isTrue();

            verify(materialGroupRepository).findByCode("ALUMINIO");
            verify(materialRepository).findActiveByGroupAndCommercialReferenceAndColorFinish(
                    GROUP_ID, "S83", "Branco");
            verify(materialRepository).save(any(Material.class));
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando referência comercial + cor já existir")
        void shouldThrowBusinessExceptionWhenDuplicateReferenceAndColor() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Perfil S83 Linha Rometal",
                    "S83", "Rometal",
                    null,
                    "Branco",
                    new BigDecimal("6.00"),
                    new BigDecimal("45.00"),
                    new BigDecimal("65.00"),
                    new BigDecimal("1.500")
            );

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findActiveByGroupAndCommercialReferenceAndColorFinish(
                    GROUP_ID, "S83", "Branco"))
                    .thenReturn(Optional.of(aluminumMaterial));

            assertThatThrownBy(() -> aluminumProfileService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Já existe um perfil de alumínio cadastrado com a referência 'S83'")
                    .hasMessageContaining("acabamento 'Branco'");

            verify(materialRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve converter DataIntegrityViolationException em BusinessException quando save() falhar por concorrência")
        void shouldConvertDataIntegrityViolationToBusinessExceptionOnConcurrentInsert() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Perfil S83 Linha Rometal",
                    "S83", "Rometal",
                    null,
                    "Branco",
                    new BigDecimal("6.00"),
                    new BigDecimal("45.00"),
                    new BigDecimal("65.00"),
                    new BigDecimal("1.500")
            );

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findActiveByGroupAndCommercialReferenceAndColorFinish(
                    GROUP_ID, "S83", "Branco"))
                    .thenReturn(Optional.empty());
            when(materialRepository.save(any(Material.class)))
                    .thenThrow(new DataIntegrityViolationException("unique constraint violation"));

            assertThatThrownBy(() -> aluminumProfileService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Conflito de cadastro")
                    .hasMessageContaining("S83");

            verify(materialRepository).save(any(Material.class));
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o grupo ALUMINIO não for encontrado")
        void shouldThrowBusinessExceptionWhenGroupNotFound() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Perfil SPR-060",
                    "SPR-060", "Rometal",
                    null,
                    "Natural",
                    new BigDecimal("3.00"),
                    new BigDecimal("30.00"),
                    new BigDecimal("50.00"),
                    new BigDecimal("1.500")
            );

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> aluminumProfileService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Grupo de materiais 'ALUMINIO' não encontrado");

            verify(materialRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o comprimento padrão não for 3.00 ou 6.00")
        void shouldThrowBusinessExceptionWhenStandardLengthInvalid() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Perfil S83 Linha Rometal",
                    "S83", "Rometal",
                    null,
                    "Branco",
                    new BigDecimal("4.50"),
                    new BigDecimal("45.00"),
                    new BigDecimal("65.00"),
                    new BigDecimal("1.500")
            );

            assertThatThrownBy(() -> aluminumProfileService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Comprimento padrão inválido: 4.50m")
                    .hasMessageContaining("3.00m e 6.00m");

            verify(materialRepository, never()).save(any());
            verify(materialGroupRepository, never()).findByCode(any());
        }

        @Test
        @DisplayName("Deve aceitar barra de 3.00m com sucesso")
        void shouldAcceptThreeMeterBar() {
            AluminumProfileRequestDTO request = new AluminumProfileRequestDTO(
                    "Puxador SPR-060 Linha Alternativa",
                    "SPR-060", "Rometal",
                    null,
                    "Natural",
                    new BigDecimal("3.00"),
                    new BigDecimal("30.00"),
                    new BigDecimal("50.00"),
                    new BigDecimal("1.500")
            );

            Material savedMaterial = new Material();
            savedMaterial.setId(UUID.randomUUID());
            savedMaterial.setName(request.name());
            savedMaterial.setCommercialReference(request.commercialReference());
            savedMaterial.setColorFinish(request.colorFinish());
            savedMaterial.setStandardLengthM(request.standardLengthM());
            savedMaterial.setUnitMeasure(UnitMeasure.METRO);
            savedMaterial.setCostPrice(request.costPrice());
            savedMaterial.setSalePrice(request.salePrice());
            savedMaterial.setActive(true);
            savedMaterial.setGroup(aluminumGroup);
            savedMaterial.setCreatedAt(OffsetDateTime.now());
            savedMaterial.setUpdatedAt(OffsetDateTime.now());

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findActiveByGroupAndCommercialReferenceAndColorFinish(
                    GROUP_ID, "SPR-060", "Natural"))
                    .thenReturn(Optional.empty());
            when(materialRepository.save(any(Material.class)))
                    .thenReturn(savedMaterial);

            AluminumProfileResponseDTO response = aluminumProfileService.create(request);

            assertThat(response).isNotNull();
            assertThat(response.standardLengthM()).isEqualByComparingTo(new BigDecimal("3.00"));
            assertThat(response.commercialReference()).isEqualTo("SPR-060");

            verify(materialRepository).save(any(Material.class));
        }
    }

    @Nested
    @DisplayName("Testes para findAll()")
    class FindAllTests {

        @Test
        @DisplayName("Deve listar perfis de alumínio paginados com filtro por cor e nome")
        void shouldReturnPagedAluminumListWithFilters() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Material> materialPage = new PageImpl<>(List.of(aluminumMaterial), pageable, 1);

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findAllActiveAluminumFiltered(
                    GROUP_ID, "Branco", "Rometal", pageable))
                    .thenReturn(materialPage);

            Page<AluminumProfileResponseDTO> result =
                    aluminumProfileService.findAll("Branco", "Rometal", pageable);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).commercialReference()).isEqualTo("S83");

            verify(materialGroupRepository).findByCode("ALUMINIO");
            verify(materialRepository).findAllActiveAluminumFiltered(
                    GROUP_ID, "Branco", "Rometal", pageable);
        }

        @Test
        @DisplayName("Deve listar todos os perfis quando os filtros são nulos")
        void shouldReturnAllProfilesWhenFiltersAreNull() {
            Pageable pageable = PageRequest.of(0, 20);
            Page<Material> materialPage = new PageImpl<>(List.of(aluminumMaterial), pageable, 1);

            when(materialGroupRepository.findByCode("ALUMINIO"))
                    .thenReturn(Optional.of(aluminumGroup));
            when(materialRepository.findAllActiveAluminumFiltered(GROUP_ID, null, null, pageable))
                    .thenReturn(materialPage);

            Page<AluminumProfileResponseDTO> result = aluminumProfileService.findAll(null, null, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(materialRepository).findAllActiveAluminumFiltered(GROUP_ID, null, null, pageable);
        }
    }

    @Nested
    @DisplayName("Testes para findById()")
    class FindByIdTests {

        @Test
        @DisplayName("Deve buscar perfil de alumínio por UUID com sucesso")
        void shouldFindAluminumProfileByIdSuccessfully() {
            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO"))
                    .thenReturn(Optional.of(aluminumMaterial));

            AluminumProfileResponseDTO response = aluminumProfileService.findById(MATERIAL_ID);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(MATERIAL_ID);
            assertThat(response.commercialReference()).isEqualTo("S83");
            assertThat(response.colorFinish()).isEqualTo("Branco");

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO");
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando o UUID não corresponder a um perfil de alumínio")
        void shouldThrowResourceNotFoundExceptionWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            when(materialRepository.findByIdAndGroupCode(nonExistentId, "ALUMINIO"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> aluminumProfileService.findById(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Perfil de alumínio não encontrado com ID: " + nonExistentId);

            verify(materialRepository).findByIdAndGroupCode(nonExistentId, "ALUMINIO");
        }
    }

    @Nested
    @DisplayName("Testes para updatePrices()")
    class UpdatePricesTests {

        @Test
        @DisplayName("Deve atualizar os preços de custo e venda do perfil com sucesso")
        void shouldUpdatePricesSuccessfully() {
            AluminumProfileUpdateDTO updateRequest =
                    new AluminumProfileUpdateDTO(new BigDecimal("50.00"), new BigDecimal("75.00"));

            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO"))
                    .thenReturn(Optional.of(aluminumMaterial));
            when(materialRepository.save(any(Material.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            AluminumProfileResponseDTO response = aluminumProfileService.updatePrices(MATERIAL_ID, updateRequest);

            assertThat(response).isNotNull();
            assertThat(response.costPrice()).isEqualByComparingTo(new BigDecimal("50.00"));
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("75.00"));

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO");
            verify(materialRepository).save(aluminumMaterial);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar perfil inexistente")
        void shouldThrowResourceNotFoundExceptionOnUpdateWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            AluminumProfileUpdateDTO updateRequest =
                    new AluminumProfileUpdateDTO(new BigDecimal("50.00"), new BigDecimal("75.00"));

            when(materialRepository.findByIdAndGroupCode(nonExistentId, "ALUMINIO"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> aluminumProfileService.updatePrices(nonExistentId, updateRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Perfil de alumínio não encontrado com ID: " + nonExistentId);

            verify(materialRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes para softDelete()")
    class SoftDeleteTests {

        @Test
        @DisplayName("Deve desativar perfil de alumínio com sucesso (soft delete)")
        void shouldSoftDeleteAluminumProfileSuccessfully() {
            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO"))
                    .thenReturn(Optional.of(aluminumMaterial));
            when(materialRepository.save(any(Material.class)))
                    .thenReturn(aluminumMaterial);

            aluminumProfileService.softDelete(MATERIAL_ID);

            assertThat(aluminumMaterial.isActive()).isFalse();

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "ALUMINIO");
            verify(materialRepository).save(aluminumMaterial);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar deletar perfil inexistente")
        void shouldThrowResourceNotFoundExceptionOnSoftDeleteWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            when(materialRepository.findByIdAndGroupCode(nonExistentId, "ALUMINIO"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> aluminumProfileService.softDelete(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Perfil de alumínio não encontrado com ID: " + nonExistentId);

            verify(materialRepository, never()).save(any());
        }
    }
}

package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.mapper.HardwareMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
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

/**
 * Testes unitários do {@link HardwareService}.
 *
 * <p>Ferragens são persistidas como {@link Material} vinculado ao grupo nativo {@code FERRAGEM}.
 * Os mocks de {@link MaterialRepository} e {@link MaterialGroupRepository} simulam
 * as operações no catálogo genérico, sem tabela ou entidade própria de hardware.</p>
 */
@ExtendWith(MockitoExtension.class)
class HardwareServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialGroupRepository materialGroupRepository;

    private HardwareMapper hardwareMapper = new HardwareMapper();

    private HardwareService hardwareService;

    // -------------------------------------------------------------------------
    // Fixtures compartilhadas
    // -------------------------------------------------------------------------

    private static final UUID MATERIAL_ID = UUID.randomUUID();
    private static final UUID GROUP_ID    = UUID.randomUUID();

    private MaterialGroup ferragemGroup;
    private Material      hardwareMaterial;

    @BeforeEach
    void setUp() {
        hardwareService = new HardwareService(materialRepository, materialGroupRepository, hardwareMapper);

        ferragemGroup = new MaterialGroup(
                GROUP_ID,
                "FERRAGEM",
                "Ferragens, Componentes e Acessórios",
                CalculationType.UNIT,
                "Fechaduras, rodízios, esquadretas e kits de montagem por unidade ou par",
                true,
                true
        );

        hardwareMaterial = new Material();
        hardwareMaterial.setId(MATERIAL_ID);
        hardwareMaterial.setSkuCode("ESQ-001");
        hardwareMaterial.setName("Esquadreta para linha 25");
        hardwareMaterial.setUnitMeasure(UnitMeasure.UN);
        hardwareMaterial.setAttributesJson("{\"calculationType\":\"UNIT\"}");
        hardwareMaterial.setCostPrice(new BigDecimal("10.00"));
        hardwareMaterial.setSalePrice(new BigDecimal("15.50"));
        hardwareMaterial.setActive(true);
        hardwareMaterial.setGroup(ferragemGroup);
        hardwareMaterial.setCreatedAt(OffsetDateTime.now());
        hardwareMaterial.setUpdatedAt(OffsetDateTime.now());
    }

    // =========================================================================
    // create()
    // =========================================================================

    @Nested
    class CreateTests {

        // -----------------------------------------------------------------
        // Cenário 1: validação antecipada detecta duplicata
        // -----------------------------------------------------------------

        @Test
        @DisplayName("[Cenário 1] Deve lançar BusinessException quando existsByCode detectar skuCode duplicado")
        void shouldThrowBusinessExceptionWhenSkuCodeAlreadyExists() {
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "ESQ-001",
                    "Esquadreta para linha 25",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("10.00"),
                    new BigDecimal("15.50")
            );

            when(materialRepository.findBySkuCodeAndIsActiveTrue("ESQ-001"))
                    .thenReturn(Optional.of(hardwareMaterial));

            assertThatThrownBy(() -> hardwareService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Já existe uma ferragem cadastrada com o código: ESQ-001");

            verify(materialRepository).findBySkuCodeAndIsActiveTrue("ESQ-001");
            verify(materialRepository, never()).save(any());
        }

        // -----------------------------------------------------------------
        // Cenário 2: corrida concorrente — constraint do banco dispara
        // -----------------------------------------------------------------

        @Test
        @DisplayName("[Cenário 2] Deve converter DataIntegrityViolationException em BusinessException quando save() falhar por concorrência")
        void shouldConvertDataIntegrityViolationToBusinessExceptionOnConcurrentInsert() {
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "ESQ-001",
                    "Esquadreta para linha 25",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("10.00"),
                    new BigDecimal("15.50")
            );

            // Validação antecipada não detecta duplicata (janela de corrida)
            when(materialRepository.findBySkuCodeAndIsActiveTrue("ESQ-001"))
                    .thenReturn(Optional.empty());
            when(materialGroupRepository.findByCode("FERRAGEM"))
                    .thenReturn(Optional.of(ferragemGroup));
            // Banco rejeita com UNIQUE constraint
            when(materialRepository.save(any(Material.class)))
                    .thenThrow(new DataIntegrityViolationException("unique constraint violation"));

            assertThatThrownBy(() -> hardwareService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Conflito de cadastro")
                    .hasMessageContaining("ESQ-001");

            verify(materialRepository).findBySkuCodeAndIsActiveTrue("ESQ-001");
            verify(materialGroupRepository).findByCode("FERRAGEM");
            verify(materialRepository).save(any(Material.class));
        }

        // -----------------------------------------------------------------
        // Cenário 3: fluxo normal sem conflito
        // -----------------------------------------------------------------

        @Test
        @DisplayName("[Cenário 3] Deve cadastrar uma ferragem com sucesso quando o skuCode não existir")
        void shouldCreateHardwareSuccessfully() {
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "ESQ-001",
                    "Esquadreta para linha 25",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("10.00"),
                    new BigDecimal("15.50")
            );

            when(materialRepository.findBySkuCodeAndIsActiveTrue("ESQ-001"))
                    .thenReturn(Optional.empty());
            when(materialGroupRepository.findByCode("FERRAGEM"))
                    .thenReturn(Optional.of(ferragemGroup));
            when(materialRepository.save(any(Material.class)))
                    .thenReturn(hardwareMaterial);

            HardwareResponseDTO response = hardwareService.create(request);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(MATERIAL_ID);
            assertThat(response.skuCode()).isEqualTo("ESQ-001");
            assertThat(response.name()).isEqualTo("Esquadreta para linha 25");
            assertThat(response.unitMeasure()).isEqualTo(UnitMeasure.UN);
            assertThat(response.calculationType()).isEqualTo(CalculationType.UNIT);
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("15.50"));
            assertThat(response.active()).isTrue();

            verify(materialRepository).findBySkuCodeAndIsActiveTrue("ESQ-001");
            verify(materialGroupRepository).findByCode("FERRAGEM");
            verify(materialRepository).save(any(Material.class));
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o grupo FERRAGEM não for encontrado no sistema")
        void shouldThrowBusinessExceptionWhenGroupNotFound() {
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "ESQ-002",
                    "Dobraça 3 polegadas",
                    UnitMeasure.PAR,
                    CalculationType.PAIR,
                    new BigDecimal("8.00"),
                    new BigDecimal("12.00")
            );

            when(materialRepository.findBySkuCodeAndIsActiveTrue("ESQ-002"))
                    .thenReturn(Optional.empty());
            when(materialGroupRepository.findByCode("FERRAGEM"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Grupo de materiais 'FERRAGEM' não encontrado");

            verify(materialRepository, never()).save(any());
        }
    }

    // =========================================================================
    // findAll()
    // =========================================================================

    @Nested
    @DisplayName("Testes para findAll()")
    class FindAllTests {

        @Test
        @DisplayName("Deve listar ferragens paginadas filtrando por unidade de medida e nome")
        void shouldReturnPagedHardwareListWithFilters() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Material> materialPage = new PageImpl<>(List.of(hardwareMaterial), pageable, 1);

            when(materialGroupRepository.findByCode("FERRAGEM"))
                    .thenReturn(Optional.of(ferragemGroup));
            when(materialRepository.findAllByGroupFiltered(
                    GROUP_ID, UnitMeasure.UN, "Esquadreta", pageable))
                    .thenReturn(materialPage);

            Page<HardwareResponseDTO> result =
                    hardwareService.findAll(UnitMeasure.UN, "Esquadreta", pageable);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).skuCode()).isEqualTo("ESQ-001");

            verify(materialGroupRepository).findByCode("FERRAGEM");
            verify(materialRepository).findAllByGroupFiltered(
                    GROUP_ID, UnitMeasure.UN, "Esquadreta", pageable);
        }

        @Test
        @DisplayName("Deve listar todas as ferragens quando os filtros são nulos")
        void shouldReturnAllHardwareWhenFiltersAreNull() {
            Pageable pageable = PageRequest.of(0, 20);
            Page<Material> materialPage = new PageImpl<>(List.of(hardwareMaterial), pageable, 1);

            when(materialGroupRepository.findByCode("FERRAGEM"))
                    .thenReturn(Optional.of(ferragemGroup));
            when(materialRepository.findAllByGroupFiltered(GROUP_ID, null, null, pageable))
                    .thenReturn(materialPage);

            Page<HardwareResponseDTO> result = hardwareService.findAll(null, null, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(materialRepository).findAllByGroupFiltered(GROUP_ID, null, null, pageable);
        }
    }

    // =========================================================================
    // findById()
    // =========================================================================

    @Nested
    @DisplayName("Testes para findById()")
    class FindByIdTests {

        @Test
        @DisplayName("Deve buscar ferragem por UUID com sucesso se pertencer ao grupo FERRAGEM")
        void shouldFindHardwareByIdSuccessfully() {
            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM"))
                    .thenReturn(Optional.of(hardwareMaterial));

            HardwareResponseDTO response = hardwareService.findById(MATERIAL_ID);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(MATERIAL_ID);
            assertThat(response.skuCode()).isEqualTo("ESQ-001");

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM");
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando o UUID não corresponder a uma ferragem")
        void shouldThrowResourceNotFoundExceptionWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            when(materialRepository.findByIdAndGroupCode(nonExistentId, "FERRAGEM"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.findById(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: " + nonExistentId);

            verify(materialRepository).findByIdAndGroupCode(nonExistentId, "FERRAGEM");
        }
    }

    // =========================================================================
    // updatePrice()
    // =========================================================================

    @Nested
    @DisplayName("Testes para updatePrice()")
    class UpdatePriceTests {

        @Test
        @DisplayName("Deve atualizar o preço de venda da ferragem com sucesso")
        void shouldUpdatePriceSuccessfully() {
            HardwareUpdatePriceDTO updateRequest =
                    new HardwareUpdatePriceDTO(new BigDecimal("18.90"), null);

            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM"))
                    .thenReturn(Optional.of(hardwareMaterial));
            when(materialRepository.save(any(Material.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            HardwareResponseDTO response = hardwareService.updatePrice(MATERIAL_ID, updateRequest);

            assertThat(response).isNotNull();
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("18.90"));

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM");
            verify(materialRepository).save(hardwareMaterial);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar ferragem inexistente")
        void shouldThrowResourceNotFoundExceptionOnUpdatePriceWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            HardwareUpdatePriceDTO updateRequest =
                    new HardwareUpdatePriceDTO(new BigDecimal("18.90"), null);

            when(materialRepository.findByIdAndGroupCode(nonExistentId, "FERRAGEM"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.updatePrice(nonExistentId, updateRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: " + nonExistentId);

            verify(materialRepository, never()).save(any());
        }
    }

    // =========================================================================
    // softDelete()
    // =========================================================================

    @Nested
    @DisplayName("Testes para softDelete()")
    class SoftDeleteTests {

        @Test
        @DisplayName("Deve desativar ferragem com sucesso (soft delete via Material.setActive(false))")
        void shouldSoftDeleteHardwareSuccessfully() {
            when(materialRepository.findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM"))
                    .thenReturn(Optional.of(hardwareMaterial));
            when(materialRepository.save(any(Material.class)))
                    .thenReturn(hardwareMaterial);

            hardwareService.softDelete(MATERIAL_ID);

            assertThat(hardwareMaterial.isActive()).isFalse();

            verify(materialRepository).findByIdAndGroupCode(MATERIAL_ID, "FERRAGEM");
            verify(materialRepository).save(hardwareMaterial);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar deletar ferragem inexistente")
        void shouldThrowResourceNotFoundExceptionOnSoftDeleteWhenIdNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            when(materialRepository.findByIdAndGroupCode(nonExistentId, "FERRAGEM"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.softDelete(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: " + nonExistentId);

            verify(materialRepository, never()).save(any());
        }
    }
}

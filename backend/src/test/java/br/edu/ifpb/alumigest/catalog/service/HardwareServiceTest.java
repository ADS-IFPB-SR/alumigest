package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.CreateHardwareRequest;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponse;
import br.edu.ifpb.alumigest.catalog.dto.UpdateHardwarePriceRequest;
import br.edu.ifpb.alumigest.catalog.entity.CalculationType;
import br.edu.ifpb.alumigest.catalog.entity.Hardware;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;
import br.edu.ifpb.alumigest.catalog.mapper.HardwareMapper;
import br.edu.ifpb.alumigest.catalog.repository.HardwareRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HardwareServiceTest {

    @Mock
    private HardwareRepository hardwareRepository;

    @Spy
    private HardwareMapper hardwareMapper = new HardwareMapper();

    @InjectMocks
    private HardwareService hardwareService;

    private Hardware hardwareEntity;

    @BeforeEach
    void setUp() {
        hardwareEntity = Hardware.builder()
                .id(1L)
                .code("ESQ-001")
                .name("Esquadreta para linha 25")
                .unit(UnitType.UN)
                .calculationType(CalculationType.UNIT)
                .unitPrice(new BigDecimal("15.50"))
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Testes para create()")
    class CreateTests {

        @Test
        @DisplayName("Deve cadastrar uma ferragem com sucesso quando o código não existir")
        void shouldCreateHardwareSuccessfully() {
            CreateHardwareRequest request = new CreateHardwareRequest(
                    "ESQ-001",
                    "Esquadreta para linha 25",
                    UnitType.UN,
                    CalculationType.UNIT,
                    new BigDecimal("15.50")
            );

            when(hardwareRepository.existsByCode("ESQ-001")).thenReturn(false);
            when(hardwareRepository.save(any(Hardware.class))).thenReturn(hardwareEntity);

            HardwareResponse response = hardwareService.create(request);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.code()).isEqualTo("ESQ-001");
            assertThat(response.name()).isEqualTo("Esquadreta para linha 25");
            assertThat(response.unit()).isEqualTo(UnitType.UN);
            assertThat(response.calculationType()).isEqualTo(CalculationType.UNIT);
            assertThat(response.unitPrice()).isEqualTo(new BigDecimal("15.50"));
            assertThat(response.active()).isTrue();

            verify(hardwareRepository, times(1)).existsByCode("ESQ-001");
            verify(hardwareRepository, times(1)).save(any(Hardware.class));
        }

        @Test
        @DisplayName("Deve lançar BusinessException ao tentar cadastrar ferragem com código duplicado")
        void shouldThrowBusinessExceptionWhenCodeAlreadyExists() {
            CreateHardwareRequest request = new CreateHardwareRequest(
                    "ESQ-001",
                    "Esquadreta para linha 25",
                    UnitType.UN,
                    CalculationType.UNIT,
                    new BigDecimal("15.50")
            );

            when(hardwareRepository.existsByCode("ESQ-001")).thenReturn(true);

            assertThatThrownBy(() -> hardwareService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Já existe uma ferragem cadastrada com o código: ESQ-001");

            verify(hardwareRepository, times(1)).existsByCode("ESQ-001");
            verify(hardwareRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes para findAll()")
    class FindAllTests {

        @Test
        @DisplayName("Deve listar ferragens paginadas filtrando por unidade e nome")
        void shouldReturnPagedHardwareListWithFilters() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Hardware> hardwarePage = new PageImpl<>(List.of(hardwareEntity), pageable, 1);

            when(hardwareRepository.findAllActiveFiltered(UnitType.UN, "Esquadreta", pageable))
                    .thenReturn(hardwarePage);

            Page<HardwareResponse> result = hardwareService.findAll(UnitType.UN, "Esquadreta", pageable);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).code()).isEqualTo("ESQ-001");

            verify(hardwareRepository, times(1))
                    .findAllActiveFiltered(UnitType.UN, "Esquadreta", pageable);
        }
    }

    @Nested
    @DisplayName("Testes para findById()")
    class FindByIdTests {

        @Test
        @DisplayName("Deve buscar ferragem por ID com sucesso se estiver ativa")
        void shouldFindHardwareByIdSuccessfully() {
            when(hardwareRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(hardwareEntity));

            HardwareResponse response = hardwareService.findById(1L);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.code()).isEqualTo("ESQ-001");

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(1L);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando a ferragem não for encontrada por ID")
        void shouldThrowResourceNotFoundExceptionWhenIdNotFound() {
            when(hardwareRepository.findByIdAndActiveTrue(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.findById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: 99");

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(99L);
        }
    }

    @Nested
    @DisplayName("Testes para updatePrice()")
    class UpdatePriceTests {

        @Test
        @DisplayName("Deve atualizar o preço da ferragem com sucesso")
        void shouldUpdatePriceSuccessfully() {
            UpdateHardwarePriceRequest updateRequest = new UpdateHardwarePriceRequest(new BigDecimal("18.90"));

            when(hardwareRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(hardwareEntity));
            when(hardwareRepository.save(any(Hardware.class))).thenAnswer(invocation -> invocation.getArgument(0));

            HardwareResponse response = hardwareService.updatePrice(1L, updateRequest);

            assertThat(response).isNotNull();
            assertThat(response.unitPrice()).isEqualTo(new BigDecimal("18.90"));

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(1L);
            verify(hardwareRepository, times(1)).save(hardwareEntity);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar preço de ferragem inexistente")
        void shouldThrowResourceNotFoundExceptionOnUpdatePriceWhenIdNotFound() {
            UpdateHardwarePriceRequest updateRequest = new UpdateHardwarePriceRequest(new BigDecimal("18.90"));

            when(hardwareRepository.findByIdAndActiveTrue(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.updatePrice(99L, updateRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: 99");

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(99L);
            verify(hardwareRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes para softDelete()")
    class SoftDeleteTests {

        @Test
        @DisplayName("Deve desativar ferragem com sucesso (soft delete)")
        void shouldSoftDeleteHardwareSuccessfully() {
            when(hardwareRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(hardwareEntity));

            hardwareService.softDelete(1L);

            assertThat(hardwareEntity.getActive()).isFalse();

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(1L);
            verify(hardwareRepository, times(1)).save(hardwareEntity);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar deletar ferragem inexistente")
        void shouldThrowResourceNotFoundExceptionOnSoftDeleteWhenIdNotFound() {
            when(hardwareRepository.findByIdAndActiveTrue(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> hardwareService.softDelete(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ferragem não encontrada com ID: 99");

            verify(hardwareRepository, times(1)).findByIdAndActiveTrue(99L);
            verify(hardwareRepository, never()).save(any());
        }
    }
}

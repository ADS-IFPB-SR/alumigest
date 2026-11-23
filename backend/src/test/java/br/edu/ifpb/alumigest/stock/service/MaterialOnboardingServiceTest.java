package br.edu.ifpb.alumigest.stock.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import br.edu.ifpb.alumigest.catalog.service.AluminumProfileService;
import br.edu.ifpb.alumigest.catalog.service.FilmService;
import br.edu.ifpb.alumigest.catalog.service.HardwareService;
import br.edu.ifpb.alumigest.catalog.service.IGlassService;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.InitialStockEntryDTO;
import br.edu.ifpb.alumigest.stock.dto.MaterialWithStockCreateRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.MaterialWithStockResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("MaterialOnboardingService — Testes Unitários do Fluxo 2 em 1 (US-22.3)")
class MaterialOnboardingServiceTest {

    @Mock
    private AluminumProfileService aluminumProfileService;

    @Mock
    private IGlassService glassService;

    @Mock
    private HardwareService hardwareService;

    @Mock
    private FilmService filmService;

    @Mock
    private StockService stockService;

    @InjectMocks
    private MaterialOnboardingService onboardingService;

    @Test
    @DisplayName("Deve criar perfil de alumínio, normalizar isHandle null para false, provisionar estoque e registrar PURCHASE_ENTRY")
    void shouldCreateProfileWithInitialStockAndNormalizeIsHandle() {
        UUID materialId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        AluminumProfileResponseDTO profileResponse = new AluminumProfileResponseDTO(
            materialId,
            "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO",
            "ALU-SUP-105",
            "SUPREMA",
            "76042100",
            "BRANCO",
            new BigDecimal("6"),
            UnitMeasure.values()[0],
            new BigDecimal("145.00"),
            new BigDecimal("42.00"),
            new BigDecimal("0.920"),
            true,
            now,
            now,
            "FAM-SUPREMA",
            false
        );
        when(aluminumProfileService.create(any())).thenReturn(profileResponse);

        StockItemResponseDTO provisioned = buildStockItem(materialId, BigDecimal.ZERO, new BigDecimal("4.0000"));
        StockItemResponseDTO updated = buildStockItem(materialId, new BigDecimal("10.0000"), new BigDecimal("4.0000"));
        StockMovementResponseDTO movement = new StockMovementResponseDTO(
            UUID.randomUUID(),
            updated.id(),
            materialId,
            "ALU-SUP-105",
            "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO",
            "BARRA_6M",
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10.0000"),
            new BigDecimal("145.00"),
            BigDecimal.ZERO,
            new BigDecimal("10.0000"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            "Pedido 1088",
            "Distribuidora Asa",
            "Entrada inicial no cadastro do material",
            "almoxarifado",
            now
        );

        when(stockService.provisionStockItem(materialId, new BigDecimal("4"))).thenReturn(provisioned);
        when(stockService.registerMovement(any())).thenReturn(movement);
        when(stockService.getStockBalance(materialId)).thenReturn(updated);

        AluminumProfileRequestDTO profileDto = new AluminumProfileRequestDTO(
            "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO",
            "ALU-SUP-105",
            "SUPREMA",
            "76042100",
            "BRANCO",
            new BigDecimal("6"),
            new BigDecimal("145.00"),
            new BigDecimal("42.00"),
            new BigDecimal("0.920"),
            "FAM-SUPREMA",
            null
        );

        InitialStockEntryDTO initialStock = new InitialStockEntryDTO(
            new BigDecimal("10"),
            new BigDecimal("145.00"),
            new BigDecimal("4"),
            "Distribuidora Asa",
            "Pedido 1088",
            null,
            "almoxarifado"
        );

        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            MaterialCategoryType.PROFILE,
            profileDto,
            null,
            null,
            null,
            initialStock
        );

        MaterialWithStockResponseDTO result = onboardingService.createMaterialWithStock(request);

        ArgumentCaptor<AluminumProfileRequestDTO> profileCaptor =
            ArgumentCaptor.forClass(AluminumProfileRequestDTO.class);
        verify(aluminumProfileService).create(profileCaptor.capture());
        assertThat(profileCaptor.getValue().isHandle()).isFalse();

        ArgumentCaptor<StockMovementRequestDTO> movementCaptor =
            ArgumentCaptor.forClass(StockMovementRequestDTO.class);
        verify(stockService).registerMovement(movementCaptor.capture());
        StockMovementRequestDTO sentMovement = movementCaptor.getValue();
        assertThat(sentMovement.materialId()).isEqualTo(materialId);
        assertThat(sentMovement.type()).isEqualTo(StockMovementType.PURCHASE_ENTRY);
        assertThat(sentMovement.quantity()).isEqualByComparingTo("10");
        assertThat(sentMovement.unitCost()).isEqualByComparingTo("145.00");
        assertThat(sentMovement.supplier()).isEqualTo("Distribuidora Asa");
        assertThat(sentMovement.referenceDocument()).isEqualTo("Pedido 1088");
        assertThat(sentMovement.reason()).isEqualTo("Entrada inicial no cadastro do material");

        assertThat(result.materialId()).isEqualTo(materialId);
        assertThat(result.stockItem().physicalQuantity()).isEqualByComparingTo("10");
        assertThat(result.initialMovement()).isEqualTo(movement);
    }

    @Test
    @DisplayName("Deve criar vidro sem entrada inicial provisionando tb_stock_items zerado e sem registrar movimentação")
    void shouldCreateGlassWithoutInitialStock() {
        UUID materialId = UUID.randomUUID();
        GlassResponseDTO glassResponse = new GlassResponseDTO(
            materialId,
            "VIDRO TEMPERADO INCOLOR 8MM",
            "INCOLOR",
            "70071900",
            new BigDecimal("8"),
            new BigDecimal("110.00"),
            new BigDecimal("185.00"),
            "M2",
            true,
            new BigDecimal("2400"),
            new BigDecimal("3210"),
            "FAM-VIDRO"
        );
        when(glassService.create(any())).thenReturn(glassResponse);

        StockItemResponseDTO provisioned = buildStockItem(materialId, BigDecimal.ZERO, BigDecimal.ZERO);
        when(stockService.provisionStockItem(materialId, BigDecimal.ZERO)).thenReturn(provisioned);

        GlassCreateDTO glassDto = new GlassCreateDTO(
            "VIDRO TEMPERADO INCOLOR 8MM",
            "INCOLOR",
            "70071900",
            new BigDecimal("8"),
            new BigDecimal("110.00"),
            new BigDecimal("185.00"),
            new BigDecimal("2400"),
            new BigDecimal("3210"),
            "FAM-VIDRO"
        );

        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            MaterialCategoryType.GLASS,
            null,
            glassDto,
            null,
            null,
            null
        );

        MaterialWithStockResponseDTO result = onboardingService.createMaterialWithStock(request);

        verify(stockService).provisionStockItem(materialId, BigDecimal.ZERO);
        verify(stockService, never()).registerMovement(any());
        assertThat(result.initialMovement()).isNull();
        assertThat(result.stockItem().physicalQuantity()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Deve criar ferragem preservando isHandle=true e provisionar estoque")
    void shouldCreateHardwarePreservingIsHandleTrue() {
        UUID materialId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        HardwareResponseDTO hardwareResponse = new HardwareResponseDTO(
            materialId,
            "FER-PUX-301",
            "PUXADOR CONCHA EMBUTIR PRETO",
            UnitMeasure.values()[0],
            CalculationType.values()[0],
            "83024100",
            new BigDecimal("28.50"),
            new BigDecimal("55.00"),
            true,
            now,
            now,
            "FAM-PUXADORES",
            true
        );
        when(hardwareService.create(any())).thenReturn(hardwareResponse);

        StockItemResponseDTO provisioned = buildStockItem(materialId, BigDecimal.ZERO, BigDecimal.ZERO);
        when(stockService.provisionStockItem(materialId, BigDecimal.ZERO)).thenReturn(provisioned);

        HardwareRequestDTO hardwareDto = new HardwareRequestDTO(
            "FER-PUX-301",
            "PUXADOR CONCHA EMBUTIR PRETO",
            UnitMeasure.values()[0],
            CalculationType.values()[0],
            new BigDecimal("28.50"),
            new BigDecimal("55.00"),
            "83024100",
            "FAM-PUXADORES",
            Boolean.TRUE
        );

        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            MaterialCategoryType.HARDWARE,
            null,
            null,
            hardwareDto,
            null,
            null
        );

        onboardingService.createMaterialWithStock(request);

        ArgumentCaptor<HardwareRequestDTO> captor = ArgumentCaptor.forClass(HardwareRequestDTO.class);
        verify(hardwareService).create(captor.capture());
        assertThat(captor.getValue().isHandle()).isTrue();
    }

    @Test
    @DisplayName("Deve delegar cadastro de película para FilmService.createFilm")
    void shouldCreateFilmViaCreateFilmMethod() {
        UUID materialId = UUID.randomUUID();
        FilmResponseDTO filmResponse = new FilmResponseDTO(
            materialId,
            "PELÍCULA JATEADA",
            "JATEADA",
            new BigDecimal("24.00"),
            new BigDecimal("65.00"),
            "M2",
            new BigDecimal("0.08"),
            new BigDecimal("30.0"),
            new BigDecimal("1520"),
            true,
            "PEL-JAT-001",
            "PEL-JAT-001",
            "39199090",
            "FAM-PELICULAS"
        );
        when(filmService.createFilm(any())).thenReturn(filmResponse);

        StockItemResponseDTO provisioned = buildStockItem(materialId, BigDecimal.ZERO, BigDecimal.ZERO);
        when(stockService.provisionStockItem(materialId, BigDecimal.ZERO)).thenReturn(provisioned);
        FilmRequestDTO filmDto = new FilmRequestDTO(
            "PELÍCULA JATEADA",
            "JATEADA",
            new BigDecimal("65.00"),
            "PEL-JAT-001",
            "39199090",
            new BigDecimal("24.00"),
            new BigDecimal("0.08"),
            new BigDecimal("30.0"),
            new BigDecimal("1520"),
            "FAM-PELICULAS"
        );

        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            MaterialCategoryType.FILM,
            null,
            null,
            null,
            filmDto,
            null
        );

        onboardingService.createMaterialWithStock(request);

        verify(filmService).createFilm(filmDto);
        verify(stockService).provisionStockItem(materialId, BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando categoria divergir do bloco técnico enviado")
    void shouldRejectMismatchedCategoryAndPayload() {
        GlassCreateDTO glassDto = new GlassCreateDTO(
            "VIDRO 8MM",
            "INCOLOR",
            "70071900",
            new BigDecimal("8"),
            new BigDecimal("100.00"),
            new BigDecimal("180.00"),
            null,
            null,
            null
        );

        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            MaterialCategoryType.PROFILE,
            null,
            glassDto,
            null,
            null,
            null
        );

        assertThatThrownBy(() -> onboardingService.createMaterialWithStock(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("não correspondem à categoria");
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando categoryType for nulo")
    void shouldThrowExceptionWhenCategoryTypeIsNull() {
        MaterialWithStockCreateRequestDTO request = new MaterialWithStockCreateRequestDTO(
            null,
            null,
            null,
            null,
            null,
            null
        );

        assertThatThrownBy(() -> onboardingService.createMaterialWithStock(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("A categoria do material é obrigatória.");
    }

    private StockItemResponseDTO buildStockItem(
            UUID materialId, BigDecimal physical, BigDecimal minimumStock) {
        return new StockItemResponseDTO(
            UUID.randomUUID(),
            materialId,
            "SKU-TEST",
            "Material Teste",
            "PROFILE",
            "UN",
            physical,
            BigDecimal.ZERO,
            physical,
            minimumStock,
            StockAlertStatus.IN_STOCK,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
    }
}
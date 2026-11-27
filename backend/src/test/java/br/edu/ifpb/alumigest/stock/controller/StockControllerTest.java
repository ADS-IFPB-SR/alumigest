package br.edu.ifpb.alumigest.stock.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.domain.StockSortField;
import br.edu.ifpb.alumigest.stock.dto.MaterialWithStockResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockBalanceFilter;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.service.MaterialOnboardingService;
import br.edu.ifpb.alumigest.stock.service.StockService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockController — Testes de Integração e Endpoints REST (US-21 e US-22)")
class StockControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private StockService stockService;

    @Mock
    private MaterialOnboardingService materialOnboardingService;

    @InjectMocks
    private StockController stockController;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(stockController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .setValidator(validator)
            .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    private StockItemResponseDTO sampleItem(
            String sku,
            String name,
            String category,
            BigDecimal available,
            StockAlertStatus status) {
        return new StockItemResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            sku,
            name,
            category,
            "M2",
            new BigDecimal("10.0000"),
            new BigDecimal("10.0000").subtract(available),
            available,
            new BigDecimal("5.0000"),
            status,
            OffsetDateTime.now()
        );
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock sem filtros deve usar ordenação NAME")
    void shouldListAllBalancesWithDefaultSortWhenNoParamsProvided() throws Exception {
        StockItemResponseDTO item = sampleItem(
            "VID-008",
            "Vidro Temperado 8mm",
            "GLASS",
            new BigDecimal("8.0000"),
            StockAlertStatus.IN_STOCK
        );
        when(stockService.listStockBalances(any())).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/stock"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].materialSku", is("VID-008")))
            .andExpect(jsonPath("$[0].alertStatus", is("IN_STOCK")));

        ArgumentCaptor<StockBalanceFilter> captor =
            ArgumentCaptor.forClass(StockBalanceFilter.class);
        verify(stockService).listStockBalances(captor.capture());
        StockBalanceFilter captured = captor.getValue();
        org.assertj.core.api.Assertions.assertThat(captured.effectiveSort())
            .isEqualTo(StockSortField.NAME);
        org.assertj.core.api.Assertions.assertThat(captured.needsPurchase()).isNull();
        org.assertj.core.api.Assertions.assertThat(captured.belowMinStock()).isNull();
    }

    @Test
    @DisplayName("[Tabela de Decisão] GET /api/v1/stock deve encaminhar needsPurchase, belowMinStock e sort")
    void shouldForwardProcurementFiltersAndSortToService() throws Exception {
        StockItemResponseDTO deficit = sampleItem(
            "PER-001",
            "Perfil Suprema",
            "PROFILE",
            new BigDecimal("-6.0000"),
            StockAlertStatus.NEED_PURCHASE
        );
        when(stockService.listStockBalances(any())).thenReturn(List.of(deficit));

        mockMvc.perform(get("/api/v1/stock")
                .param("category", "PROFILE")
                .param("needsPurchase", "true")
                .param("belowMinStock", "true")
                .param("search", "Suprema")
                .param("sort", "CRITICALITY"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].alertStatus", is("NEED_PURCHASE")));

        ArgumentCaptor<StockBalanceFilter> captor =
            ArgumentCaptor.forClass(StockBalanceFilter.class);
        verify(stockService).listStockBalances(captor.capture());
        StockBalanceFilter filter = captor.getValue();
        org.assertj.core.api.Assertions.assertThat(filter.category()).isEqualTo("PROFILE");
        org.assertj.core.api.Assertions.assertThat(filter.needsPurchase()).isTrue();
        org.assertj.core.api.Assertions.assertThat(filter.belowMinStock()).isTrue();
        org.assertj.core.api.Assertions.assertThat(filter.search()).isEqualTo("Suprema");
        org.assertj.core.api.Assertions.assertThat(filter.sort())
            .isEqualTo(StockSortField.CRITICALITY);
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock deve retornar 422 para sort fora da whitelist")
    void shouldReturnUnprocessableEntityWhenSortParamIsInvalid() throws Exception {
        mockMvc.perform(get("/api/v1/stock").param("sort", "DROP_TABLE"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.message").exists());

        verifyNoInteractions(stockService);
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock/movements com materialId retorna extrato")
    void shouldListKardexMovementsFilteredByMaterial() throws Exception {
        UUID materialId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        StockMovementResponseDTO reservation = new StockMovementResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            materialId,
            "PER-SUP-01",
            "Perfil Suprema 6m",
            "BARRA_6M",
            StockMovementType.PRODUCTION_RESERVATION,
            new BigDecimal("6.0000"),
            null,
            new BigDecimal("2.0000"),
            new BigDecimal("2.0000"),
            new BigDecimal("2.0000"),
            new BigDecimal("8.0000"),
            orderId,
            "OS-2026-0088",
            "Reserva automática O.S.",
            "SYSTEM",
            OffsetDateTime.now()
        );
        when(stockService.listMovements(materialId)).thenReturn(List.of(reservation));

        mockMvc.perform(get("/api/v1/stock/movements").param("materialId", materialId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].materialSku", is("PER-SUP-01")))
            .andExpect(jsonPath("$[0].unitMeasure", is("BARRA_6M")))
            .andExpect(jsonPath("$[0].type", is("PRODUCTION_RESERVATION")))
            .andExpect(jsonPath("$[0].referenceDocument", is("OS-2026-0088")))
            .andExpect(jsonPath("$[0].orderId", is(orderId.toString())));

        verify(stockService).listMovements(materialId);
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock/movements sem filtro lista todas")
    void shouldListAllKardexMovementsWhenMaterialIdOmitted() throws Exception {
        StockMovementResponseDTO entry = new StockMovementResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            UUID.randomUUID(),
            "VID-008",
            "Vidro 8mm Incolor",
            "M2",
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10.0000"),
            new BigDecimal("138.50"),
            BigDecimal.ZERO,
            new BigDecimal("10.0000"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            "Asa #1024",
            "Compra de reposição",
            "Almoxarife",
            OffsetDateTime.now()
        );
        when(stockService.listMovements(null)).thenReturn(List.of(entry));

        mockMvc.perform(get("/api/v1/stock/movements"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].type", is("PURCHASE_ENTRY")))
            .andExpect(jsonPath("$[0].unitCost", is(138.50)));

        verify(stockService).listMovements(null);
    }

    @Test
    @DisplayName("[Análise de Valor Limite] GET /api/v1/stock/movements vazio retorna 200 OK")
    void shouldReturnEmptyListWhenMaterialHasNoMovements() throws Exception {
        UUID materialId = UUID.randomUUID();
        when(stockService.listMovements(materialId)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/stock/movements").param("materialId", materialId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));

        verify(stockService).listMovements(materialId);
    }

    @Test
    @DisplayName("[Partição de Equivalência] POST /api/v1/stock/movements aceita documento livre via alias documentNumber (RN-05) e unitCost positivo (RN-06)")
    void shouldRegisterPurchaseEntryWithFreeDocumentAndUnitCost() throws Exception {
        UUID materialId = UUID.randomUUID();
        UUID movementId = UUID.randomUUID();
        UUID stockItemId = UUID.randomUUID();

        StockMovementResponseDTO response = new StockMovementResponseDTO(
            movementId,
            stockItemId,
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
            "Reposição de estoque",
            "almoxarifado",
            OffsetDateTime.now(ZoneOffset.UTC)
        );
        when(stockService.registerMovement(any(StockMovementRequestDTO.class))).thenReturn(response);

        String payload = """
            {
              "materialId": "%s",
              "type": "PURCHASE_ENTRY",
              "quantity": 10,
              "unitCost": 145.00,
              "supplier": "Distribuidora Asa",
              "documentNumber": "Pedido 1088",
              "reason": "Reposição de estoque",
              "registeredBy": "almoxarifado"
            }
            """.formatted(materialId);

        mockMvc.perform(post("/api/v1/stock/movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(movementId.toString())))
            .andExpect(jsonPath("$.type", is("PURCHASE_ENTRY")))
            .andExpect(jsonPath("$.unitCost", is(145.00)))
            .andExpect(jsonPath("$.referenceDocument", is("Pedido 1088")))
            .andExpect(jsonPath("$.supplier", is("Distribuidora Asa")));

        ArgumentCaptor<StockMovementRequestDTO> captor =
            ArgumentCaptor.forClass(StockMovementRequestDTO.class);
        verify(stockService).registerMovement(captor.capture());
        assertThat(captor.getValue().referenceDocument()).isEqualTo("Pedido 1088");
        assertThat(captor.getValue().supplier()).isEqualTo("Distribuidora Asa");
        assertThat(captor.getValue().unitCost()).isEqualByComparingTo("145.00");
    }

    @Test
    @DisplayName("[Tabela de Decisão] POST /api/v1/stock/movements retorna 422 quando PURCHASE_ENTRY omite unitCost (RN-06)")
    void shouldReturnUnprocessableEntityWhenPurchaseEntryMissingUnitCost() throws Exception {
        UUID materialId = UUID.randomUUID();
        when(stockService.registerMovement(any(StockMovementRequestDTO.class)))
            .thenThrow(new BusinessException(
                "O preço de compra unitário (unitCost) é obrigatório para entradas de compra (RN-06)."
            ));

        String payload = """
            {
              "materialId": "%s",
              "type": "PURCHASE_ENTRY",
              "quantity": 5,
              "referenceDocument": "Recibo Loja 442",
              "reason": "Compra sem custo unitário"
            }
            """.formatted(materialId);

        mockMvc.perform(post("/api/v1/stock/movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] POST /api/v1/stock/movements retorna 400 quando unitCost é zero")
    void shouldReturnBadRequestWhenUnitCostIsZero() throws Exception {
        UUID materialId = UUID.randomUUID();
        String payload = """
            {
              "materialId": "%s",
              "type": "PURCHASE_ENTRY",
              "quantity": 5,
              "unitCost": 0,
              "referenceDocument": "Pedido 1089"
            }
            """.formatted(materialId);

        mockMvc.perform(post("/api/v1/stock/movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(stockService);
    }

    @Test
    @DisplayName("[Partição de Equivalência] POST /api/v1/stock/materials cadastra material com entrada inicial atômica (2 em 1)")
    void shouldCreateMaterialWithInitialStock() throws Exception {
        UUID materialId = UUID.randomUUID();
        UUID stockItemId = UUID.randomUUID();
        UUID movementId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        StockItemResponseDTO stockItem = new StockItemResponseDTO(
            stockItemId,
            materialId,
            "ALU-SUP-105",
            "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO",
            "PROFILE",
            "BARRA_6M",
            new BigDecimal("10.0000"),
            BigDecimal.ZERO,
            new BigDecimal("10.0000"),
            new BigDecimal("4.0000"),
            StockAlertStatus.IN_STOCK,
            now
        );

        StockMovementResponseDTO movement = new StockMovementResponseDTO(
            movementId,
            stockItemId,
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

        MaterialWithStockResponseDTO response = new MaterialWithStockResponseDTO(
            materialId,
            MaterialCategoryType.PROFILE,
            Map.of("id", materialId.toString(), "name", "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO"),
            stockItem,
            movement
        );
        when(materialOnboardingService.createMaterialWithStock(any())).thenReturn(response);

        String payload = """
            {
              "categoryType": "PROFILE",
              "aluminumProfile": {
                "name": "PERFIL GUIA SUPERIOR 2 VIAS 6M BRANCO",
                "commercialReference": "ALU-SUP-105",
                "commercialLine": "SUPREMA",
                "ncmCode": "76042100",
                "colorFinish": "BRANCO",
                "standardLengthM": 6,
                "costPrice": 145.00,
                "salePrice": 42.00,
                "weight": 0.920,
                "familyCode": "FAM-SUPREMA",
                "isHandle": false
              },
              "initialStock": {
                "quantity": 10,
                "unitCost": 145.00,
                "minimumStock": 4,
                "supplier": "Distribuidora Asa",
                "referenceDocument": "Pedido 1088",
                "reason": "Entrada inicial no cadastro do material",
                "registeredBy": "almoxarifado"
              }
            }
            """;

        mockMvc.perform(post("/api/v1/stock/materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.materialId", is(materialId.toString())))
            .andExpect(jsonPath("$.categoryType", is("PROFILE")))
            .andExpect(jsonPath("$.stockItem.physicalQuantity", is(10.0)))
            .andExpect(jsonPath("$.stockItem.minimumStock", is(4.0)))
            .andExpect(jsonPath("$.initialMovement.type", is("PURCHASE_ENTRY")))
            .andExpect(jsonPath("$.initialMovement.supplier", is("Distribuidora Asa")))
            .andExpect(jsonPath("$.initialMovement.referenceDocument", is("Pedido 1088")));

        verify(materialOnboardingService).createMaterialWithStock(any());
    }

    @Test
    @DisplayName("[Partição de Equivalência] POST /api/v1/stock/materials cadastra material sem entrada inicial provisionando saldo zerado")
    void shouldCreateMaterialWithoutInitialStock() throws Exception {
        UUID materialId = UUID.randomUUID();
        StockItemResponseDTO stockItem = new StockItemResponseDTO(
            UUID.randomUUID(),
            materialId,
            "ALU-PUX-201",
            "PERFIL PUXADOR CAVA 6M PRETO",
            "PROFILE",
            "BARRA_6M",
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            StockAlertStatus.IN_STOCK,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
        MaterialWithStockResponseDTO response = new MaterialWithStockResponseDTO(
            materialId,
            MaterialCategoryType.PROFILE,
            Map.of("id", materialId.toString()),
            stockItem,
            null
        );
        when(materialOnboardingService.createMaterialWithStock(any())).thenReturn(response);

        String payload = """
            {
              "categoryType": "PROFILE",
              "aluminumProfile": {
                "name": "PERFIL PUXADOR CAVA 6M PRETO",
                "commercialReference": "ALU-PUX-201",
                "commercialLine": "SUPREMA",
                "ncmCode": "76042100",
                "colorFinish": "PRETO",
                "standardLengthM": 6,
                "costPrice": 160.00,
                "salePrice": 48.00,
                "weight": 1.050,
                "isHandle": true
              },
              "initialStock": null
            }
            """;

        mockMvc.perform(post("/api/v1/stock/materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.stockItem.physicalQuantity", is(0)))
            .andExpect(jsonPath("$.initialMovement").doesNotExist());

        verify(materialOnboardingService).createMaterialWithStock(any());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] POST /api/v1/stock/materials retorna 400 quando initialStock omite unitCost (RN-06)")
    void shouldReturnBadRequestWhenInitialStockMissingUnitCost() throws Exception {
        String payload = """
            {
              "categoryType": "PROFILE",
              "aluminumProfile": {
                "name": "PERFIL TESTE RN06",
                "commercialReference": "ALU-SUP-999",
                "commercialLine": "SUPREMA",
                "ncmCode": "76042100",
                "colorFinish": "BRANCO",
                "standardLengthM": 6,
                "costPrice": 145.00,
                "salePrice": 42.00,
                "weight": 0.920,
                "isHandle": false
              },
              "initialStock": {
                "quantity": 10,
                "minimumStock": 4,
                "supplier": "Distribuidora Asa",
                "referenceDocument": "Pedido 1088"
              }
            }
            """;

        mockMvc.perform(post("/api/v1/stock/materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(materialOnboardingService);
    }

    @Test
    @DisplayName("[Partição de Equivalência] POST /api/v1/stock/materials retorna 400 quando categoryType não é informado")
    void shouldReturnBadRequestWhenCategoryTypeIsMissing() throws Exception {
        String payload = """
            {
              "initialStock": null
            }
            """;

        mockMvc.perform(post("/api/v1/stock/materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(materialOnboardingService);
    }

    @Nested
    @DisplayName("POST /api/v1/stock/movements — Registro de Movimentações Manuais")
    class RegisterMovementEndpointTests {

        @Test
        @DisplayName("Deve retornar 201 Created ao registrar perda de sucata com justificativa válida (SCRAP_LOSS)")
        void shouldReturn201WhenRegisteringScrapLossSuccessfully() throws Exception {
            UUID materialId = UUID.randomUUID();
            UUID movementId = UUID.randomUUID();

            StockMovementRequestDTO request = new StockMovementRequestDTO(
                materialId,
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("2.50"),
                null,
                "Vidro quebrado durante transporte para a bancada",
                "OS-2026-0089",
                "operador-oficina"
            );

            UUID stockItemId = UUID.randomUUID();
            StockMovementResponseDTO response = new StockMovementResponseDTO(
                movementId,
                stockItemId,
                materialId,
                "VID-001",
                "Vidro Incolor 8mm",
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("2.50"),
                new BigDecimal("10.00"),
                new BigDecimal("7.50"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "OS-2026-0089",
                "Vidro quebrado durante transporte para a bancada",
                "operador-oficina",
                OffsetDateTime.now()
            );

            when(stockService.registerMovement(any(StockMovementRequestDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(movementId.toString())))
                .andExpect(jsonPath("$.materialId", is(materialId.toString())))
                .andExpect(jsonPath("$.type", is("SCRAP_LOSS")))
                .andExpect(jsonPath("$.quantity", is(2.50)))
                .andExpect(jsonPath("$.previousPhysicalQuantity", is(10.00)))
                .andExpect(jsonPath("$.newPhysicalQuantity", is(7.50)))
                .andExpect(jsonPath("$.reason", is("Vidro quebrado durante transporte para a bancada")));
        }

        @Test
        @DisplayName("Deve retornar 201 Created ao registrar entrada de compras (PURCHASE_ENTRY)")
        void shouldReturn201WhenRegisteringPurchaseEntrySuccessfully() throws Exception {
            UUID materialId = UUID.randomUUID();
            UUID movementId = UUID.randomUUID();

            StockMovementRequestDTO request = new StockMovementRequestDTO(
                materialId,
                StockMovementType.PURCHASE_ENTRY,
                new BigDecimal("10.00"),
                new BigDecimal("45.50"),
                "Entrada de lote fornecedor",
                "NF-8842",
                "almoxarife"
            );

            UUID stockItemId = UUID.randomUUID();
            StockMovementResponseDTO response = new StockMovementResponseDTO(
                movementId,
                stockItemId,
                materialId,
                "ALU-SUP-01",
                "Perfil Montante 6m",
                StockMovementType.PURCHASE_ENTRY,
                new BigDecimal("10.00"),
                new BigDecimal("5.00"),
                new BigDecimal("15.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "NF-8842",
                "Entrada de lote fornecedor",
                "almoxarife",
                OffsetDateTime.now()
            );

            when(stockService.registerMovement(any(StockMovementRequestDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(movementId.toString())))
                .andExpect(jsonPath("$.type", is("PURCHASE_ENTRY")))
                .andExpect(jsonPath("$.quantity", is(10.00)))
                .andExpect(jsonPath("$.newPhysicalQuantity", is(15.00)));
        }

        @Test
        @DisplayName("RN-03: Deve retornar 422 Unprocessable Entity quando perda ultrapassar saldo físico")
        void shouldReturn422WhenScrapLossExceedsPhysicalQuantity() throws Exception {
            UUID materialId = UUID.randomUUID();

            StockMovementRequestDTO request = new StockMovementRequestDTO(
                materialId,
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("12.00"),
                null,
                "Quebra acidental",
                null,
                "operador-1"
            );

            when(stockService.registerMovement(any(StockMovementRequestDTO.class)))
                .thenThrow(new BusinessException(
                    "Saldo físico insuficiente para o material 'Vidro 8mm'. Disponível fisicamente: 5.00"
                ));

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status", is(422)))
                .andExpect(jsonPath("$.message", is(
                    "Saldo físico insuficiente para o material 'Vidro 8mm'. Disponível fisicamente: 5.00"
                )));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request quando SCRAP_LOSS tiver justificativa em branco")
        void shouldReturn400WhenScrapLossHasBlankReason() throws Exception {
            UUID materialId = UUID.randomUUID();

            StockMovementRequestDTO request = new StockMovementRequestDTO(
                materialId,
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("2.00"),
                null,
                "   ",
                null,
                "operador-1"
            );

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request quando a quantidade for zero ou negativa")
        void shouldReturn400WhenQuantityIsZeroOrNegative() throws Exception {
            UUID materialId = UUID.randomUUID();

            StockMovementRequestDTO requestZero = new StockMovementRequestDTO(
                materialId,
                StockMovementType.SCRAP_LOSS,
                BigDecimal.ZERO,
                null,
                "Justificativa válida",
                null,
                "operador-1"
            );

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestZero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request quando materialId for nulo")
        void shouldReturn400WhenMaterialIdIsNull() throws Exception {
            StockMovementRequestDTO request = new StockMovementRequestDTO(
                null,
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("1.00"),
                null,
                "Justificativa válida",
                null,
                "operador-1"
            );

            mockMvc.perform(post("/api/v1/stock/movements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/stock — Consultas de Saldos e Kardex")
    class QueryEndpointTests {

        @Test
        @DisplayName("Deve retornar 200 OK com lista de saldos consolidados")
        void shouldReturn200AndListOfBalances() throws Exception {
            UUID materialId = UUID.randomUUID();
            StockItemResponseDTO item = new StockItemResponseDTO(
                UUID.randomUUID(),
                materialId,
                "VID-001",
                "Vidro Incolor 8mm",
                "GLASS",
                "m²",
                new BigDecimal("20.00"),
                new BigDecimal("5.00"),
                new BigDecimal("15.00"),
                new BigDecimal("4.00"),
                StockAlertStatus.IN_STOCK,
                OffsetDateTime.now()
            );

            when(stockService.listStockBalances(any())).thenReturn(List.of(item));

            mockMvc.perform(get("/api/v1/stock")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].materialId", is(materialId.toString())))
                .andExpect(jsonPath("$[0].materialSku", is("VID-001")))
                .andExpect(jsonPath("$[0].availableQuantity", is(15.00)))
                .andExpect(jsonPath("$[0].alertStatus", is("IN_STOCK")));
        }

        @Test
        @DisplayName("Deve retornar 200 OK com saldo de material específico")
        void shouldReturn200AndBalanceForSpecificMaterial() throws Exception {
            UUID materialId = UUID.randomUUID();
            StockItemResponseDTO item = new StockItemResponseDTO(
                UUID.randomUUID(),
                materialId,
                "ALU-001",
                "Perfil Linha Suprema",
                "PROFILE",
                "barras",
                new BigDecimal("10.00"),
                BigDecimal.ZERO,
                new BigDecimal("10.00"),
                new BigDecimal("2.00"),
                StockAlertStatus.IN_STOCK,
                OffsetDateTime.now()
            );

            when(stockService.getStockBalance(materialId)).thenReturn(item);

            mockMvc.perform(get("/api/v1/stock/materials/{id}", materialId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.materialId", is(materialId.toString())))
                .andExpect(jsonPath("$.materialSku", is("ALU-001")))
                .andExpect(jsonPath("$.physicalQuantity", is(10.00)));
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found quando material não for encontrado no estoque")
        void shouldReturn404WhenMaterialNotFound() throws Exception {
            UUID materialId = UUID.randomUUID();
            when(stockService.getStockBalance(materialId))
                .thenThrow(new ResourceNotFoundException("Item de estoque", materialId.toString()));

            mockMvc.perform(get("/api/v1/stock/materials/{id}", materialId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
        }

        @Test
        @DisplayName("Deve retornar 200 OK com histórico Kardex de movimentações")
        void shouldReturn200AndListOfMovements() throws Exception {
            UUID materialId = UUID.randomUUID();
            UUID movementId = UUID.randomUUID();
            UUID stockItemId = UUID.randomUUID();
            StockMovementResponseDTO movement = new StockMovementResponseDTO(
                movementId,
                stockItemId,
                materialId,
                "VID-001",
                "Vidro 8mm",
                StockMovementType.SCRAP_LOSS,
                new BigDecimal("1.50"),
                new BigDecimal("8.00"),
                new BigDecimal("6.50"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                null,
                "Perda em corte",
                "operador",
                OffsetDateTime.now()
            );

            when(stockService.listMovements(materialId)).thenReturn(List.of(movement));

            mockMvc.perform(get("/api/v1/stock/movements")
                    .param("materialId", materialId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].type", is("SCRAP_LOSS")))
                .andExpect(jsonPath("$[0].quantity", is(1.50)));
        }
    }
}

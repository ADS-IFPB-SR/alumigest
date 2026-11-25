package br.edu.ifpb.alumigest.stock.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.service.StockService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockController — Testes de Integração REST (US-21.7)")
class StockControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private StockService stockService;

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

            when(stockService.listStockBalances()).thenReturn(List.of(item));

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

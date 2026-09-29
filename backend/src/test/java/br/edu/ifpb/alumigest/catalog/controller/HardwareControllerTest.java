package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.service.HardwareService;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("HardwareController — Testes de Integração Web (MockMvc)")
class HardwareControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private HardwareService hardwareService;

    @InjectMocks
    private HardwareController hardwareController;

    private static final UUID HARDWARE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(hardwareController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    private HardwareResponseDTO createSampleResponse(UUID id, String name, UnitMeasure unit) {
        return new HardwareResponseDTO(
                id,
                "SKU-FER-01",
                name,
                unit,
                CalculationType.UNIT,
                "83024100",
                new BigDecimal("12.00"),
                new BigDecimal("28.00"),
                true,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                "FAM-FERRAGEM",
                false
        );
    }

    @Nested
    @DisplayName("Criação de Ferragens (POST)")
    class CreateTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Payload Válido] Deve retornar 201 CREATED")
        void shouldReturn201WhenCreatingValidHardware() throws Exception {
            // Given (Arrange) - Ordem correta: sku, name, unit, calcType, costPrice, salePrice, ncm, family, isHandle
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "FER-ROLD-01",
                    "Roldana Dupla",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("10.00"),
                    new BigDecimal("25.00"),
                    "83024100",
                    "FAM-FERRAGEM",
                    false
            );

            HardwareResponseDTO response = createSampleResponse(HARDWARE_ID, "Roldana Dupla", UnitMeasure.UN);
            when(hardwareService.create(any(HardwareRequestDTO.class))).thenReturn(response);

            // When (Act) & Then (Assert)
            mockMvc.perform(post("/api/v1/catalog/hardware")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(HARDWARE_ID.toString()))
                    .andExpect(jsonPath("$.data.name").value("Roldana Dupla"));

            verify(hardwareService).create(any(HardwareRequestDTO.class));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Payload Inválido] Deve retornar 400 quando nome for nulo")
        void shouldReturn400WhenNameIsNull() throws Exception {
            String invalidJson = """
                    {
                        "skuCode": "FER-01",
                        "name": null,
                        "unitMeasure": "UN",
                        "calculationType": "UNIT",
                        "costPrice": 10.0,
                        "salePrice": 20.0
                    }
                    """;

            mockMvc.perform(post("/api/v1/catalog/hardware")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));

            verifyNoInteractions(hardwareService);
        }
    }

    @Nested
    @DisplayName("Listagem de Ferragens (GET)")
    class FindAllTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Unidade Válida UN] Deve filtrar e retornar 200 OK")
        void shouldReturn200WithValidUnitMeasure() throws Exception {
            HardwareResponseDTO item = createSampleResponse(HARDWARE_ID, "Fechadura", UnitMeasure.UN);
            when(hardwareService.findAll(eq(UnitMeasure.UN), eq("Fechadura"), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 20), 1));

            mockMvc.perform(get("/api/v1/catalog/hardware")
                            .param("unitMeasure", "UN")
                            .param("name", "Fechadura"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content[0].name").value("Fechadura"));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Parâmetro Alternativo 'unit'] Deve aceitar 'unit=PAR'")
        void shouldAcceptAlternativeUnitParam() throws Exception {
            HardwareResponseDTO item = createSampleResponse(HARDWARE_ID, "Dobradiça", UnitMeasure.PAR);
            when(hardwareService.findAll(eq(UnitMeasure.PAR), isNull(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 20), 1));

            mockMvc.perform(get("/api/v1/catalog/hardware")
                            .param("unit", "PAR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].unitMeasure").value("PAR"));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Unidade Inválida] Deve retornar 400 Bad Request")
        void shouldReturn400WhenUnitMeasureIsInvalid() throws Exception {
            mockMvc.perform(get("/api/v1/catalog/hardware")
                            .param("unitMeasure", "KG"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Valores aceitos")));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Sem Filtro] Deve listar sem filtros quando parâmetros forem nulos")
        void shouldListWithoutFiltersWhenParamsNull() throws Exception {
            when(hardwareService.findAll(isNull(), isNull(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

            mockMvc.perform(get("/api/v1/catalog/hardware"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Busca por ID (GET /{id})")
    class FindByIdTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - ID Existente] Deve retornar 200 OK com os dados")
        void shouldReturn200WhenHardwareExists() throws Exception {
            HardwareResponseDTO response = createSampleResponse(HARDWARE_ID, "Puxador Inox", UnitMeasure.UN);
            when(hardwareService.findById(HARDWARE_ID)).thenReturn(response);

            mockMvc.perform(get("/api/v1/catalog/hardware/{id}", HARDWARE_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(HARDWARE_ID.toString()))
                    .andExpect(jsonPath("$.data.name").value("Puxador Inox"));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - ID Inexistente] Deve retornar 404 Not Found")
        void shouldReturn404WhenHardwareDoesNotExist() throws Exception {
            UUID unknownId = UUID.randomUUID();
            when(hardwareService.findById(unknownId))
                    .thenThrow(new ResourceNotFoundException("Ferragem não encontrada com o ID informado: " + unknownId));

            mockMvc.perform(get("/api/v1/catalog/hardware/{id}", unknownId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }
    }

    @Nested
    @DisplayName("Atualização de Preço (PUT /{id})")
    class UpdatePriceTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Atualização Válida] Deve retornar 200 OK")
        void shouldReturn200WhenUpdatingPrice() throws Exception {
            HardwareUpdatePriceDTO request = new HardwareUpdatePriceDTO(
                    "FER-PUX-01",
                    "Puxador Atualizado",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("15.00"),
                    new BigDecimal("35.00"),
                    "83024200",
                    true
            );

            HardwareResponseDTO response = createSampleResponse(HARDWARE_ID, "Puxador Atualizado", UnitMeasure.UN);
            when(hardwareService.updatePrice(eq(HARDWARE_ID), any(HardwareUpdatePriceDTO.class))).thenReturn(response);

            mockMvc.perform(put("/api/v1/catalog/hardware/{id}", HARDWARE_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }
    }

    @Nested
    @DisplayName("Exclusão Lógica (DELETE /{id})")
    class DeleteTests {

        @Test
        @DisplayName("[Técnica: Transição de Estados - Soft Delete] Deve retornar 204 No Content")
        void shouldReturn204WhenDeletingHardware() throws Exception {
            doNothing().when(hardwareService).softDelete(HARDWARE_ID);

            mockMvc.perform(delete("/api/v1/catalog/hardware/{id}", HARDWARE_ID))
                    .andExpect(status().isNoContent());

            verify(hardwareService).softDelete(HARDWARE_ID);
        }
    }
}

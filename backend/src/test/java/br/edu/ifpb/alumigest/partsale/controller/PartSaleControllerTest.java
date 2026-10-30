package br.edu.ifpb.alumigest.partsale.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleStatusUpdateRequest;
import br.edu.ifpb.alumigest.partsale.service.PartSaleService;
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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartSaleController [US-46] - MockMvc REST API Tests")
class PartSaleControllerTest {

  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  @Mock
  private PartSaleService partSaleService;

  @InjectMocks
  private PartSaleController partSaleController;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(partSaleController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
    objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
  }

  @Nested
  @DisplayName("POST /api/v1/part-sales/calculate-item")
  class CalculateItemEndpoint {

    @Test
    @DisplayName("Deve retornar 200 com item de ferragem calculado com sucesso (US-46.1)")
    void shouldCalculateHardwareItemSuccessfully() throws Exception {
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.HARDWARE,
          null,
          null,
          4,
          new BigDecimal("50.00"),
          null
      );

      CalculatePartItemResponse response = new CalculatePartItemResponse(
          new BigDecimal("4.0000"),
          new BigDecimal("50.00"),
          new BigDecimal("200.00")
      );

      when(partSaleService.calculateItem(any(CalculatePartItemRequest.class))).thenReturn(response);

      mockMvc.perform(post("/api/v1/part-sales/calculate-item")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.calculatedUnitMeasure").value(4.0))
          .andExpect(jsonPath("$.unitPrice").value(50.00))
          .andExpect(jsonPath("$.totalPrice").value(200.00));
    }

    @Test
    @DisplayName("Deve calcular com sucesso item de perfil de alumínio e retornar 200 OK (US-46.2)")
    void deveRetornar200ECalculoCorretoParaPerfilDeAluminio() throws Exception {
      // 2500 mm * 4 peças com 5% de perda (0.05) = 10.5000 m faturáveis * 45.00 = R$ 472,50
      CalculatePartItemRequest request = new CalculatePartItemRequest(
          MaterialCategoryType.PROFILE,
          null,
          2500,
          4,
          new BigDecimal("45.00"),
          new BigDecimal("0.05")
      );

      CalculatePartItemResponse response = new CalculatePartItemResponse(
          new BigDecimal("10.5000"),
          new BigDecimal("45.00"),
          new BigDecimal("472.50")
      );

      when(partSaleService.calculateItem(any(CalculatePartItemRequest.class))).thenReturn(response);

      mockMvc.perform(post("/api/v1/part-sales/calculate-item")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.calculatedUnitMeasure", is(10.5)))
          .andExpect(jsonPath("$.unitPrice", is(45.0)))
          .andExpect(jsonPath("$.totalPrice", is(472.5)));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "{\"category\": null, \"quantity\": 2, \"unitPrice\": 10.00}",
        "{\"category\": \"HARDWARE\", \"quantity\": 0, \"unitPrice\": 10.00}",
        "{\"category\": \"HARDWARE\", \"quantity\": 1, \"unitPrice\": -5.00}"
    })
    @DisplayName("Deve retornar 400 Bad Request para payloads de cálculo inválidos")
    void shouldReturn400ForInvalidCalculatePayloads(String invalidJson) throws Exception {
      mockMvc.perform(post("/api/v1/part-sales/calculate-item")
              .contentType(MediaType.APPLICATION_JSON)
              .content(invalidJson))
          .andExpect(status().isBadRequest());
    }
  }

  @Nested
  @DisplayName("POST /api/v1/part-sales")
  class CreateEndpoint {

    @Test
    @DisplayName("Deve retornar 201 com cabeçalho Location e dados da venda criada")
    void shouldCreatePartSaleSuccessfully() throws Exception {
      UUID clientId = UUID.randomUUID();
      UUID saleId = UUID.randomUUID();

      CreatePartSaleRequest request = new CreatePartSaleRequest(
          clientId,
          PartSaleStatus.DRAFT,
          new BigDecimal("10.00"),
          List.of(new CreatePartSaleItemRequest(
              MaterialCategoryType.HARDWARE,
              UUID.randomUUID(),
              2,
              null,
              null,
              new BigDecimal("25.00")
          ))
      );

      PartSaleResponse response = new PartSaleResponse(
          saleId,
          "VP-2026-0001",
          clientId,
          "Cliente Teste",
          PartSaleStatus.DRAFT,
          new BigDecimal("50.00"),
          new BigDecimal("10.00"),
          new BigDecimal("40.00"),
          List.of(),
          OffsetDateTime.now(),
          OffsetDateTime.now()
      );

      when(partSaleService.create(any(CreatePartSaleRequest.class))).thenReturn(response);

      mockMvc.perform(post("/api/v1/part-sales")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isCreated())
          .andExpect(header().string("Location", "http://localhost/api/v1/part-sales/" + saleId))
          .andExpect(jsonPath("$.code").value("VP-2026-0001"))
          .andExpect(jsonPath("$.totalAmount").value(40.00));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "{\"clientId\": null, \"items\": [{\"materialType\": \"HARDWARE\", \"referenceId\": \"11111111-1111-1111-1111-111111111111\", \"quantity\": 1, \"unitPrice\": 10.00}]}",
        "{\"clientId\": \"11111111-1111-1111-1111-111111111111\", \"items\": []}",
        "{\"clientId\": \"11111111-1111-1111-1111-111111111111\", \"discountAmount\": -10.00, \"items\": [{\"materialType\": \"HARDWARE\", \"referenceId\": \"11111111-1111-1111-1111-111111111111\", \"quantity\": 1, \"unitPrice\": 10.00}]}"
    })
    @DisplayName("Deve retornar 400 Bad Request para payloads de criação inválidos")
    void shouldReturn400ForInvalidCreatePayloads(String invalidJson) throws Exception {
      mockMvc.perform(post("/api/v1/part-sales")
              .contentType(MediaType.APPLICATION_JSON)
              .content(invalidJson))
          .andExpect(status().isBadRequest());
    }
  }

  @Nested
  @DisplayName("GET /api/v1/part-sales/{id}")
  class FindByIdEndpoint {

    @Test
    @DisplayName("Deve retornar 200 OK com os detalhes da venda avulsa")
    void shouldReturn200WithPartSaleDetails() throws Exception {
      UUID saleId = UUID.randomUUID();
      UUID clientId = UUID.randomUUID();

      PartSaleResponse response = new PartSaleResponse(
          saleId,
          "VP-2026-0005",
          clientId,
          "Vidraçaria Silva",
          PartSaleStatus.DRAFT,
          new BigDecimal("100.00"),
          BigDecimal.ZERO,
          new BigDecimal("100.00"),
          List.of(),
          OffsetDateTime.now(),
          OffsetDateTime.now()
      );

      when(partSaleService.findById(saleId)).thenReturn(response);

      mockMvc.perform(get("/api/v1/part-sales/{id}", saleId)
              .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(saleId.toString()))
          .andExpect(jsonPath("$.code").value("VP-2026-0005"))
          .andExpect(jsonPath("$.clientName").value("Vidraçaria Silva"))
          .andExpect(jsonPath("$.status").value("DRAFT"))
          .andExpect(jsonPath("$.totalAmount").value(100.00));
    }

    @Test
    @DisplayName("Deve retornar 404 Not Found quando ID não for localizado")
    void shouldReturn404WhenPartSaleNotFound() throws Exception {
      UUID saleId = UUID.randomUUID();
      when(partSaleService.findById(saleId))
          .thenThrow(new ResourceNotFoundException("Venda de partes não encontrada com ID: " + saleId));

      mockMvc.perform(get("/api/v1/part-sales/{id}", saleId)
              .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.message").value("Venda de partes não encontrada com ID: " + saleId));
    }
  }

  @Nested
  @DisplayName("PATCH /api/v1/part-sales/{id}/status")
  class UpdateStatusEndpoint {

    @Test
    @DisplayName("Deve retornar 200 OK com status atualizado")
    void shouldUpdateStatusSuccessfully() throws Exception {
      UUID saleId = UUID.randomUUID();
      PartSaleStatusUpdateRequest request = new PartSaleStatusUpdateRequest(PartSaleStatus.APPROVED);

      PartSaleResponse response = new PartSaleResponse(
          saleId,
          "VP-2026-0001",
          UUID.randomUUID(),
          "Cliente Teste",
          PartSaleStatus.APPROVED,
          new BigDecimal("50.00"),
          BigDecimal.ZERO,
          new BigDecimal("50.00"),
          List.of(),
          OffsetDateTime.now(),
          OffsetDateTime.now()
      );

      when(partSaleService.updateStatus(saleId, PartSaleStatus.APPROVED)).thenReturn(response);

      mockMvc.perform(patch("/api/v1/part-sales/{id}/status", saleId)
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando status for nulo")
    void shouldReturn400WhenStatusIsNull() throws Exception {
      UUID saleId = UUID.randomUUID();
      String json = "{\"status\": null}";

      mockMvc.perform(patch("/api/v1/part-sales/{id}/status", saleId)
              .contentType(MediaType.APPLICATION_JSON)
              .content(json))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 404 Not Found ao tentar atualizar status de venda inexistente")
    void shouldReturn404WhenSaleToUpdateNotFound() throws Exception {
      UUID saleId = UUID.randomUUID();
      PartSaleStatusUpdateRequest request = new PartSaleStatusUpdateRequest(PartSaleStatus.APPROVED);

      when(partSaleService.updateStatus(saleId, PartSaleStatus.APPROVED))
          .thenThrow(new ResourceNotFoundException("Venda de partes não encontrada com ID: " + saleId));

      mockMvc.perform(patch("/api/v1/part-sales/{id}/status", saleId)
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.message").value("Venda de partes não encontrada com ID: " + saleId));
    }
  }
}

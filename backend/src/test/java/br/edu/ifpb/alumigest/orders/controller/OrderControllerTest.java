package br.edu.ifpb.alumigest.orders.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("OrderController - Testes de Integração WebMvc")
class OrderControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private OrderService orderService;

  @Nested
  @DisplayName("GET /api/v1/orders - Listar Pedidos Paginados (US-13.4)")
  class FindAllEndpointTests {

    @Test
    @DisplayName("Deve retornar status 200 OK e lista paginada de pedidos sumarizados")
    void shouldReturn200AndPageOfSummarizedOrders() throws Exception {
      UUID orderId = UUID.randomUUID();
      UUID budgetId = UUID.randomUUID();
      OrderSummaryResponse summary = new OrderSummaryResponse(
          orderId,
          "OS-2026-0001",
          budgetId,
          "Cliente Teste",
          "(83) 98888-7777",
          OrderStatus.WAITING_PRODUCTION,
          "Aguardando Produção",
          ApprovalChannel.WHATSAPP,
          "WhatsApp",
          LocalDate.now(),
          LocalDate.now().plusDays(10),
          new BigDecimal("1500.00"),
          2,
          OffsetDateTime.now()
      );

      PageResponse<OrderSummaryResponse> pageResponse = PageResponse.of(new PageImpl<>(List.of(summary)));
      when(orderService.findAll(any(), any(), any(), any())).thenReturn(pageResponse);

      mockMvc.perform(get("/api/v1/orders")
              .param("page", "0")
              .param("size", "10")
              .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.content[0].id").value(orderId.toString()))
          .andExpect(jsonPath("$.content[0].codigo").value("OS-2026-0001"))
          .andExpect(jsonPath("$.content[0].clienteNome").value("Cliente Teste"))
          .andExpect(jsonPath("$.content[0].status").value("WAITING_PRODUCTION"))
          .andExpect(jsonPath("$.content[0].canalAprovacao").value("WHATSAPP"))
          .andExpect(jsonPath("$.content[0].valorLiquido").value(1500.00));
    }

    @Test
    @DisplayName("Deve repassar filtros de status, canal e search para o service")
    void shouldPassFiltersToService() throws Exception {
      PageResponse<OrderSummaryResponse> emptyResponse = PageResponse.of(new PageImpl<>(Collections.emptyList()));
      when(orderService.findAll(any(), any(), any(), any())).thenReturn(emptyResponse);

      mockMvc.perform(get("/api/v1/orders")
              .param("status", "WAITING_PRODUCTION")
              .param("channel", "WHATSAPP")
              .param("search", "ORC-2026")
              .param("page", "1")
              .param("size", "20")
              .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk());

      verify(orderService).findAll(
          eq(OrderStatus.WAITING_PRODUCTION),
          eq(ApprovalChannel.WHATSAPP),
          eq("ORC-2026"),
          any()
      );
    }

    @Test
    @DisplayName("Deve aceitar alias 'busca' como fallback para busca textual")
    void shouldSupportBuscaAlias() throws Exception {
      PageResponse<OrderSummaryResponse> emptyResponse = PageResponse.of(new PageImpl<>(Collections.emptyList()));
      when(orderService.findAll(any(), any(), any(), any())).thenReturn(emptyResponse);

      mockMvc.perform(get("/api/v1/orders")
              .param("busca", "Empresa Silva")
              .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk());

      verify(orderService).findAll(
          isNull(),
          isNull(),
          eq("Empresa Silva"),
          any()
      );
    }
  }

  @Nested
  @DisplayName("GET /api/v1/orders/{id}")
  class FindByIdEndpointTests {

    @Test
    @DisplayName("Deve retornar status 200 OK e JSON do pedido com status WAITING_PRODUCTION")
    void shouldReturn200AndOrderResponse() throws Exception {
      UUID orderId = UUID.randomUUID();
      OrderResponse response = new OrderResponse(
          orderId,
          "OS-2026-0001",
          UUID.randomUUID(),
          null,
          "Cliente Teste",
          "(83) 98888-7777",
          "Av. Central, 500",
          OrderStatus.WAITING_PRODUCTION,
          "Aguardando Produção",
          ApprovalChannel.WHATSAPP,
          "WhatsApp",
          LocalDate.now(),
          LocalDate.now().plusDays(15),
          null,
          new BigDecimal("2500.00"),
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          new BigDecimal("2500.00"),
          "A vista",
          null,
          "Sem observacoes",
          null,
          OffsetDateTime.now(),
          OffsetDateTime.now(),
          true,
          Collections.emptyList()
      );

      when(orderService.findDetailedById(orderId)).thenReturn(response);

      mockMvc.perform(get("/api/v1/orders/{id}", orderId)
              .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(orderId.toString()))
          .andExpect(jsonPath("$.codigo").value("OS-2026-0001"))
          .andExpect(jsonPath("$.clienteNome").value("Cliente Teste"))
          .andExpect(jsonPath("$.status").value("WAITING_PRODUCTION"))
          .andExpect(jsonPath("$.valorLiquido").value(2500.00));
    }

    @Test
    @DisplayName("Deve retornar status 404 NOT FOUND quando pedido não existir")
    void shouldReturn404WhenOrderNotFound() throws Exception {
      UUID orderId = UUID.randomUUID();
      when(orderService.findDetailedById(orderId))
          .thenThrow(new ResourceNotFoundException("Pedido", orderId));

      mockMvc.perform(get("/api/v1/orders/{id}", orderId)
              .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isNotFound());
    }
  }

  @Nested
  @DisplayName("PATCH /api/v1/orders/{id}/cancel - Cancelar Pedido (US-13.5)")
  class CancelOrderEndpointTests {

    @Test
    @DisplayName("Deve retornar 200 OK e dados do pedido cancelado quando requisição for válida")
    void shouldReturn200WhenCancelOrderSuccessfully() throws Exception {
      UUID orderId = UUID.randomUUID();
      OrderResponse response = new OrderResponse(
          orderId,
          "OS-2026-0001",
          UUID.randomUUID(),
          null,
          "Cliente Teste",
          "(83) 98888-7777",
          "Av. Central, 500",
          OrderStatus.CANCELLED,
          "Cancelado",
          ApprovalChannel.WHATSAPP,
          "WhatsApp",
          LocalDate.now(),
          LocalDate.now().plusDays(15),
          null,
          new BigDecimal("2500.00"),
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          new BigDecimal("2500.00"),
          "A vista",
          null,
          "Sem observacoes",
          "Cliente solicitou cancelamento comercial.",
          OffsetDateTime.now(),
          OffsetDateTime.now(),
          true,
          Collections.emptyList()
      );

      when(orderService.cancelOrder(eq(orderId), any(OrderCancelRequest.class))).thenReturn(response);

      mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("{\"justificativa\":\"Cliente solicitou cancelamento comercial.\"}"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(orderId.toString()))
          .andExpect(jsonPath("$.status").value("CANCELLED"))
          .andExpect(jsonPath("$.justificativaCancelamento").value("Cliente solicitou cancelamento comercial."));
    }

    @Test
    @DisplayName("Deve retornar 400 BAD REQUEST quando a justificativa tiver menos de 10 caracteres")
    void shouldReturn400WhenJustificativaIsTooShort() throws Exception {
      UUID orderId = UUID.randomUUID();

      mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("{\"justificativa\":\"Curto\"}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.validationErrors[0].field").value("justificativa"));
    }

    @Test
    @DisplayName("Deve retornar 400 BAD REQUEST quando a justificativa for em branco ou nula")
    void shouldReturn400WhenJustificativaIsBlank() throws Exception {
      UUID orderId = UUID.randomUUID();

      mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("{\"justificativa\":\"   \"}"))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 404 NOT FOUND quando a ordem de serviço não for encontrada")
    void shouldReturn404WhenOrderNotFound() throws Exception {
      UUID orderId = UUID.randomUUID();
      when(orderService.cancelOrder(eq(orderId), any(OrderCancelRequest.class)))
          .thenThrow(new ResourceNotFoundException("Pedido", orderId));

      mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("{\"justificativa\":\"Cliente desistiu da compra por motivo financeiro.\"}"))
          .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve retornar 422 UNPROCESSABLE ENTITY quando status for inelegível para cancelamento")
    void shouldReturn422WhenOrderStatusCannotCancel() throws Exception {
      UUID orderId = UUID.randomUUID();
      when(orderService.cancelOrder(eq(orderId), any(OrderCancelRequest.class)))
          .thenThrow(new BusinessException("Não é possível cancelar um pedido no status Em Produção"));

      mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("{\"justificativa\":\"Tentativa de cancelamento tardio pelo cliente.\"}"))
          .andExpect(status().isUnprocessableEntity())
          .andExpect(jsonPath("$.message").value("Não é possível cancelar um pedido no status Em Produção"));
    }
  }
}
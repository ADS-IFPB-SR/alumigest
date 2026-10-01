package br.edu.ifpb.alumigest.orders.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
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
  @DisplayName("GET /api/v1/orders/{id}")
  class FindByIdEndpointTests {

    @Test
    @DisplayName("Deve retornar status 200 OK e JSON do pedido com status WAITING_PRODUCTION")
    void shouldReturn200AndOrderResponse() throws Exception {
      UUID orderId = UUID.randomUUID();
      OrderResponse response = new OrderResponse(
          orderId,
          "PED-2026-0001",
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
          .andExpect(jsonPath("$.codigo").value("PED-2026-0001"))
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
}
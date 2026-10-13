package br.edu.ifpb.alumigest.orders.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderServiceImpl - Testes Unitários")
class OrderServiceTest {

  @Mock
  private OrderRepository orderRepository;

  @Mock
  private OrderMapper orderMapper;

  @InjectMocks
  private OrderServiceImpl orderService;

  @Nested
  @DisplayName("Cenários de Busca Detalhada por ID")
  class FindDetailedByIdTests {

    @Test
    @DisplayName("Deve retornar OrderResponse quando pedido existir com status WAITING_PRODUCTION")
    void shouldReturnOrderResponseWhenOrderExists() {
      UUID orderId = UUID.randomUUID();
      Order order = Order.builder()
          .id(orderId)
          .codigo("OS-2026-0001")
          .clienteNome("Construtora Silva")
          .status(OrderStatus.WAITING_PRODUCTION)
          .canalAprovacao(ApprovalChannel.WHATSAPP)
          .valorBruto(new BigDecimal("1500.00"))
          .valorLiquido(new BigDecimal("1500.00"))
          .build();

      OrderResponse expectedResponse = new OrderResponse(
          orderId,
          "OS-2026-0001",
          UUID.randomUUID(),
          null,
          "Construtora Silva",
          "(83) 99999-8888",
          "Rua Projetada, 100",
          OrderStatus.WAITING_PRODUCTION,
          "Aguardando Produção",
          ApprovalChannel.WHATSAPP,
          "WhatsApp",
          LocalDate.now(),
          LocalDate.now().plusDays(15),
          null,
          new BigDecimal("1500.00"),
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          new BigDecimal("1500.00"),
          "50% entrada + 50% na entrega",
          null,
          "Instalação no 2º andar",
          null,
          OffsetDateTime.now(),
          OffsetDateTime.now(),
          true,
          Collections.emptyList()
      );

      when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
      when(orderMapper.toResponse(order)).thenReturn(expectedResponse);

      OrderResponse actual = orderService.findDetailedById(orderId);

      assertThat(actual).isNotNull();
      assertThat(actual.id()).isEqualTo(orderId);
      assertThat(actual.codigo()).isEqualTo("OS-2026-0001");
      assertThat(actual.status()).isEqualTo(OrderStatus.WAITING_PRODUCTION);
      assertThat(actual.clienteNome()).isEqualTo("Construtora Silva");
      verify(orderRepository).findByIdWithDetails(orderId);
      verify(orderMapper).toResponse(order);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando pedido não existir")
    void shouldThrowResourceNotFoundExceptionWhenOrderDoesNotExist() {
      UUID orderId = UUID.randomUUID();
      when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> orderService.findDetailedById(orderId))
          .isInstanceOf(ResourceNotFoundException.class)
          .hasMessageContaining(orderId.toString());

      verify(orderRepository).findByIdWithDetails(orderId);
    }
  }
}
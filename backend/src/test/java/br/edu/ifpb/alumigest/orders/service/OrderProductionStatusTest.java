package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderProductionStatusTest - Testes de Transição de Status de Produção (US-18.7)")
class OrderProductionStatusTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private OrderCodeGenerator orderCodeGenerator;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderPdfService orderPdfService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order order;
    private final UUID orderId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        order = Order.builder()
                .codigo("OS-2026-0001")
                .status(OrderStatus.WAITING_PRODUCTION)
                .build();
    }

    @Test
    @DisplayName("Deve transicionar de WAITING_PRODUCTION para IN_PRODUCTION com sucesso")
    void testTransitionToInProductionSuccess() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse mockResponse = new OrderResponse(
                orderId, "OS-2026-0001", null, null, null, null, null,
                OrderStatus.IN_PRODUCTION, "Em Produção", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, true, null);
        when(orderMapper.toResponse(order)).thenReturn(mockResponse);

        // Act
        OrderResponse result = orderService.updateStatus(orderId, OrderStatus.IN_PRODUCTION);

        // Assert
        assertThat(order.getStatus()).isEqualTo(OrderStatus.IN_PRODUCTION);
        assertThat(result.status()).isEqualTo(OrderStatus.IN_PRODUCTION);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Deve transicionar de IN_PRODUCTION para COMPLETED com sucesso registrando data de conclusão")
    void testTransitionToCompletedSuccess() {
        // Arrange
        order = Order.builder()
                .codigo("OS-2026-0001")
                .status(OrderStatus.IN_PRODUCTION)
                .build();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse mockResponse = new OrderResponse(
                orderId, "OS-2026-0001", null, null, null, null, null,
                OrderStatus.COMPLETED, "Concluído", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, true, null);
        when(orderMapper.toResponse(order)).thenReturn(mockResponse);

        // Act
        OrderResponse result = orderService.updateStatus(orderId, OrderStatus.COMPLETED);

        // Assert
        assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);
        assertThat(order.getDataConclusao()).isNotNull();
        assertThat(result.status()).isEqualTo(OrderStatus.COMPLETED);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar transicionar para WAITING_PRODUCTION")
    void testTransitionToWaitingProductionThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() -> orderService.updateStatus(orderId, OrderStatus.WAITING_PRODUCTION))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Não é permitida a transição para o status WAITING_PRODUCTION.");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar transicionar para CREATED")
    void testTransitionToCreatedThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() -> orderService.updateStatus(orderId, OrderStatus.CREATED))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Não é permitida a transição para o status CREATED.");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException se o targetStatus for nulo")
    void testTransitionToNullThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() -> orderService.updateStatus(orderId, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O status de destino é obrigatório.");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando o pedido não for encontrado")
    void testUpdateStatusOrderNotFoundThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.updateStatus(orderId, OrderStatus.IN_PRODUCTION))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar concluir pedido que ainda está em WAITING_PRODUCTION")
    void testTransitionDirectlyToCompletedThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() -> orderService.updateStatus(orderId, OrderStatus.COMPLETED))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Apenas pedidos em produção podem ser concluídos.");

        verify(orderRepository, never()).save(any());
    }
}

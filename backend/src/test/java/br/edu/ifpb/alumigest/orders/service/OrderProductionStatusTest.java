package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.orders.service.OrderPdfService;
import br.edu.ifpb.alumigest.orders.service.OrderServiceImpl;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.orders.service.OrderCodeGenerator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
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
        // Inicializa o pedido mockado antes de cada teste
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

        Order savedOrder = Order.builder().status(OrderStatus.IN_PRODUCTION).build();
        when(orderRepository.save(order)).thenReturn(savedOrder);

        // Criando um mock basico de OrderResponse para evitar NullPointer
        OrderResponse mockResponse = new OrderResponse(orderId, "OS-2026-0001", null, null, null, null, null, OrderStatus.IN_PRODUCTION, "Em Produção", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, true, null);
        when(orderMapper.toResponse(savedOrder)).thenReturn(mockResponse);

        // Act
        OrderResponse result = orderService.updateStatus(orderId, OrderStatus.IN_PRODUCTION);

        // Assert
        assertEquals(OrderStatus.IN_PRODUCTION, result.status());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Deve transicionar de IN_PRODUCTION para COMPLETED com sucesso")
    void testTransitionToCompletedSuccess() {
        // Arrange
        order = Order.builder().status(OrderStatus.IN_PRODUCTION).build();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        Order savedOrder = Order.builder().status(OrderStatus.COMPLETED).build();
        when(orderRepository.save(order)).thenReturn(savedOrder);

        OrderResponse mockResponse = new OrderResponse(orderId, "OS-2026-0001", null, null, null, null, null, OrderStatus.COMPLETED, "Concluído", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, true, null);
        when(orderMapper.toResponse(savedOrder)).thenReturn(mockResponse);

        // Act
        OrderResponse result = orderService.updateStatus(orderId, OrderStatus.COMPLETED);

        // Assert
        assertEquals(OrderStatus.COMPLETED, result.status());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar transicionar para WAITING_PRODUCTION")
    void testTransitionToWaitingProductionThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> orderService.updateStatus(orderId, OrderStatus.WAITING_PRODUCTION));

        assertEquals("Não é permitida a transição para o status WAITING_PRODUCTION.", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar transicionar para CREATED")
    void testTransitionToCreatedThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> orderService.updateStatus(orderId, OrderStatus.CREATED));

        assertEquals("Não é permitida a transição para o status CREATED.", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException se o targetStatus for nulo")
    void testTransitionToNullThrowsException() {
        // Arrange
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> orderService.updateStatus(orderId, null));

        assertEquals("O status de destino é obrigatório.", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }
}
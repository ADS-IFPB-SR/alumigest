package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * Testes unitários de {@link OrderServiceImpl}.
 * Técnicas: Partição de Equivalência, Análise de Valor Limite e Tabela de Decisão.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários: OrderServiceImpl")
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private OrderCodeGenerator orderCodeGenerator;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private UUID budgetId;
    private UUID orderId;
    private Budget budget;
    private Client client;
    private OrderConvertRequest request;

    @BeforeEach
    void setUp() {
        budgetId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        client = Client.builder()
                .fullName("Empresa XPTO Ltda")
                .phone("83988880000")
                .street("Rua Central")
                .number("500")
                .city("Campina Grande")
                .state("PB")
                .build();

        budget = new Budget();
        budget.setClient(client);
        budget.setStatus(BudgetStatus.APPROVED);
        budget.setSubtotal(new BigDecimal("5000.00"));
        budget.setDiscountValue(new BigDecimal("500.00"));
        budget.setTotal(new BigDecimal("4500.00"));
        budget.setItems(Collections.emptyList());

        request = new OrderConvertRequest(
                ApprovalChannel.WHATSAPP,
                LocalDate.now(ZoneOffset.UTC).plusDays(15),
                "Entregar no turno da manhã"
        );
    }

    // =========================================================================
    // convertBudgetToOrder — cenários de sucesso
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve converter orçamento APPROVED em pedido com sucesso")
    void shouldConvertApprovedBudgetToOrderSuccessfully() {
        // Arrange
        Order savedOrder = Order.builder()
                .id(orderId)
                .codigo("PED-2026-0001")
                .orcamentoId(budgetId)
                .clienteNome("Empresa XPTO Ltda")
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .status(OrderStatus.AGUARDANDO_PRODUCAO)
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .valorBruto(budget.getSubtotal())
                .valorDesconto(budget.getDiscountValue())
                .valorLiquido(budget.getTotal())
                .build();

        OrderResponse expectedResponse = new OrderResponse(
                orderId, "PED-2026-0001", budgetId, null,
                "Empresa XPTO Ltda", null, null,
                OrderStatus.AGUARDANDO_PRODUCAO, "Aguardando Produção",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(), null,
                budget.getSubtotal(), budget.getDiscountValue(), BigDecimal.ZERO, BigDecimal.ZERO,
                budget.getTotal(), null, null, null, null,
                OffsetDateTime.now(ZoneOffset.UTC), OffsetDateTime.now(ZoneOffset.UTC), true,
                Collections.emptyList()
        );

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("PED-2026-0001");
        given(orderRepository.save(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.convertBudgetToOrder(budgetId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.codigo()).isEqualTo("PED-2026-0001");
        assertThat(result.orcamentoId()).isEqualTo(budgetId);
        assertThat(result.status()).isEqualTo(OrderStatus.AGUARDANDO_PRODUCAO);

        verify(orderRepository).save(any(Order.class));
        verify(orderCodeGenerator).generateNextCode();
    }

    // =========================================================================
    // convertBudgetToOrder — cenários de erro (Tabela de Decisão)
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar ResourceNotFoundException quando orçamento não existe")
    void shouldThrowResourceNotFoundWhenBudgetDoesNotExist() {
        // Arrange
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar BusinessException quando orçamento está em DRAFT")
    void shouldThrowBusinessExceptionWhenBudgetIsDraft() {
        // Arrange
        budget.setStatus(BudgetStatus.DRAFT);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rascunho");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[Tabela de Decisão] Deve lançar BusinessException quando orçamento está CANCELLED")
    void shouldThrowBusinessExceptionWhenBudgetIsCancelled() {
        // Arrange
        budget.setStatus(BudgetStatus.CANCELLED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Aprovado");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar BusinessException quando orçamento está REJECTED")
    void shouldThrowBusinessExceptionWhenBudgetIsRejected() {
        // Arrange
        budget.setStatus(BudgetStatus.REJECTED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rejeitado");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve lançar ConflictException quando pedido já existe para o orçamento (idempotência)")
    void shouldThrowConflictExceptionWhenOrderAlreadyExistsForBudget() {
        // Arrange
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining(budgetId.toString());

        verify(orderRepository, never()).save(any());
        verify(orderCodeGenerator, never()).generateNextCode();
    }

    // =========================================================================
    // findById — cenários
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve retornar pedido ao buscar por ID existente")
    void shouldReturnOrderWhenFindByIdExists() {
        // Arrange
        Order order = Order.builder()
                .id(orderId)
                .codigo("PED-2026-0001")
                .orcamentoId(budgetId)
                .clienteNome("Empresa XPTO Ltda")
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .build();

        OrderResponse expectedResponse = new OrderResponse(
                orderId, "PED-2026-0001", budgetId, null,
                "Empresa XPTO Ltda", null, null,
                OrderStatus.AGUARDANDO_PRODUCAO, "Aguardando Produção",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(), null,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                null, null, null, null,
                OffsetDateTime.now(ZoneOffset.UTC), OffsetDateTime.now(ZoneOffset.UTC), true,
                Collections.emptyList()
        );

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(order));
        given(orderMapper.toResponse(order)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.findById(orderId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(orderId);
        assertThat(result.codigo()).isEqualTo("PED-2026-0001");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar ResourceNotFoundException ao buscar pedido por ID inexistente")
    void shouldThrowResourceNotFoundWhenOrderDoesNotExist() {
        // Arrange
        UUID unknownId = UUID.randomUUID();
        given(orderRepository.findByIdWithDetails(unknownId)).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.findById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

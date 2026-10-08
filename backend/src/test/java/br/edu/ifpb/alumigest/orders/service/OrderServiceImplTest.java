package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setSubtotal(new BigDecimal("5000.00"));
        budget.setDiscountValue(new BigDecimal("500.00"));
        budget.setTotal(new BigDecimal("4500.00"));
        // Por padrão: lista com 1 item para satisfazer validação de "não vazio"
        budget.setItems(criarBudgetItemList(1));

        request = new OrderConvertRequest(
                ApprovalChannel.WHATSAPP,
                LocalDate.now(ZoneOffset.UTC).plusDays(15),
                "Entregar no turno da manhã"
        );
    }

    // =========================================================================
    // convertBudgetToOrder — cenários de sucesso
    // =========================================================================
    // Maylson ->  Vou pegar esse método para aprensetar na materia de Teste - Transição de Estados
    @Test
    @DisplayName("[Regra de Negócio] Deve aceitar orçamento em DRAFT ou SENT, promovê-lo para APPROVED e criar pedido")
    void shouldAcceptDraftOrSentBudgetAndPromoteToApproved() {
        // Arrange
        budget.setStatus(BudgetStatus.DRAFT);
        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.convertBudgetToOrder(budgetId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.codigo()).isEqualTo("OS-2026-0001");
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.APPROVED);
        verify(budgetRepository).save(budget);
        verify(orderRepository).saveAndFlush(any(Order.class));
        verify(orderCodeGenerator).generateNextCode();
    }

    @Test
    @DisplayName("[Snapshot / Lock de Preços] Deve calcular valorUnitario sem duplicar quantidade (sem qty²)")
    void shouldCalculateItemValuesWithoutDoubleCountingQuantity() {
        int quantidade = 3;
        BigDecimal subtotalNoOrcamento = new BigDecimal("1500.00");
        BigDecimal valorUnitarioEsperado = new BigDecimal("500.00");

        BudgetItem item = criarBudgetItem(quantidade, subtotalNoOrcamento);
        budget.setItems(List.of(item));

        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        orderService.convertBudgetToOrder(budgetId, request);

        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        assertThat(orderSalvo.getItems()).hasSize(1);
        OrderItem itemGerado = orderSalvo.getItems().getFirst();

        assertThat(itemGerado.getQuantidade()).isEqualTo(quantidade);
        assertThat(itemGerado.getValorTotal()).isEqualByComparingTo(subtotalNoOrcamento);
        assertThat(itemGerado.getValorUnitario()).isEqualByComparingTo(valorUnitarioEsperado);
    }

    @Test
    @DisplayName("[Snapshot / Lock de Preços] Deve congelar largura, altura e opções de insumo do BudgetItem")
    void shouldFreezeItemDimensionsAndOptionsFromBudgetItem() {
        BudgetItem item = criarBudgetItem(2, new BigDecimal("1000.00"));
        BudgetItemOption opcao = criarBudgetItemOption(item);
        item.getOptions().add(opcao);
        budget.setItems(List.of(item));

        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        orderService.convertBudgetToOrder(budgetId, request);

        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        OrderItem itemGerado = orderSalvo.getItems().getFirst();
        assertThat(itemGerado.getLarguraMm()).isEqualTo(1200);
        assertThat(itemGerado.getAlturaMm()).isEqualTo(900);
        assertThat(itemGerado.getDescricao()).isEqualTo("Janela 2 Folhas");
        assertThat(itemGerado.getOptions()).hasSize(1);
    }

    // =========================================================================
    // convertBudgetToOrder — cenários de erro (Tabela de Decisão)
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar ResourceNotFoundException quando orçamento não existe")
    void shouldThrowResourceNotFoundWhenBudgetDoesNotExist() {
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException (422) ao tentar converter orçamento já APPROVED")
    void shouldThrowBusinessExceptionWhenBudgetIsAlreadyApproved() {
        budget.setStatus(BudgetStatus.APPROVED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                orderService.convertBudgetToOrder(budgetId, request)
        );

        assertThat(exception.getMessage()).contains("Rascunho ou Enviado");
        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException (422) ao tentar converter orçamento REJECTED")
    void shouldThrowBusinessExceptionWhenBudgetIsRejected() {
        budget.setStatus(BudgetStatus.REJECTED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        assertThrows(BusinessException.class, () ->
                orderService.convertBudgetToOrder(budgetId, request)
        );
    }

    @Test
    @DisplayName("Deve lançar BusinessException (422) ao tentar converter orçamento CANCELLED")
    void shouldThrowBusinessExceptionWhenBudgetIsCancelled() {
        budget.setStatus(BudgetStatus.CANCELLED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        assertThrows(BusinessException.class, () ->
                orderService.convertBudgetToOrder(budgetId, request)
        );
    }

//  Maylson ->  Vou pegar esse método para aprensetar na materia de Teste - Tabela de Decição
    @Test
    @DisplayName("[Regra de Negócio] Deve lançar BusinessException quando orçamento está com validade expirada")
    void shouldThrowBusinessExceptionWhenBudgetIsExpired() {
        budget.setStatus(BudgetStatus.SENT);
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expirada");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve lançar BusinessException quando orçamento não possui itens")
    void shouldThrowBusinessExceptionWhenBudgetHasNoItems() {
        budget.setItems(Collections.emptyList());
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("sem itens");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve lançar ConflictException quando pedido já existe para o orçamento (idempotência)")
    void shouldThrowConflictExceptionWhenOrderAlreadyExistsForBudget() {
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(true);

        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining(budgetId.toString());

        verify(orderRepository, never()).saveAndFlush(any());
        verify(orderCodeGenerator, never()).generateNextCode();
    }

    // =========================================================================
    // findById — cenários
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve retornar pedido ao buscar por ID existente")
    void shouldReturnOrderWhenFindByIdExists() {
        Order order = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(order));
        given(orderMapper.toResponse(order)).willReturn(expectedResponse);

        OrderResponse result = orderService.findDetailedById(orderId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(orderId);
        assertThat(result.codigo()).isEqualTo("OS-2026-0001");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar ResourceNotFoundException ao buscar pedido por ID inexistente")
    void shouldThrowResourceNotFoundWhenOrderDoesNotExist() {
        UUID unknownId = UUID.randomUUID();
        given(orderRepository.findByIdWithDetails(unknownId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findDetailedById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("findAll: deve buscar pedidos com filtros e mapear para PageResponse de DTOs")
    void dadoFiltrosEPageable_deveBuscarEMapearPedidos() {
        Order savedOrder = buildSavedOrder();
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(savedOrder), pageable, 1);

        OrderSummaryResponse summaryDto = new OrderSummaryResponse(
                orderId, "OS-2026-0001", budgetId, "Empresa XPTO Ltda", "83988880000",
                OrderStatus.WAITING_PRODUCTION, "Aguardando Produção",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(),
                budget.getTotal(), 1, OffsetDateTime.now(ZoneOffset.UTC)
        );

        given(orderRepository.findAllWithFilters(OrderStatus.WAITING_PRODUCTION, ApprovalChannel.WHATSAPP, "XPTO", pageable))
                .willReturn(orderPage);
        given(orderMapper.toSummaryResponse(savedOrder)).willReturn(summaryDto);

        PageResponse<OrderSummaryResponse> result = orderService.findAll(
                OrderStatus.WAITING_PRODUCTION, ApprovalChannel.WHATSAPP, "XPTO", pageable
        );

        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).codigo()).isEqualTo("OS-2026-0001");
        assertThat(result.totalElements()).isEqualTo(1L);
        assertThat(result.size()).isEqualTo(10);
    }

    // =========================================================================
    // Helpers de construção de fixtures
    // =========================================================================

    private List<BudgetItem> criarBudgetItemList(int quantidade) {
        List<BudgetItem> items = new ArrayList<>();
        items.add(criarBudgetItem(quantidade, new BigDecimal("1000.00")));
        return items;
    }

    private BudgetItem criarBudgetItem(int quantidade, BigDecimal subtotal) {
        BudgetItem item = new BudgetItem();
        Product product = new Product();
        item.setProduct(product);
        item.setProductName("Janela 2 Folhas");
        item.setWidthMm(new BigDecimal("1200"));
        item.setHeightMm(new BigDecimal("900"));
        item.setQuantity(quantidade);
        item.setSubtotal(subtotal);
        return item;
    }

    private BudgetItemOption criarBudgetItemOption(BudgetItem budgetItem) {
        BudgetItemOption opcao = new BudgetItemOption();
        opcao.setBudgetItem(budgetItem);
        opcao.setMaterialName("Perfil Alumínio");
        opcao.setUnitMeasure("m²");
        opcao.setQuantity(new BigDecimal("2.50"));
        opcao.setUnitPrice(new BigDecimal("80.00"));
        opcao.setTotalPrice(new BigDecimal("200.00"));
        return opcao;
    }

    private Order buildSavedOrder() {
        return Order.builder()
                .id(orderId)
                .codigo("OS-2026-0001")
                .orcamentoId(budgetId)
                .clienteNome("Empresa XPTO Ltda")
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .status(OrderStatus.WAITING_PRODUCTION)
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .valorBruto(budget.getSubtotal())
                .valorDesconto(budget.getDiscountValue())
                .valorLiquido(budget.getTotal())
                .build();
    }

    private OrderResponse buildOrderResponse() {
        return new OrderResponse(
                orderId, "OS-2026-0001", budgetId, null,
                "Empresa XPTO Ltda", null, null,
                OrderStatus.WAITING_PRODUCTION, "Aguardando Produção",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(), null,
                budget.getSubtotal(), budget.getDiscountValue(), BigDecimal.ZERO, BigDecimal.ZERO,
                budget.getTotal(), null, null, null, null,
                OffsetDateTime.now(ZoneOffset.UTC), OffsetDateTime.now(ZoneOffset.UTC), true,
                Collections.emptyList()
        );
    }

    // =========================================================================
    // updateStatus — Máquina de Estados [US-15.1]
    // =========================================================================

    @Test
    @DisplayName("[US-15.1] Deve iniciar produção quando pedido está aguardando produção")
    void shouldStartProductionWhenOrderIsWaitingProduction() {
        // Arrange
        Order order = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
        given(orderRepository.save(order)).willReturn(order);
        given(orderMapper.toResponse(order)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.updateStatus(
                orderId,
                OrderStatus.IN_PRODUCTION
        );

        // Assert
        assertThat(order.getStatus()).isEqualTo(OrderStatus.IN_PRODUCTION);
        assertThat(result).isEqualTo(expectedResponse);

        verify(orderRepository).save(order);
        verify(orderMapper).toResponse(order);
    }

    @Test
    @DisplayName("[US-15.1] Deve concluir pedido quando está em produção")
    void shouldCompleteOrderWhenOrderIsInProduction() {
        // Arrange
        Order order = buildSavedOrder();
        order.iniciarProducao();

        OrderResponse expectedResponse = buildOrderResponse();

        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
        given(orderRepository.save(order)).willReturn(order);
        given(orderMapper.toResponse(order)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.updateStatus(
                orderId,
                OrderStatus.COMPLETED
        );

        // Assert
        assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);
        assertThat(order.getDataConclusao()).isNotNull();
        assertThat(result).isEqualTo(expectedResponse);

        verify(orderRepository).save(order);
        verify(orderMapper).toResponse(order);
    }

    @Test
    @DisplayName("[US-15.1] Deve lançar ResourceNotFoundException quando pedido não existe")
    void shouldThrowResourceNotFoundWhenUpdatingStatusOfNonexistentOrder() {
        // Arrange
        given(orderRepository.findById(orderId)).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
                orderService.updateStatus(orderId, OrderStatus.IN_PRODUCTION)
        )
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[US-15.1] Deve rejeitar destino de status não permitido")
    void shouldThrowConflictExceptionWhenTargetStatusIsNotAllowed() {
        // Arrange
        Order order = buildSavedOrder();

        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() ->
                orderService.updateStatus(orderId, OrderStatus.WAITING_PRODUCTION)
        )
                .isInstanceOf(ConflictException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[US-15.1] Deve rejeitar conclusão quando pedido ainda não está em produção")
    void shouldRejectCompletionWhenOrderIsNotInProduction() {
        // Arrange
        Order order = buildSavedOrder();

        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() ->
                orderService.updateStatus(orderId, OrderStatus.COMPLETED)
        )
                .isInstanceOf(ConflictException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[US-15.1] Deve rejeitar início de produção quando pedido já está concluído")
    void shouldRejectStartingProductionWhenOrderIsAlreadyCompleted() {
        // Arrange
        Order order = buildSavedOrder();
        order.iniciarProducao();
        order.concluir(LocalDate.now(ZoneOffset.UTC));

        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() ->
                orderService.updateStatus(orderId, OrderStatus.IN_PRODUCTION)
        )
                .isInstanceOf(ConflictException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("[US-15.1] Deve rejeitar status nulo")
    void shouldRejectNullTargetStatus() {
        // Arrange
        given(orderRepository.findById(orderId)).willReturn(Optional.of(buildSavedOrder()));

        // Act & Assert
        assertThatThrownBy(() ->
                orderService.updateStatus(orderId, null)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obrigatório");

        verify(orderRepository, never()).save(any());
    }

    // =========================================================================
    // Testes de Cancelamento de Pedido / Ordem de Serviço (US-13.5 / US-15.1)
    // =========================================================================

    @Test
    @DisplayName("Deve cancelar pedido com sucesso quando status for WAITING_PRODUCTION e justificativa válida")
    void shouldCancelOrderSuccessfully() {
        Order savedOrder = buildSavedOrder();
        OrderCancelRequest cancelRequest = new OrderCancelRequest("Cliente desistiu por motivo de mudança de obra.");

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(savedOrder));
        given(orderRepository.save(any(Order.class))).willAnswer(inv -> inv.getArgument(0));

        OrderResponse expectedResponse = new OrderResponse(
                orderId, "OS-2026-0001", budgetId, null,
                "Empresa XPTO Ltda", null, null,
                OrderStatus.CANCELLED, "Cancelado",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(), null,
                budget.getSubtotal(), budget.getDiscountValue(), BigDecimal.ZERO, BigDecimal.ZERO,
                budget.getTotal(), null, null, null, "Cliente desistiu por motivo de mudança de obra.",
                OffsetDateTime.now(ZoneOffset.UTC), OffsetDateTime.now(ZoneOffset.UTC), true,
                Collections.emptyList()
        );
        given(orderMapper.toResponse(any(Order.class))).willReturn(expectedResponse);

        OrderResponse result = orderService.cancelOrder(orderId, cancelRequest);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(result.justificativaCancelamento()).isEqualTo("Cliente desistiu por motivo de mudança de obra.");

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(captor.getValue().getJustificativaCancelamento()).isEqualTo("Cliente desistiu por motivo de mudança de obra.");
    }

    @Test
    @DisplayName("[US-15.2] Deve cancelar pedido e reabrir orçamento vinculado de APPROVED para DRAFT")
    void shouldCancelOrderAndReopenLinkedBudgetSuccessfully() {
        Order savedOrder = buildSavedOrder();
        budget.setStatus(BudgetStatus.APPROVED);
        OrderCancelRequest cancelRequest = new OrderCancelRequest("Cliente desistiu da obra.");

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(savedOrder));
        given(orderRepository.save(any(Order.class))).willAnswer(inv -> inv.getArgument(0));
        given(budgetRepository.findById(budgetId)).willReturn(Optional.of(budget));
        given(budgetRepository.save(any(Budget.class))).willAnswer(inv -> inv.getArgument(0));

        OrderResponse expectedResponse = new OrderResponse(
                orderId, "OS-2026-0001", budgetId, null,
                "Empresa XPTO Ltda", null, null,
                OrderStatus.CANCELLED, "Cancelado",
                ApprovalChannel.WHATSAPP, "WhatsApp",
                LocalDate.now(ZoneOffset.UTC), request.dataPrevisaoEntrega(), null,
                budget.getSubtotal(), budget.getDiscountValue(), BigDecimal.ZERO, BigDecimal.ZERO,
                budget.getTotal(), null, null, null, "Cliente desistiu da obra.",
                OffsetDateTime.now(ZoneOffset.UTC), OffsetDateTime.now(ZoneOffset.UTC), true,
                Collections.emptyList()
        );
        given(orderMapper.toResponse(any(Order.class))).willReturn(expectedResponse);

        OrderResponse result = orderService.cancelOrder(orderId, cancelRequest);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.DRAFT);
        verify(budgetRepository).save(budget);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar cancelar pedido inexistente")
    void shouldThrowResourceNotFoundExceptionWhenOrderDoesNotExist() {
        UUID nonExistentId = UUID.randomUUID();
        OrderCancelRequest cancelRequest = new OrderCancelRequest("Justificativa válida com mais de 10 chars.");

        given(orderRepository.findByIdWithDetails(nonExistentId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.cancelOrder(nonExistentId, cancelRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(nonExistentId.toString());

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar cancelar pedido que já está em produção")
    void shouldThrowBusinessExceptionWhenOrderIsInProduction() {
        Order inProdOrder = Order.builder()
                .id(orderId)
                .codigo("OS-2026-0001")
                .orcamentoId(budgetId)
                .clienteNome("Cliente Teste")
                .status(OrderStatus.IN_PRODUCTION)
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .build();

        OrderCancelRequest cancelRequest = new OrderCancelRequest("Tentativa de cancelamento enquanto fábrica corta perfis.");
        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(inProdOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(orderId, cancelRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não é possível cancelar um pedido no status IN_PRODUCTION");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException ao tentar cancelar com justificativa menor que 10 caracteres")
    void shouldThrowIllegalArgumentExceptionWhenJustificativaIsTooShort() {
        Order savedOrder = buildSavedOrder();
        OrderCancelRequest cancelRequest = new OrderCancelRequest("Curto");

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(savedOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(orderId, cancelRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("pelo menos 10 caracteres");

        verify(orderRepository, never()).save(any());
    }
}
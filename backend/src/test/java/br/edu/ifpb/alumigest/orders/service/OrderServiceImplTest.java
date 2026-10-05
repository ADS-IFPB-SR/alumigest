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

    @Test
    @DisplayName("[Partição de Equivalência] Deve converter orçamento APPROVED em pedido com sucesso")
    void shouldConvertApprovedBudgetToOrderSuccessfully() {
        // Arrange
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
        assertThat(result.orcamentoId()).isEqualTo(budgetId);
        assertThat(result.status()).isEqualTo(OrderStatus.WAITING_PRODUCTION);

        verify(orderRepository).saveAndFlush(any(Order.class));
        verify(orderCodeGenerator).generateNextCode();
    }

    @Test
    @DisplayName("[Regra de Negócio] Deve aceitar orçamento em DRAFT, promovê-lo para APPROVED e criar pedido")
    void shouldAcceptDraftBudgetAndPromoteToApproved() {
        // Arrange
        budget.setStatus(BudgetStatus.DRAFT);
        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(budgetRepository.save(budget)).willReturn(budget);
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        // Assert: orçamento deve ter sido atualizado para APPROVED antes de salvar o pedido
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.APPROVED);
        verify(budgetRepository).save(budget);
        verify(orderRepository).saveAndFlush(any(Order.class));
    }

    @Test
    @DisplayName("[Regra de Negócio] Deve aceitar orçamento em SENT, promovê-lo para APPROVED e criar pedido")
    void shouldAcceptSentBudgetAndPromoteToApproved() {
        // Arrange
        budget.setStatus(BudgetStatus.SENT);
        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(budgetRepository.save(budget)).willReturn(budget);
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        // Assert
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.APPROVED);
        verify(budgetRepository).save(budget);
    }

    @Test
    @DisplayName("[Snapshot / Lock de Preços] Deve calcular valorUnitario sem duplicar quantidade (sem qty²)")
    void shouldCalculateItemValuesWithoutDoubleCountingQuantity() {
        // Arrange: item com 3 esquadrias de R$ 500 cada → subtotal no orçamento já é R$ 1.500
        int quantidade = 3;
        BigDecimal subtotalNoOrcamento = new BigDecimal("1500.00");
        BigDecimal valorUnitarioEsperado = new BigDecimal("500.00"); // 1500 / 3

        BudgetItem item = criarBudgetItem(quantidade, subtotalNoOrcamento);
        budget.setItems(List.of(item));

        Order savedOrder = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(savedOrder);
        given(orderMapper.toResponse(savedOrder)).willReturn(expectedResponse);

        // Captura o Order salvo para inspecionar os itens gerados
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        // Assert — verifica que o OrderItem foi gerado com os valores corretos
        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        assertThat(orderSalvo.getItems()).hasSize(1);
        OrderItem itemGerado = orderSalvo.getItems().getFirst();

        assertThat(itemGerado.getQuantidade()).isEqualTo(quantidade);
        assertThat(itemGerado.getValorTotal()).isEqualByComparingTo(subtotalNoOrcamento);
        assertThat(itemGerado.getValorUnitario()).isEqualByComparingTo(valorUnitarioEsperado);
        // Invariante: valorTotal = valorUnitario × quantidade (sem multiplicação dupla)
        assertThat(itemGerado.getValorUnitario().multiply(BigDecimal.valueOf(quantidade)))
                .isEqualByComparingTo(itemGerado.getValorTotal());
    }

    @Test
    @DisplayName("[Snapshot / Lock de Preços] Deve congelar largura, altura e opções de insumo do BudgetItem")
    void shouldFreezeItemDimensionsAndOptionsFromBudgetItem() {
        // Arrange
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

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        // Assert
        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        OrderItem itemGerado = orderSalvo.getItems().getFirst();
        assertThat(itemGerado.getLarguraMm()).isEqualTo(1200);
        assertThat(itemGerado.getAlturaMm()).isEqualTo(900);
        assertThat(itemGerado.getDescricao()).isEqualTo("Janela 2 Folhas");
        assertThat(itemGerado.getOptions()).hasSize(1);
        assertThat(itemGerado.getOptions().getFirst().getMaterialName()).isEqualTo("Perfil Alumínio");
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

        verify(orderRepository, never()).saveAndFlush(any());
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
                .hasMessageContaining("Cancelado");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("[Tabela de Decisão] Deve lançar BusinessException quando orçamento está REJECTED")
    void shouldThrowBusinessExceptionWhenBudgetIsRejected() {
        // Arrange
        budget.setStatus(BudgetStatus.REJECTED);
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rejeitado");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("[Regra de Negócio] Deve lançar BusinessException quando orçamento está com validade expirada")
    void shouldThrowBusinessExceptionWhenBudgetIsExpired() {
        // Arrange
        budget.setStatus(BudgetStatus.SENT);
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expirada");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve lançar BusinessException quando orçamento não possui itens")
    void shouldThrowBusinessExceptionWhenBudgetHasNoItems() {
        // Arrange
        budget.setItems(Collections.emptyList());
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));

        // Act & Assert
        assertThatThrownBy(() -> orderService.convertBudgetToOrder(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("sem itens");

        verify(orderRepository, never()).saveAndFlush(any());
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

        verify(orderRepository, never()).saveAndFlush(any());
        verify(orderCodeGenerator, never()).generateNextCode();
    }

    // =========================================================================
    // findById — cenários
    // =========================================================================

    @Test
    @DisplayName("[Partição de Equivalência] Deve retornar pedido ao buscar por ID existente")
    void shouldReturnOrderWhenFindByIdExists() {
        // Arrange
        Order order = buildSavedOrder();
        OrderResponse expectedResponse = buildOrderResponse();

        given(orderRepository.findByIdWithDetails(orderId)).willReturn(Optional.of(order));
        given(orderMapper.toResponse(order)).willReturn(expectedResponse);

        // Act
        OrderResponse result = orderService.findDetailedById(orderId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(orderId);
        assertThat(result.codigo()).isEqualTo("OS-2026-0001");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve lançar ResourceNotFoundException ao buscar pedido por ID inexistente")
    void shouldThrowResourceNotFoundWhenOrderDoesNotExist() {
        // Arrange
        UUID unknownId = UUID.randomUUID();
        given(orderRepository.findByIdWithDetails(unknownId)).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.findDetailedById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class);
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
        assertThat(result.content().get(0).clienteNome()).isEqualTo("Empresa XPTO Ltda");
        assertThat(result.totalElements()).isEqualTo(1L);
        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(10);
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
}

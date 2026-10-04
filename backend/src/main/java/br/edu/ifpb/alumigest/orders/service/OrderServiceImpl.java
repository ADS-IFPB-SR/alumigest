package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private static final String RESOURCE_ORCAMENTO = "Orçamento";
    private static final String RESOURCE_PEDIDO = "Pedido";

    private final OrderRepository orderRepository;
    private final BudgetRepository budgetRepository;
    private final OrderCodeGenerator orderCodeGenerator;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            BudgetRepository budgetRepository,
            OrderCodeGenerator orderCodeGenerator,
            OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.budgetRepository = budgetRepository;
        this.orderCodeGenerator = orderCodeGenerator;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> findAll(OrderStatus status, String busca, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findAllWithFilters(status, busca, pageable);
        Page<OrderSummaryResponse> dtoPage = orderPage.map(orderMapper::toSummaryResponse);
        return PageResponse.of(dtoPage);
    }

    @Override
    @Transactional
    public OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request) {
        Budget budget = budgetRepository.findByIdWithDetails(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, budgetId.toString()));

        validarElegibilidadeOrcamento(budget);
        validarOrcamentoComItens(budget);
        validarIdempotencia(budgetId);

        if (budget.getStatus() != BudgetStatus.APPROVED) {
            budget.setStatus(BudgetStatus.APPROVED);
            budgetRepository.save(budget);
        }

        String codigo = orderCodeGenerator.generateNextCode();

        Order order = Order.builder()
                .codigo(codigo)
                .orcamentoId(budgetId)
                .cliente(budget.getClient())
                .clienteNome(resolverNomeCliente(budget))
                .clienteTelefone(resolverTelefoneCliente(budget))
                .clienteEndereco(resolverEnderecoCliente(budget))
                .canalAprovacao(request.canalAprovacao())
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .valorBruto(budget.getSubtotal())
                .valorDesconto(orZero(budget.getDiscountValue()))
                .valorLiquido(orZero(budget.getTotal()))
                .condicaoPagamento(resolverCondicaoPagamento(budget))
                .observacoesPagamento(budget.getPaymentNotes())
                .observacoes(request.observacoes())
                .build();

        converterItens(budget, order);

        order = orderRepository.save(order);
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findDetailedById(UUID id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));
        return orderMapper.toResponse(order);
    }

    // =========================================================================
    // Métodos privados de suporte (SRP)
    // =========================================================================

    private static final Set<BudgetStatus> STATUS_ELEGIVEIS =
            EnumSet.of(BudgetStatus.DRAFT, BudgetStatus.SENT, BudgetStatus.APPROVED);

    private void validarElegibilidadeOrcamento(Budget budget) {
        if (budget.isExpired()) {
            throw new BusinessException(
                    "Orçamento com validade expirada não pode ser convertido em pedido de venda.");
        }
        if (!STATUS_ELEGIVEIS.contains(budget.getStatus())) {
            String statusDesc = budget.getStatus() != null
                    ? budget.getStatus().getDescricao()
                    : "Indefinido";
            throw new BusinessException(
                    "Orçamento com status '" + statusDesc + "' não pode ser convertido em pedido de venda."
                            + " São aceitos: Rascunho, Enviado ou Aprovado.");
        }
    }

    private void validarOrcamentoComItens(Budget budget) {
        if (budget.getItems() == null || budget.getItems().isEmpty()) {
            throw new BusinessException(
                    "Não é possível converter um orçamento sem itens em pedido de venda.");
        }
    }

    private void validarIdempotencia(UUID budgetId) {
        if (orderRepository.existsByOrcamentoId(budgetId)) {
            throw new ConflictException(
                    "Já existe um pedido de venda gerado para o orçamento com ID " + budgetId + ".");
        }
    }

    private void converterItens(Budget budget, Order order) {
        List<BudgetItem> budgetItems = budget.getItems();
        if (budgetItems == null || budgetItems.isEmpty()) {
            return;
        }

        for (int i = 0; i < budgetItems.size(); i++) {
            BudgetItem budgetItem = budgetItems.get(i);
            OrderItem orderItem = construirOrderItem(budgetItem, i);
            converterOpcoes(budgetItem, orderItem);
            order.addItem(orderItem);
        }
    }

    private OrderItem construirOrderItem(BudgetItem budgetItem, int ordem) {
        int largura = budgetItem.getWidthMm() != null ? budgetItem.getWidthMm().intValue() : 0;
        int altura = budgetItem.getHeightMm() != null ? budgetItem.getHeightMm().intValue() : 0;
        int qty = (budgetItem.getQuantity() != null && budgetItem.getQuantity() > 0)
                ? budgetItem.getQuantity() : 1;

        BigDecimal valorTotal = orZero(budgetItem.getSubtotal());
        BigDecimal valorUnitario = valorTotal.divide(BigDecimal.valueOf(qty), 2, RoundingMode.HALF_UP);

        return OrderItem.builder()
                .product(budgetItem.getProduct())
                .descricao(budgetItem.getProductName())
                .larguraMm(largura)
                .alturaMm(altura)
                .quantidade(qty)
                .valorUnitario(valorUnitario)
                .valorTotal(valorTotal)
                .templateConfig(budgetItem.getTemplateConfig())
                .handleConfig(budgetItem.getHandleConfig())
                .drillingConfig(budgetItem.getDrillingConfig())
                .ordem(ordem)
                .build();
    }

    private void converterOpcoes(BudgetItem budgetItem, OrderItem orderItem) {
        List<BudgetItemOption> opcoes = budgetItem.getOptions();
        if (opcoes == null || opcoes.isEmpty()) {
            return;
        }
        for (BudgetItemOption opcao : opcoes) {
            OrderItemOption orderOption = OrderItemOption.builder()
                    .material(opcao.getMaterial())
                    .materialName(opcao.getMaterialName())
                    .unitMeasure(opcao.getUnitMeasure())
                    .categoryType(opcao.getCategoryType() != null
                            ? opcao.getCategoryType().name() : null)
                    .selectedType(opcao.getSelectedType())
                    .selectedColor(opcao.getSelectedColor())
                    .quantity(orZero(opcao.getQuantity()))
                    .unitPrice(orZero(opcao.getUnitPrice()))
                    .totalPrice(orZero(opcao.getTotalPrice()))
                    .build();
            orderItem.addOption(orderOption);
        }
    }

    private String resolverNomeCliente(Budget budget) {
        if (budget.getClient() != null && budget.getClient().getFullName() != null) {
            return budget.getClient().getFullName();
        }
        return "Cliente não informado";
    }

    private String resolverTelefoneCliente(Budget budget) {
        if (budget.getClient() != null) {
            return budget.getClient().getPhone();
        }
        return null;
    }

    private String resolverEnderecoCliente(Budget budget) {
        if (budget.getClient() == null) {
            return null;
        }
        var c = budget.getClient();
        var sb = new StringBuilder();
        if (c.getStreet() != null) {
            sb.append(c.getStreet());
        }
        if (c.getNumber() != null) {
            sb.append(", ").append(c.getNumber());
        }
        if (c.getCity() != null) {
            sb.append(" - ").append(c.getCity());
        }
        if (c.getState() != null) {
            sb.append("/").append(c.getState());
        }
        return !sb.isEmpty() ? sb.toString() : null;
    }

    private String resolverCondicaoPagamento(Budget budget) {
        if (budget.getPaymentCondition() != null) {
            return budget.getPaymentCondition().name();
        }
        return null;
    }

    private BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
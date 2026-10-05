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
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Implementação do serviço de gestão e ciclo de vida de Pedidos de Venda.
 * Trata conversão atômica de orçamentos, congelamento de itens (lock de preços),
 * consultas paginadas e invariantes de integridade do domínio.
 */
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
    public PageResponse<OrderSummaryResponse> findAll(
            OrderStatus status,
            ApprovalChannel channel,
            String search,
            Pageable pageable
    ) {
        Page<Order> orderPage = orderRepository.findAllWithFilters(status, channel, search, pageable);
        Page<OrderSummaryResponse> dtoPage = orderPage.map(orderMapper::toSummaryResponse);
        return PageResponse.of(dtoPage);
    }

    @Override
    @Retryable(
            retryFor = {DataIntegrityViolationException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 100, multiplier = 1.5)
    )
    @Transactional
    public OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request) {
        Budget budget = budgetRepository.findByIdWithDetails(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, budgetId.toString()));

        validateBudgetEligibility(budget);
        validateBudgetHasItems(budget);
        validateIdempotency(budgetId);

        if (budget.getStatus() != BudgetStatus.APPROVED) {
            budget.setStatus(BudgetStatus.APPROVED);
            budgetRepository.save(budget);
        }

        String codigo = orderCodeGenerator.generateNextCode();

        Order order = Order.builder()
                .codigo(codigo)
                .orcamentoId(budgetId)
                .cliente(budget.getClient())
                .clienteNome(resolveCustomerName(budget))
                .clienteTelefone(resolveCustomerPhone(budget))
                .clienteEndereco(resolveCustomerAddress(budget))
                .canalAprovacao(request.canalAprovacao())
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .valorBruto(orZero(budget.getSubtotal()).setScale(2, RoundingMode.HALF_EVEN))
                .valorDesconto(orZero(budget.getDiscountValue()).setScale(2, RoundingMode.HALF_EVEN))
                .valorLiquido(orZero(budget.getTotal()).setScale(2, RoundingMode.HALF_EVEN))
                .condicaoPagamento(resolvePaymentCondition(budget))
                .observacoesPagamento(budget.getPaymentNotes())
                .observacoes(request.observacoes())
                .build();

        convertItems(budget, order);

        order = orderRepository.save(order);
        return orderMapper.toResponse(order);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public OrderResponse findDetailedById(UUID id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));
        return orderMapper.toResponse(order);
    }

    // =========================================================================
    // Métodos privados de suporte (SRP — separação de responsabilidades internas)
    // =========================================================================

    /**
     * Status elegíveis para conversão em pedido de venda.
     * DRAFT e SENT são promovidos para APPROVED atomicamente durante a conversão.
     * APPROVED é aceito para tolerar reprocessamento idempotente.
     */
    private static final Set<BudgetStatus> STATUS_ELEGIVEIS =
            EnumSet.of(BudgetStatus.DRAFT, BudgetStatus.SENT, BudgetStatus.APPROVED);

    /**
     * Valida que o orçamento está em um status elegível para conversão.
     * Aceita DRAFT, SENT e APPROVED. Rejeita CANCELLED, REJECTED e EXPIRED.
     *
     * @param budget orçamento a ser validado
     * @throws BusinessException se o status não for elegível para conversão
     */
    private void validateBudgetEligibility(Budget budget) {
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

    /**
     * Valida que o orçamento possui ao menos um item antes de gerar o pedido.
     *
     * @param budget orçamento a ser validado
     * @throws BusinessException se o orçamento não possuir itens
     */
    private void validateBudgetHasItems(Budget budget) {
        if (budget.getItems() == null || budget.getItems().isEmpty()) {
            throw new BusinessException(
                    "Não é possível converter um orçamento sem itens em pedido de venda.");
        }
    }

    /**
     * Garante idempotência: um orçamento só pode gerar um único pedido de venda.
     *
     * @param budgetId ID do orçamento
     * @throws ConflictException se já existir pedido para o orçamento informado
     */
    private void validateIdempotency(UUID budgetId) {
        if (orderRepository.existsByOrcamentoId(budgetId)) {
            throw new ConflictException(
                    "Já existe um pedido de venda gerado para o orçamento com ID " + budgetId + ".");
        }
    }

    /**
     * Converte todos os itens do orçamento em itens do pedido (snapshot / lock de preços).
     *
     * @param budget orçamento de origem
     * @param order  pedido destino
     */
    private void convertItems(Budget budget, Order order) {
        List<BudgetItem> budgetItems = budget.getItems();
        if (budgetItems == null || budgetItems.isEmpty()) {
            return;
        }

        for (int i = 0; i < budgetItems.size(); i++) {
            BudgetItem budgetItem = budgetItems.get(i);
            OrderItem orderItem = buildOrderItem(budgetItem, i);
            convertOptions(budgetItem, orderItem);
            order.addItem(orderItem);
        }
    }

    /**
     * Constrói um {@link OrderItem} a partir de um {@link BudgetItem} via Builder Pattern.
     *
     * <p><strong>Regra financeira:</strong> {@code budgetItem.getSubtotal()} já representa o
     * total do item (preço unitário × quantidade), conforme calculado pelo
     * {@code BudgetPricingService}. Portanto:
     * <ul>
     *   <li>{@code valorTotal} = subtotal do item (congelado do orçamento)</li>
     *   <li>{@code valorUnitario} = valorTotal / quantidade (derivado por divisão)</li>
     * </ul>
     * Isso evita a multiplicação dupla da quantidade (qty²).
     *
     * @param budgetItem item do orçamento original
     * @param ordem      posição sequencial do item no pedido
     * @return item do pedido com snapshot dos dados técnicos e financeiros
     */
    private OrderItem buildOrderItem(BudgetItem budgetItem, int ordem) {
        int largura = budgetItem.getWidthMm() != null ? budgetItem.getWidthMm().intValue() : 0;
        int altura = budgetItem.getHeightMm() != null ? budgetItem.getHeightMm().intValue() : 0;
        int qty = (budgetItem.getQuantity() != null && budgetItem.getQuantity() > 0)
                ? budgetItem.getQuantity() : 1;

        BigDecimal valorTotal = orZero(budgetItem.getSubtotal()).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal valorUnitario = valorTotal.divide(
                BigDecimal.valueOf(qty), 2, RoundingMode.HALF_EVEN);

        return OrderItem.builder()
                .product(budgetItem.getProduct())
                .descricao(budgetItem.getProductName())
                .larguraMm(largura)
                .alturaMm(altura)
                .quantidade(qty)
                .corAluminio(OrderItemSnapshotResolver.extractAluminumColor(budgetItem))
                .tipoVidro(OrderItemSnapshotResolver.extractGlassType(budgetItem))
                .orientacaoAbertura(OrderItemSnapshotResolver.extractOpeningDirection(budgetItem))
                .ferragens(OrderItemSnapshotResolver.extractHardware(budgetItem))
                .valorUnitario(valorUnitario)
                .valorTotal(valorTotal)
                .templateConfig(budgetItem.getTemplateConfig())
                .handleConfig(budgetItem.getHandleConfig())
                .drillingConfig(budgetItem.getDrillingConfig())
                .ordem(ordem)
                .build();
    }

    /**
     * Converte as opções de insumo de um item do orçamento em opções do item do pedido.
     *
     * @param budgetItem item do orçamento de origem
     * @param orderItem  item do pedido destino
     */
    private void convertOptions(BudgetItem budgetItem, OrderItem orderItem) {
        List<BudgetItemOption> opcoes = budgetItem.getOptions();
        if (opcoes == null || opcoes.isEmpty()) {
            return;
        }
        for (BudgetItemOption opcao : opcoes) {
            BigDecimal qty = orZero(opcao.getQuantity()).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal unitPrice = orZero(opcao.getUnitPrice()).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal totalPrice = orZero(opcao.getTotalPrice()).setScale(2, RoundingMode.HALF_EVEN);

            OrderItemOption orderOption = OrderItemOption.builder()
                    .material(opcao.getMaterial())
                    .materialName(opcao.getMaterialName())
                    .unitMeasure(opcao.getUnitMeasure())
                    .categoryType(opcao.getCategoryType() != null
                            ? opcao.getCategoryType().name() : null)
                    .selectedType(opcao.getSelectedType())
                    .selectedColor(opcao.getSelectedColor())
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build();
            orderItem.addOption(orderOption);
        }
    }

    /**
     * Retorna o nome do cliente a partir do orçamento.
     *
     * @param budget orçamento de origem
     * @return nome do cliente ou valor padrão se não disponível
     */
    private String resolveCustomerName(Budget budget) {
        if (budget.getClient() != null && budget.getClient().getFullName() != null) {
            return budget.getClient().getFullName();
        }
        return "Cliente não informado";
    }

    /**
     * Retorna o telefone do cliente a partir do objeto de domínio Client.
     *
     * @param b  private String resolveCustomerPhone(Budget budget) {
    if (budget.getClient() != null) {
      return budget.getClient().getPhone();
    }
    return null;
  }

  /**
   * Compõe o endereço do cliente a partir dos campos individuais (street, number, city, state).
   *
   * @param budget orçamento de origem
   * @return endereço formatado ou null
   */
  private String resolveCustomerAddress(Budget budget) {
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

  /**
   * Retorna a condição de pagamento como String a partir do enum PaymentCondition do orçamento.
   *
   * @param budget orçamento de origem
   * @return nome do enum ou null
   */
  private String resolvePaymentCondition(Budget budget) {
    if (budget.getPaymentCondition() != null) {
      return budget.getPaymentCondition().name();
    }
    return null;
  }

  /**
   * Garante que um BigDecimal nunca seja null, retornando ZERO nesse caso.
   *
   * @param value valor potencialmente nulo
   * @return valor original ou BigDecimal.ZERO
   */
  private BigDecimal orZero(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
  }
}
package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Implementação concreta do contrato {@link OrderService}.
 * Concentra a lógica de negócio da conversão de orçamento em pedido de venda (SRP).
 * Depende de abstrações — nunca de implementações concretas (DIP).
 */
@Service
public class OrderServiceImpl implements OrderService {

    private static final String RESOURCE_ORCAMENTO = "Orçamento";
    private static final String RESOURCE_PEDIDO = "Pedido";

    private final OrderRepository orderRepository;
    private final BudgetRepository budgetRepository;
    private final OrderCodeGenerator orderCodeGenerator;
    private final OrderMapper orderMapper;

    /**
     * Injeção de dependência via construtor (DIP / testabilidade).
     *
     * @param orderRepository   repositório de pedidos
     * @param budgetRepository  repositório de orçamentos
     * @param orderCodeGenerator gerador de código sequencial
     * @param orderMapper       mapper MapStruct
     */
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

    /**
     * {@inheritDoc}
     *
     * <p>Fluxo atômico de conversão:
     * <ol>
     *   <li>Valida existência e status APPROVED do orçamento.</li>
     *   <li>Verifica idempotência — impede duplicação de pedido para o mesmo orçamento.</li>
     *   <li>Constrói o {@link Order} com snapshot financeiro imutável (lock de preços).</li>
     *   <li>Converte cada {@link BudgetItem} em {@link OrderItem} preservando os insumos.</li>
     *   <li>Persiste o pedido e retorna o DTO detalhado.</li>
     * </ol>
     */
    @Override
    @Transactional
    public OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request) {
        Budget budget = budgetRepository.findByIdWithDetails(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, budgetId.toString()));

        validarOrcamentoAprovado(budget);
        validarIdempotencia(budgetId);

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

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public OrderResponse findById(UUID id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));
        return orderMapper.toResponse(order);
    }

    // =========================================================================
    // Métodos privados de suporte (SRP — separação de responsabilidades internas)
    // =========================================================================

    /**
     * Valida que o orçamento está no status APPROVED para ser convertido.
     *
     * @param budget orçamento a ser validado
     * @throws BusinessException se o status não for APPROVED
     */
    private void validarOrcamentoAprovado(Budget budget) {
        if (budget.getStatus() != BudgetStatus.APPROVED) {
            String statusDesc = budget.getStatus() != null
                    ? budget.getStatus().getDescricao()
                    : "Indefinido";
            throw new BusinessException(
                    "Apenas orçamentos com status 'Aprovado' podem ser convertidos em pedido de venda."
                    + " Status atual: " + statusDesc + ".");
        }
    }

    /**
     * Garante idempotência: um orçamento só pode gerar um único pedido de venda.
     *
     * @param budgetId ID do orçamento
     * @throws ConflictException se já existir pedido para o orçamento informado
     */
    private void validarIdempotencia(UUID budgetId) {
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

    /**
     * Constrói um {@link OrderItem} a partir de um {@link BudgetItem} via Builder Pattern.
     *
     * @param budgetItem item do orçamento original
     * @param ordem      posição sequencial do item no pedido
     * @return item do pedido com snapshot dos dados técnicos e financeiros
     */
    private OrderItem construirOrderItem(BudgetItem budgetItem, int ordem) {
        int largura = budgetItem.getWidthMm() != null ? budgetItem.getWidthMm().intValue() : 0;
        int altura = budgetItem.getHeightMm() != null ? budgetItem.getHeightMm().intValue() : 0;
        BigDecimal valorUnitario = orZero(budgetItem.getSubtotal());
        int qty = budgetItem.getQuantity() != null ? budgetItem.getQuantity() : 1;
        BigDecimal valorTotal = valorUnitario.multiply(BigDecimal.valueOf(qty));

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

    /**
     * Converte as opções de insumo de um item do orçamento em opções do item do pedido.
     *
     * @param budgetItem item do orçamento de origem
     * @param orderItem  item do pedido destino
     */
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

    /**
     * Retorna o nome do cliente a partir do orçamento, priorizando o campo snapshot.
     *
     * @param budget orçamento de origem
     * @return nome do cliente ou valor padrão se não disponível
     */
    private String resolverNomeCliente(Budget budget) {
        if (budget.getClient() != null && budget.getClient().getFullName() != null) {
            return budget.getClient().getFullName();
        }
        return "Cliente não informado";
    }

    /**
     * Retorna o telefone do cliente a partir do objeto de domínio Client.
     *
     * @param budget orçamento de origem
     * @return telefone do cliente ou null
     */
    private String resolverTelefoneCliente(Budget budget) {
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
        return sb.length() > 0 ? sb.toString() : null;
    }

    /**
     * Retorna a condição de pagamento como String a partir do enum PaymentCondition do orçamento.
     *
     * @param budget orçamento de origem
     * @return nome do enum ou null
     */
    private String resolverCondicaoPagamento(Budget budget) {
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

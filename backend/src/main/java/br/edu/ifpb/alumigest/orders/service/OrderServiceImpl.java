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
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderPdfDTO;
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
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    private final OrderPdfService orderPdfService;
    private final LabelPdfService labelPdfService;
    private final br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver thermalLabelDataResolver;
    private final br.edu.ifpb.alumigest.orders.service.thermal.ThermalLabelBplbRenderer thermalLabelBplbRenderer;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            BudgetRepository budgetRepository,
            OrderCodeGenerator orderCodeGenerator,
            OrderMapper orderMapper,
            OrderPdfService orderPdfService,
            LabelPdfService labelPdfService,
            br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver thermalLabelDataResolver,
            br.edu.ifpb.alumigest.orders.service.thermal.ThermalLabelBplbRenderer thermalLabelBplbRenderer) {
        this.orderRepository = orderRepository;
        this.budgetRepository = budgetRepository;
        this.orderCodeGenerator = orderCodeGenerator;
        this.orderMapper = orderMapper;
        this.orderPdfService = orderPdfService;
        this.labelPdfService = labelPdfService;
        this.thermalLabelDataResolver = thermalLabelDataResolver;
        this.thermalLabelBplbRenderer = thermalLabelBplbRenderer;
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

    /**
     * Converte um orçamento aprovado em Pedido de Venda oficial.
     * Possui retry para garantir unicidade de código sob concorrência.
     */
    @Override
    @Retryable(
            retryFor = {DataIntegrityViolationException.class, TransactionSystemException.class},
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

        BigDecimal valorMaoDeObra = resolveLaborCost(budget);

        Order order = Order.builder()
                .codigo(codigo)
                .orcamentoId(budgetId)
                .cliente(budget.getClient())
                .clienteNome(resolveCustomerName(budget))
                .clienteTelefone(resolveCustomerPhone(budget))
                .clienteEndereco(resolveCustomerAddress(budget))
                .status(OrderStatus.CREATED)
                .canalAprovacao(request.canalAprovacao())
                .dataPrevisaoEntrega(request.dataPrevisaoEntrega())
                .valorBruto(orZero(budget.getSubtotal()).setScale(2, RoundingMode.HALF_EVEN))
                .valorMaoDeObra(valorMaoDeObra.setScale(2, RoundingMode.HALF_EVEN))
                .valorDesconto(orZero(budget.getDiscountValue()).setScale(2, RoundingMode.HALF_EVEN))
                .valorLiquido(orZero(budget.getTotal()).setScale(2, RoundingMode.HALF_EVEN))
                .condicaoPagamento(resolvePaymentCondition(budget))
                .observacoesPagamento(budget.getPaymentNotes())
                .observacoes(request.observacoes())
                .build();

        convertItems(budget, order);

        order = orderRepository.saveAndFlush(order);
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

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public OrderPdfDTO gerarComprovanteById(UUID id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));
        byte[] bytes = orderPdfService.gerarComprovante(order);
        String filename = "comprovante-" + order.getCodigo().toLowerCase().replace("/", "-") + ".pdf";
        return new OrderPdfDTO(bytes, filename);
    }

    /**
     * {@inheritDoc}
     */
    private OrderPdfDTO buildEtiquetasPdf(UUID id, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Não é permitido emitir etiquetas de identificação para uma ordem de serviço cancelada.");
        }

        byte[] bytes = (customLeavesPerItem != null && !customLeavesPerItem.isEmpty())
                ? labelPdfService.gerarEtiquetas(order, itemId, customLeavesPerItem)
                : labelPdfService.gerarEtiquetas(order, itemId);
        String codigo = order.getCodigo() != null ? order.getCodigo().replace("/", "-") : id.toString();
        String filename = "etiquetas-" + codigo + ".pdf";

        return new OrderPdfDTO(bytes, filename);
    }

    private byte[] buildBplbEtiquetas(UUID id, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Não é permitido emitir etiquetas de identificação para uma ordem de serviço cancelada.");
        }
        List<br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData> etiquetas =
                (customLeavesPerItem != null && !customLeavesPerItem.isEmpty())
                        ? thermalLabelDataResolver.resolveLabels(order, itemId, customLeavesPerItem)
                        : thermalLabelDataResolver.resolveLabels(order, itemId);
        return thermalLabelBplbRenderer.renderBplbBytes(etiquetas);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderPdfDTO gerarEtiquetasById(UUID id, UUID itemId) {
        return buildEtiquetasPdf(id, itemId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderPdfDTO gerarEtiquetasById(UUID id, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
        return buildEtiquetasPdf(id, itemId, customLeavesPerItem);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] gerarBplbEtiquetasById(UUID id, UUID itemId) {
        return buildBplbEtiquetas(id, itemId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] gerarBplbEtiquetasById(UUID id, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
        return buildBplbEtiquetas(id, itemId, customLeavesPerItem);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id, OrderCancelRequest request) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id.toString()));

        order.cancelar(request.justificativa());
        order = orderRepository.save(order);

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
            EnumSet.of(BudgetStatus.DRAFT, BudgetStatus.SENT);

    /**
     * Valida se o status e a validade do orçamento permitem conversão.
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
                            + " São aceitos: Rascunho ou Enviado.");
        }
    }

    /**
     * Valida se o orçamento possui itens antes da conversão.
     */
    private void validateBudgetHasItems(Budget budget) {
        if (budget.getItems() == null || budget.getItems().isEmpty()) {
            throw new BusinessException(
                    "Não é possível converter um orçamento sem itens em pedido de venda.");
        }
    }

    /**
     * Garante idempotência: valida se já existe um pedido ativo para o orçamento.
     */
    private void validateIdempotency(UUID budgetId) {
        if (orderRepository.existsByOrcamentoIdAndStatusNot(budgetId, OrderStatus.CANCELLED)) {
            throw new ConflictException(
                    "Já existe um pedido de venda ativo para o orçamento com ID " + budgetId + ".");
        }
    }

    /**
     * Converte os itens e opções do orçamento em itens do pedido.
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
     * Constrói o {@link OrderItem} a partir do {@link BudgetItem}, calculando o valor unitário
     * derivado do subtotal congelado para evitar multiplicação dupla de quantidade.
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
     * Converte as opções de insumo do item de orçamento em opções do item do pedido.
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
     * Retorna o nome do cliente a partir do orçamento ou valor padrão.
     */
    private String resolveCustomerName(Budget budget) {
        if (budget.getClient() != null && budget.getClient().getFullName() != null) {
            return budget.getClient().getFullName();
        }
        return "Cliente não informado";
    }

    /**
     * Retorna o telefone do cliente a partir do objeto de domínio Client.
     */
    private String resolveCustomerPhone(Budget budget) {
        if (budget.getClient() != null) {
            return budget.getClient().getPhone();
        }
        return null;
    }

    /**
     * Compõe o endereço do cliente a partir dos campos individuais.
     */
    private String resolveCustomerAddress(Budget budget) {
                if (budget == null || budget.getClient() == null) {
                        return null;
                }
                
                var c = budget.getClient();
                String streetPart = formatStreetPart(c.getStreet(), c.getNumber());
                String locationPart = formatLocationPart(c.getCity(), c.getState());
                
                if (streetPart != null && locationPart != null) {
                        return streetPart + " - " + locationPart;
                }
                return streetPart != null ? streetPart : locationPart;
        }

        private String formatStreetPart(String street, String number) {
                boolean hasStreet = street != null && !street.isBlank();
                boolean hasNumber = number != null && !number.isBlank();
                
                if (hasStreet && hasNumber) {
                        return street.trim() + ", " + number.trim();
                }
                if (hasStreet) {
                        return street.trim();
                }
                if (hasNumber) {
                        return number.trim();
                }
                return null;
        }

        private String formatLocationPart(String city, String state) {
                boolean hasCity = city != null && !city.isBlank();
                boolean hasState = state != null && !state.isBlank();
                
                if (hasCity && hasState) {
                        return city.trim() + "/" + state.trim();
                }
                if (hasCity) {
                        return city.trim();
                }
                if (hasState) {
                        return state.trim();
                }
                return null;
        }

    /**
     * Retorna o identificador da condição de pagamento do orçamento.
     */
    private String resolvePaymentCondition(Budget budget) {
        if (budget.getPaymentCondition() != null) {
            return budget.getPaymentCondition().name();
        }
        return null;
    }

    /**
     * Garante que um BigDecimal nunca seja null, retornando ZERO nesse caso.
     */
    private BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
    @Override
    @Transactional
    public OrderResponse updateStatus(UUID id, OrderStatus targetStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_PEDIDO, id));

        if (targetStatus == null) {
            throw new IllegalArgumentException("O status de destino é obrigatório.");
        }
        switch (targetStatus) {
            case WAITING_PRODUCTION -> order.aguardarProducao();
            case IN_PRODUCTION -> order.iniciarProducao();
            case COMPLETED -> order.concluir(null);
            default -> throw new BusinessException(
                    "Não é permitida a transição para o status " + targetStatus + "."
            );
        }
        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderSummaryResponse> findLatestByBudgetId(UUID budgetId) {
        return orderRepository.findTopByOrcamentoIdOrderByCreatedAtDesc(budgetId)
                .map(orderMapper::toSummaryResponse);
    }

    private BigDecimal resolveLaborCost(Budget budget) {
        if (budget.getItems() == null || budget.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return budget.getItems().stream()
                .map(BudgetItem::getLaborCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}

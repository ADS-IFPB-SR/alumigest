package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * Testes formais de QA para a US-14.1: Snapshot Imutável e Lock de Preços.
 * Valida a clonagem profunda (deep copy) em 3 níveis e a blindagem contra reajuste do catálogo.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Formais de QA: US-14.1 Snapshot Imutável e Lock de Preços")
class OrderSnapshotLockTest {

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
    private Budget budget;
    private Material perfilMaterial;
    private Material vidroMaterial;
    private Product product;
    private OrderConvertRequest request;

    @BeforeEach
    void setUp() {
        budgetId = UUID.randomUUID();

        Client client = Client.builder()
                .fullName("Construtora Horizonte")
                .phone("83999991111")
                .city("Sousa")
                .state("PB")
                .build();

        perfilMaterial = new Material();
        perfilMaterial.setId(UUID.randomUUID());
        perfilMaterial.setName("Perfil Linha Suprema Branco");
        perfilMaterial.setSalePrice(new BigDecimal("120.00"));

        vidroMaterial = new Material();
        vidroMaterial.setId(UUID.randomUUID());
        vidroMaterial.setName("Vidro Temperado Incolor 8mm");
        vidroMaterial.setSalePrice(new BigDecimal("250.00"));

        product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Janela de Correr 2 Folhas");

        BudgetItemOption opcaoPerfil = new BudgetItemOption();
        opcaoPerfil.setMaterial(perfilMaterial);
        opcaoPerfil.setMaterialName(perfilMaterial.getName());
        opcaoPerfil.setCategoryType(MaterialCategoryType.PROFILE);
        opcaoPerfil.setSelectedColor("Branco");
        opcaoPerfil.setQuantity(new BigDecimal("6.00"));
        opcaoPerfil.setUnitPrice(new BigDecimal("120.00"));
        opcaoPerfil.setTotalPrice(new BigDecimal("720.00"));
        opcaoPerfil.setUnitMeasure("M");

        BudgetItemOption opcaoVidro = new BudgetItemOption();
        opcaoVidro.setMaterial(vidroMaterial);
        opcaoVidro.setMaterialName(vidroMaterial.getName());
        opcaoVidro.setCategoryType(MaterialCategoryType.GLASS);
        opcaoVidro.setSelectedType("Incolor 8mm");
        opcaoVidro.setQuantity(new BigDecimal("1.50"));
        opcaoVidro.setUnitPrice(new BigDecimal("250.00"));
        opcaoVidro.setTotalPrice(new BigDecimal("375.00"));
        opcaoVidro.setUnitMeasure("M2");

        BudgetItem item = new BudgetItem();
        item.setProduct(product);
        item.setProductName("Janela de Correr 2 Folhas Suprema");
        item.setWidthMm(new BigDecimal("1200.00"));
        item.setHeightMm(new BigDecimal("1000.00"));
        item.setQuantity(2);
        item.setSubtotal(new BigDecimal("2190.00"));
        item.setTemplateConfig("{\"aluminumColor\": \"Branco\", \"openingDirection\": \"Direita\"}");
        item.setHandleConfig("{\"model\": \"Concha Suprema\"}");
        item.addOption(opcaoPerfil);
        item.addOption(opcaoVidro);

        budget = new Budget();
        budget.setId(budgetId);
        budget.setClient(client);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setSubtotal(new BigDecimal("2190.00"));
        budget.setDiscountValue(new BigDecimal("190.00"));
        budget.setTotal(new BigDecimal("2000.00"));
        budget.addItem(item);

        request = new OrderConvertRequest(
                ApprovalChannel.WHATSAPP,
                LocalDate.now(ZoneOffset.UTC).plusDays(15),
                "Entregar no canteiro de obras"
        );
    }

    @Test
    @DisplayName("[Blindagem contra Reajuste do Catálogo] Valores congelados em OrderItem e "
            + "OrderItemOption não devem ser afetados quando o catálogo sofrer reajuste de preço")
    void shouldShieldOrderValuesFromFutureCatalogPriceIncreases() {
        // Arrange
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0001");
        given(orderRepository.saveAndFlush(any(Order.class))).willAnswer(inv -> inv.getArgument(0));

        // Act - Conversão no momento da venda (Dia D)
        orderService.convertBudgetToOrder(budgetId, request);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        // Simulação do Reajuste do Catálogo no Dia D + 5:
        // Materiais sofrem aumento de +50% no módulo de catálogo
        perfilMaterial.setSalePrice(new BigDecimal("180.00"));
        vidroMaterial.setSalePrice(new BigDecimal("375.00"));
        product.setName("Janela Reajustada Nova Linha");

        // Assert - Pedido e seus itens permanecem rigorosamente com os preços do momento da venda
        assertThat(orderSalvo.getValorBruto()).isEqualByComparingTo("2190.00");
        assertThat(orderSalvo.getValorDesconto()).isEqualByComparingTo("190.00");
        assertThat(orderSalvo.getValorLiquido()).isEqualByComparingTo("2000.00");

        List<OrderItem> items = orderSalvo.getItems();
        assertThat(items).hasSize(1);
        OrderItem orderItem = items.get(0);

        // Preço total congelado = 2190.00, valor unitário derivado (2190 / 2) = 1095.00
        assertThat(orderItem.getValorTotal()).isEqualByComparingTo("2190.00");
        assertThat(orderItem.getValorUnitario()).isEqualByComparingTo("1095.00");
        assertThat(orderItem.getDescricao()).isEqualTo("Janela de Correr 2 Folhas Suprema");
        assertThat(orderItem.getCorAluminio()).isEqualTo("Branco");
        assertThat(orderItem.getTipoVidro()).isEqualTo("Incolor 8mm");
        assertThat(orderItem.getOrientacaoAbertura()).isEqualTo("Direita");
        assertThat(orderItem.getFerragens()).contains("Puxador Concha Suprema");

        // Insumos congelados permanecem com seus custos originais
        List<OrderItemOption> orderOptions = orderItem.getOptions();
        assertThat(orderOptions).hasSize(2);

        OrderItemOption optPerfil = orderOptions.stream()
                .filter(o -> "Perfil Linha Suprema Branco".equals(o.getMaterialName()))
                .findFirst().orElseThrow();
        assertThat(optPerfil.getUnitPrice()).isEqualByComparingTo("120.00");
        assertThat(optPerfil.getTotalPrice()).isEqualByComparingTo("720.00");

        OrderItemOption optVidro = orderOptions.stream()
                .filter(o -> "Vidro Temperado Incolor 8mm".equals(o.getMaterialName()))
                .findFirst().orElseThrow();
        assertThat(optVidro.getUnitPrice()).isEqualByComparingTo("250.00");
        assertThat(optVidro.getTotalPrice()).isEqualByComparingTo("375.00");
    }

    @Test
    @DisplayName("[Clonagem Profunda 3 Níveis] Deve criar instâncias desacopladas e replicar "
            + "todos os atributos técnicos e financeiros do orçamento")
    void shouldPerformDeepCopyAcrossThreeLevels() {
        // Arrange
        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0002");
        given(orderRepository.saveAndFlush(any(Order.class))).willAnswer(inv -> inv.getArgument(0));

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        Order orderSalvo = orderCaptor.getValue();

        // Nível 1: Order
        assertThat(orderSalvo.getCodigo()).isEqualTo("OS-2026-0002");
        assertThat(orderSalvo.getClienteNome()).isEqualTo("Construtora Horizonte");
        assertThat(orderSalvo.getCanalAprovacao()).isEqualTo(ApprovalChannel.WHATSAPP);

        // Nível 2: OrderItem
        OrderItem itemSalvo = orderSalvo.getItems().get(0);
        assertThat(itemSalvo.getLarguraMm()).isEqualTo(1200);
        assertThat(itemSalvo.getAlturaMm()).isEqualTo(1000);
        assertThat(itemSalvo.getQuantidade()).isEqualTo(2);
        assertThat(itemSalvo.getTemplateConfig()).contains("aluminumColor");
        assertThat(itemSalvo.getHandleConfig()).contains("Concha Suprema");

        // Nível 3: OrderItemOption
        assertThat(itemSalvo.getOptions()).hasSize(2);
        for (OrderItemOption opt : itemSalvo.getOptions()) {
            assertThat(opt.getOrderItem()).isSameAs(itemSalvo);
            assertThat(opt.getQuantity().scale()).isLessThanOrEqualTo(2);
            assertThat(opt.getUnitPrice().scale()).isLessThanOrEqualTo(2);
            assertThat(opt.getTotalPrice().scale()).isLessThanOrEqualTo(2);
        }
    }

    @Test
    @DisplayName("[Precisão Financeira HALF_EVEN] Deve aplicar arredondamento bancário par "
            + "ao derivar o preço unitário de itens com divisão dízima periódica")
    void shouldApplyHalfEvenRoundingOnUnitPriceCalculation() {
        // Arrange: 100.00 / 3 unidades = 33.3333... deve arredondar para 33.33
        budget.getItems().get(0).setQuantity(3);
        budget.getItems().get(0).setSubtotal(new BigDecimal("100.00"));

        given(budgetRepository.findByIdWithDetails(budgetId)).willReturn(Optional.of(budget));
        given(orderRepository.existsByOrcamentoId(budgetId)).willReturn(false);
        given(orderCodeGenerator.generateNextCode()).willReturn("OS-2026-0003");
        given(orderRepository.saveAndFlush(any(Order.class))).willAnswer(inv -> inv.getArgument(0));

        // Act
        orderService.convertBudgetToOrder(budgetId, request);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).saveAndFlush(orderCaptor.capture());
        OrderItem item = orderCaptor.getValue().getItems().get(0);

        // Assert: 100.00 / 3 com HALF_EVEN e escala 2 = 33.33
        assertThat(item.getValorUnitario()).isEqualByComparingTo("33.33");
        assertThat(item.getValorTotal()).isEqualByComparingTo("100.00");
    }
}

package br.edu.ifpb.alumigest.stock.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.stock.domain.StockItem;
import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Suíte de testes de concorrência multi-thread para o módulo de estoque (US-21.8).
 *
 * <p>Valida se o lock pessimista ({@code LockModeType.PESSIMISTIC_WRITE}) em conjunto com
 * a ordenação determinística de insumos garante atomicidade, ausência de lost updates
 * e ausência de deadlocks sob disputa simultânea de 10 threads concorrentes.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("StockConcurrencyTest — Testes de Concorrência Multi-Thread com Lock Pessimista (US-21.8)")
class StockConcurrencyTest {

    private static final int THREAD_COUNT = 10;

    @Autowired
    private StockService stockService;

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    private final List<UUID> createdOrderIds = new ArrayList<>();
    private final List<UUID> createdBudgetIds = new ArrayList<>();
    private final List<UUID> createdClientIds = new ArrayList<>();
    private final List<UUID> createdMaterialIds = new ArrayList<>();
    private final List<UUID> createdGroupIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        stockMovementRepository.deleteAll();
        stockItemRepository.deleteAll();
        createdOrderIds.forEach(orderRepository::deleteById);
        createdBudgetIds.forEach(budgetRepository::deleteById);
        createdClientIds.forEach(clientRepository::deleteById);
        createdMaterialIds.forEach(materialRepository::deleteById);
        createdGroupIds.forEach(materialGroupRepository::deleteById);
        createdOrderIds.clear();
        createdBudgetIds.clear();
        createdClientIds.clear();
        createdMaterialIds.clear();
        createdGroupIds.clear();
    }

    private Material persistMaterial(String sku, BigDecimal initialPhysical) {
        String code = "GRP-CNC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        MaterialGroup group = new MaterialGroup(
            null,
            code,
            "Grupo Concorrencia",
            CalculationType.SQUARE_METER,
            null,
            false,
            true
        );
        group = materialGroupRepository.saveAndFlush(group);
        createdGroupIds.add(group.getId());

        Material material = new Material();
        material.setGroup(group);
        material.setSkuCode(sku);
        material.setName("Perfil Concorrente " + sku);
        material.setCostPrice(new BigDecimal("40.00"));
        material.setSalePrice(new BigDecimal("80.00"));
        material.setUnitMeasure(UnitMeasure.M2);
        material = materialRepository.saveAndFlush(material);
        createdMaterialIds.add(material.getId());

        StockItem stockItem = new StockItem(material);
        if (initialPhysical != null && initialPhysical.compareTo(BigDecimal.ZERO) > 0) {
            stockItem.addPhysical(initialPhysical);
        }
        stockItemRepository.saveAndFlush(stockItem);
        return material;
    }

    private Order persistOrder(OrderStatus status, Material material, BigDecimal qty) {
        Client client = Client.builder()
            .fullName("Cliente Thread Concorrente " + UUID.randomUUID().toString().substring(0, 6))
            .phone("83999991111")
            .build();
        client = clientRepository.saveAndFlush(client);
        createdClientIds.add(client.getId());

        Budget budget = new Budget();
        budget.setCode("ORC-CNC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.APPROVED);
        budget.setSubtotal(new BigDecimal("500.00"));
        budget.setTotal(new BigDecimal("500.00"));
        budget = budgetRepository.saveAndFlush(budget);
        createdBudgetIds.add(budget.getId());

        Order order = Order.builder()
            .codigo("OS-CNC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .orcamentoId(budget.getId())
            .cliente(client)
            .clienteNome(client.getFullName())
            .clienteTelefone(client.getPhone())
            .status(status)
            .canalAprovacao(ApprovalChannel.WHATSAPP)
            .dataPrevisaoEntrega(LocalDate.now(ZoneOffset.UTC).plusDays(10))
            .valorBruto(new BigDecimal("500.00"))
            .valorLiquido(new BigDecimal("500.00"))
            .build();

        OrderItem item = OrderItem.builder()
            .order(order)
            .descricao("Janela 2 Folhas")
            .larguraMm(1200)
            .alturaMm(1000)
            .quantidade(1)
            .build();

        OrderItemOption option = OrderItemOption.builder()
            .material(material)
            .materialName(material.getName())
            .unitMeasure("M2")
            .categoryType("ALUMINUM")
            .quantity(qty)
            .build();

        item.addOption(option);
        order.addItem(item);
        order = orderRepository.saveAndFlush(order);
        createdOrderIds.add(order.getId());
        return order;
    }

    @Test
    @DisplayName("10 threads simultâneas disputando reserva do mesmo insumo: sem deadlocks, sem colisões e invariante preservada")
    void shouldHandle10ConcurrentReservationsWithoutCollisionsOrDeadlocks() throws InterruptedException {
        final BigDecimal qtyPerOrder = new BigDecimal("5.0000");
        final BigDecimal initialPhysical = new BigDecimal("100.0000");
        Material material = persistMaterial("ALU-CNC-01", initialPhysical);

        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            orders.add(persistOrder(OrderStatus.WAITING_PRODUCTION, material, qtyPerOrder));
        }

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (Order order : orders) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    stockService.reserveMaterialsForOrder(order.getId());
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        assertThat(readyLatch.await(5, TimeUnit.SECONDS)).isTrue();
        startLatch.countDown();
        assertThat(finishLatch.await(30, TimeUnit.SECONDS)).isTrue();
        executor.shutdown();

        assertThat(errors).as("Nenhuma thread de reserva simultânea deve lançar erro ou sofrer deadlock").isEmpty();

        StockItem finalStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        BigDecimal expectedReserved = qtyPerOrder.multiply(BigDecimal.valueOf(THREAD_COUNT)); // 50.0000
        BigDecimal expectedAvailable = initialPhysical.subtract(expectedReserved); // 50.0000

        assertThat(finalStock.getPhysicalQuantity()).isEqualByComparingTo(initialPhysical);
        assertThat(finalStock.getReservedQuantity()).isEqualByComparingTo(expectedReserved);
        assertThat(finalStock.getAvailableQuantity()).isEqualByComparingTo(expectedAvailable);

        // Validação da invariante fundamental RN-01: available = physical - reserved
        assertThat(finalStock.getAvailableQuantity())
            .isEqualByComparingTo(finalStock.getPhysicalQuantity().subtract(finalStock.getReservedQuantity()));

        // Trilha Kardex deve conter exatamente 10 registros de PRODUCTION_RESERVATION
        List<StockMovement> movements = stockMovementRepository.findByMaterialIdOrderByCreatedAtDesc(material.getId());
        assertThat(movements)
            .hasSize(THREAD_COUNT)
            .allMatch(m -> m.getType() == StockMovementType.PRODUCTION_RESERVATION);
    }

    @Test
    @DisplayName("10 threads simultâneas disputando reserva Make-to-Order com saldo físico zero: saldo disponível negativo e consistente")
    void shouldHandle10ConcurrentReservationsWithZeroInitialStockConsistently() throws InterruptedException {
        final BigDecimal qtyPerOrder = new BigDecimal("3.0000");
        Material material = persistMaterial("ALU-CNC-02", BigDecimal.ZERO);

        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            orders.add(persistOrder(OrderStatus.WAITING_PRODUCTION, material, qtyPerOrder));
        }

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (Order order : orders) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    stockService.reserveMaterialsForOrder(order.getId());
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        assertThat(readyLatch.await(5, TimeUnit.SECONDS)).isTrue();
        startLatch.countDown();
        assertThat(finishLatch.await(30, TimeUnit.SECONDS)).isTrue();
        executor.shutdown();

        assertThat(errors).isEmpty();

        StockItem finalStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        BigDecimal expectedReserved = qtyPerOrder.multiply(BigDecimal.valueOf(THREAD_COUNT)); // 30.0000
        BigDecimal expectedAvailable = BigDecimal.ZERO.subtract(expectedReserved); // -30.0000

        assertThat(finalStock.getPhysicalQuantity()).isEqualByComparingTo("0.0000");
        assertThat(finalStock.getReservedQuantity()).isEqualByComparingTo(expectedReserved);
        assertThat(finalStock.getAvailableQuantity())
            .isEqualByComparingTo(expectedAvailable)
            .isNegative();

        // Invariante RN-01 preservada
        assertThat(finalStock.getAvailableQuantity())
            .isEqualByComparingTo(finalStock.getPhysicalQuantity().subtract(finalStock.getReservedQuantity()));
    }

    @Test
    @DisplayName("10 threads simultâneas efetuando baixa física definitiva (consumeReserved): transição atômica e invariante estável")
    void shouldHandle10ConcurrentConsumptionsWithoutDeadlocks() throws InterruptedException {
        final BigDecimal qtyPerOrder = new BigDecimal("2.5000");
        final BigDecimal initialPhysical = new BigDecimal("40.0000");
        Material material = persistMaterial("ALU-CNC-03", initialPhysical);

        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            Order order = persistOrder(OrderStatus.IN_PRODUCTION, material, qtyPerOrder);
            orders.add(order);
            stockService.reserveMaterialsForOrder(order.getId());
        }

        StockItem stockAfterReservations = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(stockAfterReservations.getReservedQuantity()).isEqualByComparingTo("25.0000");
        assertThat(stockAfterReservations.getAvailableQuantity()).isEqualByComparingTo("15.0000");

        // Dispara 10 threads concorrentes de baixa física definitiva
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (Order order : orders) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    stockService.consumeReservedMaterialsForOrder(order.getId());
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        assertThat(readyLatch.await(5, TimeUnit.SECONDS)).isTrue();
        startLatch.countDown();
        assertThat(finishLatch.await(30, TimeUnit.SECONDS)).isTrue();
        executor.shutdown();

        assertThat(errors).isEmpty();

        StockItem finalStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        assertThat(finalStock.getReservedQuantity()).isEqualByComparingTo("0.0000");
        assertThat(finalStock.getPhysicalQuantity()).isEqualByComparingTo("15.0000");
        assertThat(finalStock.getAvailableQuantity()).isEqualByComparingTo("15.0000");

        // Invariante mantida: available = physical - reserved (15.0000 = 15.0000 - 0)
        assertThat(finalStock.getAvailableQuantity())
            .isEqualByComparingTo(finalStock.getPhysicalQuantity().subtract(finalStock.getReservedQuantity()));

        // Kardex deve ter 20 movimentações no total (10 de reserva + 10 de baixa)
        List<StockMovement> movements = stockMovementRepository.findByMaterialIdOrderByCreatedAtDesc(material.getId());
        assertThat(movements).hasSize(20);
        long outflows = movements.stream().filter(m -> m.getType() == StockMovementType.PRODUCTION_OUTFLOW).count();
        long reservations = movements.stream().filter(m -> m.getType() == StockMovementType.PRODUCTION_RESERVATION).count();
        assertThat(outflows).isEqualTo(THREAD_COUNT);
        assertThat(reservations).isEqualTo(THREAD_COUNT);
    }

    @Test
    @DisplayName("10 threads simultâneas registrando entradas de compra no mesmo insumo: incremento cumulativo exato sem lost updates")
    void shouldHandle10ConcurrentManualMovementsWithoutLostUpdates() throws InterruptedException {
        final BigDecimal entryQty = new BigDecimal("10.0000");
        Material material = persistMaterial("ALU-CNC-04", BigDecimal.ZERO);

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (int i = 0; i < THREAD_COUNT; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    StockMovementRequestDTO request = new StockMovementRequestDTO(
                        material.getId(),
                        StockMovementType.PURCHASE_ENTRY,
                        entryQty,
                        new BigDecimal("25.00"),
                        "Entrada Concorrente Lote",
                        "DOC-CNC",
                        "operador.concorrente"
                    );
                    stockService.registerMovement(request);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        assertThat(readyLatch.await(5, TimeUnit.SECONDS)).isTrue();
        startLatch.countDown();
        assertThat(finishLatch.await(30, TimeUnit.SECONDS)).isTrue();
        executor.shutdown();

        assertThat(errors).isEmpty();

        StockItem finalStock = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();
        BigDecimal expectedPhysical = entryQty.multiply(BigDecimal.valueOf(THREAD_COUNT)); // 100.0000

        assertThat(finalStock.getPhysicalQuantity()).isEqualByComparingTo(expectedPhysical);
        assertThat(finalStock.getReservedQuantity()).isEqualByComparingTo("0.0000");
        assertThat(finalStock.getAvailableQuantity()).isEqualByComparingTo(expectedPhysical);

        List<StockMovement> movements = stockMovementRepository.findByMaterialIdOrderByCreatedAtDesc(material.getId());
        assertThat(movements)
            .hasSize(THREAD_COUNT)
            .allMatch(m -> m.getType() == StockMovementType.PURCHASE_ENTRY);
    }
}


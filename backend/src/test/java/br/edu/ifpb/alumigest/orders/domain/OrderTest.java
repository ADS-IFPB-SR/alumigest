package br.edu.ifpb.alumigest.orders.domain;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Testes de Domínio: Order")
class OrderTest {

    @Test
    @DisplayName("[Partição de Equivalência] Deve instanciar e inicializar valores padrão e ciclo de vida via onCreate")
    void shouldInitializeWithDefaultValuesOnCreate() {
        Order order = Order.builder()
                .codigo("PED-2026-0001")
                .orcamentoId(UUID.randomUUID())
                .clienteNome("Cliente Teste")
                .canalAprovacao(ApprovalChannel.WHATSAPP)
                .build();

        order.onCreate();

        assertThat(order.getAtivo()).isTrue();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.WAITING_PRODUCTION);
        assertThat(order.getDataAprovacao()).isEqualTo(LocalDate.now(ZoneOffset.UTC));
        assertThat(order.getDataPrevisaoEntrega())
                .isEqualTo(LocalDate.now(ZoneOffset.UTC).plusDays(15));
        assertThat(order.getCreatedAt()).isNotNull();
        assertThat(order.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("[Design Patterns / Builder] Deve construir Order completo via Builder Pattern")
    void shouldBuildOrderWithBuilderPattern() {
        UUID orderId = UUID.randomUUID();
        UUID budgetId = UUID.randomUUID();
        LocalDate entrega = LocalDate.now(ZoneOffset.UTC).plusDays(20);

        Order order = Order.builder()
                .id(orderId)
                .codigo("PED-2026-0099")
                .orcamentoId(budgetId)
                .clienteNome("Empresa XPTO")
                .clienteTelefone("83988880000")
                .clienteEndereco("Rua Central, 500")
                .canalAprovacao(ApprovalChannel.EMAIL)
                .dataPrevisaoEntrega(entrega)
                .valorBruto(new BigDecimal("5000.00"))
                .valorDesconto(new BigDecimal("500.00"))
                .taxaInstalacao(new BigDecimal("200.00"))
                .taxaFrete(new BigDecimal("100.00"))
                .valorLiquido(new BigDecimal("4800.00"))
                .condicaoPagamento("A_VISTA_PIX")
                .observacoesPagamento("50% sinal")
                .observacoes("Entregar no depósito")
                .build();

        assertThat(order.getId()).isEqualTo(orderId);
        assertThat(order.getCodigo()).isEqualTo("PED-2026-0099");
        assertThat(order.getOrcamentoId()).isEqualTo(budgetId);
        assertThat(order.getClienteNome()).isEqualTo("Empresa XPTO");
        assertThat(order.getCanalAprovacao()).isEqualTo(ApprovalChannel.EMAIL);
        assertThat(order.getValorBruto()).isEqualByComparingTo("5000.00");
        assertThat(order.getValorLiquido()).isEqualByComparingTo("4800.00");
        assertThat(order.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve rejeitar cancelamento quando justificativa tiver 9 caracteres (fronteira inferior inválida)")
    void shouldRejectCancellationWhenJustificationHasNineCharacters() {
        Order order = Order.builder()
                .status(OrderStatus.WAITING_PRODUCTION)
                .build();

        // 9 caracteres: "123456789"
        assertThatThrownBy(() -> order.cancelar("123456789"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("pelo menos 10 caracteres");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve aceitar cancelamento quando justificativa tiver exatamente 10 caracteres (fronteira inferior válida)")
    void shouldAcceptCancellationWhenJustificationHasTenCharacters() {
        Order order = Order.builder()
                .status(OrderStatus.WAITING_PRODUCTION)
                .build();

        // 10 caracteres exatos: "1234567890"
        order.cancelar("1234567890");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(order.getJustificativaCancelamento()).isEqualTo("1234567890");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve rejeitar cancelamento com justificativa nula ou em branco")
    void shouldRejectCancellationWhenJustificationIsNullOrBlank() {
        Order order = Order.builder()
                .status(OrderStatus.CREATED)
                .build();

        assertThatThrownBy(() -> order.cancelar(null))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> order.cancelar("          "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("[Transição de Estados] Deve permitir cancelamento a partir do estado CREATED")
    void shouldAllowCancellationFromCriadoStatus() {
        Order order = Order.builder()
                .status(OrderStatus.CREATED)
                .build();

        order.cancelar("Cliente desistiu da compra antes da produção");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(order.getJustificativaCancelamento()).isEqualTo("Cliente desistiu da compra antes da produção");
    }

    @Test
    @DisplayName("[Transição de Estados] Deve rejeitar cancelamento quando o pedido já estiver em IN_PRODUCTION")
    void shouldRejectCancellationWhenInProduction() {
        Order order = Order.builder()
                .status(OrderStatus.IN_PRODUCTION)
                .build();

        assertThatThrownBy(() -> order.cancelar("Perfis já foram cortados na fábrica"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não é possível cancelar um pedido no status IN_PRODUCTION");
    }

    @Test
    @DisplayName("[Transição de Estados] Deve rejeitar cancelamento quando o pedido já estiver em COMPLETED")
    void shouldRejectCancellationWhenCompleted() {
        Order order = Order.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        assertThatThrownBy(() -> order.cancelar("Tentativa de cancelamento de pedido já entregue"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não é possível cancelar um pedido no status COMPLETED");
    }

    @Test
    @DisplayName("[Transição de Estados] Deve transitar para IN_PRODUCTION com sucesso quando status atual for WAITING_PRODUCTION")
    void shouldTransitionToEmProducao() {
        Order order = Order.builder()
                .status(OrderStatus.WAITING_PRODUCTION)
                .build();

        order.iniciarProducao();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.IN_PRODUCTION);
    }

    @Test
    @DisplayName("[Transição de Estados] Deve rejeitar transição para IN_PRODUCTION quando não estiver WAITING_PRODUCTION")
    void shouldRejectTransitionToEmProducaoFromInvalidState() {
        Order order = Order.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        assertThatThrownBy(order::iniciarProducao)
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Apenas pedidos aguardando produção podem entrar em produção.");
    }

    @Test
    @DisplayName("[Transição de Estados] Deve concluir pedido com sucesso a partir de IN_PRODUCTION")
    void shouldConcludeOrderFromEmProducao() {
        Order order = Order.builder()
                .status(OrderStatus.IN_PRODUCTION)
                .build();

        LocalDate dataEntrega = LocalDate.of(2026, 10, 10);
        order.concluir(dataEntrega);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);
        assertThat(order.getDataConclusao()).isEqualTo(dataEntrega);
    }

    @Test
    @DisplayName("[Encapsulamento / Clean Code] Deve proteger a coleção de itens retornando lista imutável")
    void shouldProtectItemsCollectionImmutability() {
        Order order = Order.builder().build();
        OrderItem item = OrderItem.builder().descricao("Item Protegido").build();
        List<OrderItem> items = order.getItems();

        assertThatThrownBy(() -> items.add(item))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve gerenciar itens do pedido de forma bidirecional")
    void shouldManageOrderItemsBidirectionally() {
        Order order = Order.builder().build();
        OrderItem item = OrderItem.builder()
                .descricao("Janela 2 Folhas")
                .quantidade(2)
                .larguraMm(1200)
                .alturaMm(1000)
                .valorUnitario(new BigDecimal("450.00"))
                .valorTotal(new BigDecimal("900.00"))
                .build();

        order.addItem(item);

        assertThat(order.getItems()).containsExactly(item);
        assertThat(item.getOrder()).isEqualTo(order);

        order.removeItem(item);

        assertThat(order.getItems()).isEmpty();
        assertThat(item.getOrder()).isNull();
    }
}

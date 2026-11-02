# [US-30.6] Integrar Contabilização Automática da O.S. em `OrderServiceImpl`

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.6`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / Integração entre Bounded Contexts (`orders` e `finance`)
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderServiceImpl.java`
- **Labels**: `backend`, `orders`, `finance`, `transactional`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Conectar o ciclo de vida da Ordem de Serviço ao Módulo Financeiro, garantindo que:
1. **Ao aprovar/converter um orçamento em Pedido de Venda (`convertBudgetToOrder`):** O `CashFlowService` seja invocado na mesma transação para gerar a entrada financeira no caixa.
2. **Ao cancelar formalmente um pedido (`cancelOrder` na US-15):** O `CashFlowService` seja invocado para estornar/cancelar o lançamento correspondente no caixa.

Essa integração elimina 100% da necessidade de o operador abrir planilhas externas para redigitar os valores de vendas fechadas.

---

## 📐 Ponto de Injeção e Atomicidade Transacional

Em `OrderServiceImpl.java`:
```java
@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final BudgetService budgetService;
    private final CashFlowService cashFlowService; // Injeção do serviço financeiro

    @Override
    @Transactional
    public OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request) {
        // ... fluxo existente de criacao e snapshot da O.S. ...
        Order savedOrder = orderRepository.save(order);

        // Blindagem: Registro automatico de entrada no caixa
        cashFlowService.registerOrderInflow(
            savedOrder.getId(),
            savedOrder.getCodigo(),
            savedOrder.getClienteNome(),
            savedOrder.getValorLiquido(),
            savedOrder.getDataAprovacao().toLocalDate(),
            savedOrder.getCanalAprovacao().name()
        );

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id, OrderCancelRequest request) {
        // ... fluxo existente de validacao de cancelamento ...
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Blindagem: Estorno automatico da entrada no fluxo de caixa
        cashFlowService.cancelOrderInflow(savedOrder.getId());

        return orderMapper.toResponse(savedOrder);
    }
}
```

---

## 🚦 Critérios de Aceitação
1. A conversão de um orçamento elegível cria a O.S. e insere a movimentação `INFLOW` na mesma transação atômica.
2. Se a gravação no caixa falhar por qualquer inconsistência, a conversão da O.S. sofre rollback automático (evitando O.S. sem caixa ou vice-versa).
3. O cancelamento de um pedido (`cancelOrder`) anula o lançamento no caixa, recalculando o saldo mensal.
4. Testes de integração em `OrderControllerIntegrationTest` cobrem o fluxo completo de ponta a ponta.

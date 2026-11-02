# [US-30.5] Implementar Serviço `CashFlowService` com Regras de Negócio Financeiras

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.5`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / Camada de Serviço (`@Service`)
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- **Labels**: `backend`, `service`, `solid`, `clean-architecture`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Implementar a interface `CashFlowService` e sua implementação `CashFlowServiceImpl` com as regras de negócio centrais do fluxo de caixa:
1. **Calcular Resumo Mensal:** Apurar total de entradas, total de saídas e saldo líquido com precisão via `BigDecimal`.
2. **Registrar Entrada de O.S.:** Método idempotente chamado pelo módulo de pedidos para criar a entrada correspondente.
3. **Estornar Entrada de O.S.:** Método para cancelar a entrada financeira quando a O.S. for cancelada.
4. **Cadastrar Despesa:** Salvar uma saída operacional manual.
5. **Remover Despesa:** Excluir ou cancelar uma despesa lançada erroneamente.

---

## 📐 Métodos Obrigatórios do Contrato `CashFlowService`

```java
public interface CashFlowService {

    CashFlowSummaryResponse getMonthlySummary(int year, int month);

    List<CashFlowMovementResponse> getMovementsByMonth(int year, int month);

    CashFlowMovementResponse registerExpense(ExpenseCreateRequest request);

    void deleteExpense(UUID expenseId);

    void registerOrderInflow(
        UUID orderId, 
        String orderCode, 
        String customerName, 
        BigDecimal totalAmount, 
        LocalDate approvalDate, 
        String channel
    );

    void cancelOrderInflow(UUID orderId);
}
```

---

## 🚦 Regras de Negócio e Blindagens
- **RN-01 (Cálculo de Saldo Líquido):** $\text{netBalance} = \text{totalInflows} - \text{totalOutflows}$.
- **RN-02 (Idempotência no Registro de O.S.):** Se já existir um lançamento `INFLOW` ativo para aquele `orderId`, o método não duplica a movimentação (registra log informativo e retorna pacificamente).
- **RN-03 (Mapeamento de Canal):** Canais como `WHATSAPP`, `PRESENCIAL`, `EMAIL` são mapeados de forma amigável no campo `payment_method` ou mantêm o enum correspondente.
- **RN-04 (Tratamento de Exceções):** Lançamento de `ResourceNotFoundException` caso a despesa a ser excluída não exista.

---

## 🚦 Critérios de Aceitação
1. Todas as operações de escrita são decoradas com `@Transactional`.
2. O cálculo de saldo líquido e agrupamentos por mês é 100% testado em `CashFlowServiceTest`.
3. Cobertura de testes unitários $\ge 80\%$.

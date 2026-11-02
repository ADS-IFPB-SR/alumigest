# [US-30.3] Criar Repositório `CashFlowRepository` com Agregações Financeiras

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.3`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / Persistência (Spring Data JPA)
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- **Labels**: `backend`, `repository`, `jpa`, `finance`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Implementar o contrato de repositório `CashFlowRepository` estendendo `JpaRepository<CashFlow, UUID>` e `JpaSpecificationExecutor<CashFlow>`, provendo consultas otimizadas para:
1. Somar total de entradas ativas (`INFLOW`) no mês.
2. Somar total de saídas ativas (`OUTFLOW`) no mês.
3. Buscar lançamentos do período com ordenação cronológica decrescente.
4. Localizar lançamento por `order_id` para controle de estorno.

---

## 📐 Métodos de Consulta no Repositório

```java
public interface CashFlowRepository extends JpaRepository<CashFlow, UUID>, JpaSpecificationExecutor<CashFlow> {

    @Query("""
        SELECT COALESCE(SUM(c.amount), 0) FROM CashFlow c
        WHERE c.movementType = 'INFLOW'
          AND c.isCancelled = false
          AND c.flowDate BETWEEN :startDate AND :endDate
    """)
    BigDecimal sumTotalInflowsByPeriod(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(c.amount), 0) FROM CashFlow c
        WHERE c.movementType = 'OUTFLOW'
          AND c.isCancelled = false
          AND c.flowDate BETWEEN :startDate AND :endDate
    """)
    BigDecimal sumTotalOutflowsByPeriod(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT c FROM CashFlow c
        WHERE c.flowDate BETWEEN :startDate AND :endDate
          AND c.isCancelled = false
        ORDER BY c.flowDate DESC, c.createdAt DESC
    """)
    List<CashFlow> findAllByPeriod(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    Optional<CashFlow> findByOrderIdAndMovementType(UUID orderId, MovementType movementType);
}
```

---

## 🚦 Critérios de Aceitação
1. As queries de soma utilizam `COALESCE(SUM(...), 0)` para nunca retornar `null` caso o mês não tenha movimentações.
2. Apenas movimentações ativas (`isCancelled = false`) são totalizadas.
3. Método `findByOrderIdAndMovementType` permite buscar a movimentação de uma O.S. para fins de cancelamento/estorno.
4. Testes de repositório validam somatórios de meses diferentes de forma isolada.

# [US-30.2] Criar Entidade JPA `CashFlow` e Enums de Domínio

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.2`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / Domínio JPA
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- **Labels**: `backend`, `domain`, `jpa`, `finance`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Mapear a entidade JPA `CashFlow` e os enums de apoio (`MovementType`, `ExpenseCategory`, `PaymentMethod`) no pacote `br.edu.ifpb.alumigest.finance.domain`.

A entidade deve respeitar o princípio de encapsulamento, immutabilidade de valores monetários e precisão via `BigDecimal`.

---

## 📐 Especificação Técnica

### 1. Enums de Domínio
- **`MovementType`**:
  - `INFLOW` (Entrada / Receita)
  - `OUTFLOW` (Saída / Despesa)
- **`ExpenseCategory`**:
  - `ORDER_SALE` (Receita de Ordem de Serviço)
  - `PART_SALE` (Receita de Venda Avulsa)
  - `MATERIAIS` (Compra de perfis, chapas de vidro, ferragens e insumos)
  - `OPERACIONAL` (Energia elétrica, água, aluguel, manutenção de maquinário, combustível)
  - `PESSOAL` (Comissões, diárias e folha da oficina)
  - `RETIRADA` (Pró-labore ou retiradas da gestão)
  - `OUTROS` (Despesas diversas)
- **`PaymentMethod`**:
  - `PIX`, `DINHEIRO`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `BOLETO`, `TRANSFERENCIA`

### 2. Atributos da Entidade `CashFlow`
```java
@Entity
@Table(name = "tb_cash_flows")
public class CashFlow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 10)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private ExpenseCategory category;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "flow_date", nullable = false)
    private LocalDate flowDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "part_sale_id")
    private UUID partSaleId;

    @Column(name = "is_cancelled", nullable = false)
    private boolean isCancelled = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
```

---

## 🚦 Critérios de Aceitação
1. A entidade compila sem warnings com Hibernate 6 e JPA 3.
2. Contém construtores estáticos ou métodos de fábrica claros (ex: `CashFlow.createInflowFromOrder(...)` e `CashFlow.createExpense(...)`).
3. Método `cancel()` para marcação de estorno seguro sem delete físico (*soft-reversal*).

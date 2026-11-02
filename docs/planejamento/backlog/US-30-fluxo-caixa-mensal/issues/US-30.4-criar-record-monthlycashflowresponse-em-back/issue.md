# [US-30.4] Criar Records e DTOs Java 21 para o Módulo Financeiro

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.4`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / DTOs & Contratos
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/`
- **Labels**: `backend`, `dto`, `records`, `clean-code`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Criar os Records imutáveis em Java 21 para transporte de dados das requisições e respostas financeiras, garantindo que o backend entregue os totais e saldos já calculados (preservando o princípio SOLID e impedindo regras financeiras no frontend).

---

## 📐 Estrutura dos Records

### 1. `CashFlowSummaryResponse.java`
Contrato do painel consolidado mensal:
```java
public record CashFlowSummaryResponse(
    int year,
    int month,
    BigDecimal totalInflows,
    BigDecimal totalOutflows,
    BigDecimal netBalance
) {
    public CashFlowSummaryResponse {
        Objects.requireNonNull(totalInflows);
        Objects.requireNonNull(totalOutflows);
        Objects.requireNonNull(netBalance);
    }
}
```

### 2. `ExpenseCreateRequest.java`
Payload de cadastro de despesa operacional:
```java
public record ExpenseCreateRequest(
    @NotBlank(message = "A descrição da despesa é obrigatória")
    @Size(min = 3, max = 255, message = "A descrição deve ter entre 3 e 255 caracteres")
    String description,

    @NotNull(message = "A categoria da despesa é obrigatória")
    ExpenseCategory category,

    @NotNull(message = "O valor da despesa é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor da despesa deve ser maior que zero")
    BigDecimal amount,

    @NotNull(message = "A data da despesa é obrigatória")
    LocalDate flowDate,

    @NotNull(message = "A forma de pagamento é obrigatória")
    PaymentMethod paymentMethod
) {}
```

### 3. `CashFlowMovementResponse.java`
Linha individual para o extrato cronológico:
```java
public record CashFlowMovementResponse(
    UUID id,
    MovementType movementType,
    ExpenseCategory category,
    String description,
    BigDecimal amount,
    LocalDate flowDate,
    PaymentMethod paymentMethod,
    UUID orderId,
    Instant createdAt
) {}
```

---

## 🚦 Critérios de Aceitação
1. Validações Jakarta (`@NotNull`, `@NotBlank`, `@DecimalMin`) protegem as entradas contra dados inválidos (retornando HTTP 400).
2. O saldo líquido `netBalance` é entregue diretamente no DTO, sem exigir operações aritméticas no frontend.
3. Classes utilizam Records nativos do Java 21 com imutabilidade estrita.

# 🛠️ Tarefa de Correção: Ajustes P0 e P1 do PR #293 (US-09)

Por favor, aplique as correções abaixo na branch `feat/us-09-descontos-condicoes-comerciais`. Elas corrigem um bloqueador crítico de migração do Flyway (P0) e pontos de consistência de código/transação (P1).

---

## 🔴 [P0 - CRÍTICO] Corrigir Conflito de Versionamento das Migrations Flyway

### Contexto:
Na branch `develop`, o arquivo `V11__limpar_dados_fantasmas.sql` já existe e já foi executado. Neste PR, a migration antiga foi indevidamente renomeada para V18 e a nova migration de condições comerciais foi nomeada como V11. Isso causará erro fatal de `FlywayValidateException: Migration checksum mismatch for migration version 11` em bancos persistidos.

### Ação Necessária:
1. **Restaurar** `V18__limpar_dados_fantasmas.sql` de volta para `V11__limpar_dados_fantasmas.sql`.
2. **Renomear** a nova migration `V11__add_commercial_conditions_to_budgets.sql` para `V18__add_commercial_conditions_to_budgets.sql`.

### Comandos Git:
```bash
git mv backend/src/main/resources/db/migration/V18__limpar_dados_fantasmas.sql backend/src/main/resources/db/migration/V11__limpar_dados_fantasmas.sql
git mv backend/src/main/resources/db/migration/V11__add_commercial_conditions_to_budgets.sql backend/src/main/resources/db/migration/V18__add_commercial_conditions_to_budgets.sql
```

---

## 🟡 [P1 - BACKEND] Adicionar `@Transactional` em `BudgetService.alterarStatus`

### Arquivo:
`backend/src/main/java/com/alumigest/service/BudgetService.java`

### Problema:
O método `alterarStatus` realiza mutação de estado e persistência no banco, mas está sem a anotação de transação `@Transactional`.

### Correção:
Adicionar `@Transactional` sobre o método (linha ~162):

```java
// ANTES:
public BudgetResponseDTO alterarStatus(UUID id, StatusChangeRequest request) {
    Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado com ID: " + id));

    budget.alterarStatus(request.status(), request.motivoRejeicao());
    Budget updated = budgetRepository.save(budget);
    return budgetMapper.toResponseDTO(updated);
}

// DEPOIS:
@Transactional
public BudgetResponseDTO alterarStatus(UUID id, StatusChangeRequest request) {
    Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado com ID: " + id));

    budget.alterarStatus(request.status(), request.motivoRejeicao());
    Budget updated = budgetRepository.save(budget);
    return budgetMapper.toResponseDTO(updated);
}
```

---

## 🟡 [P1 - BACKEND] Alinhar checagem de expiração no `BudgetMapper` com a regra de domínio

### Arquivo:
`backend/src/main/java/com/alumigest/mapper/BudgetMapper.java`

### Problema:
O mapper calcula `expired` apenas verificando se `validUntil` é anterior ao momento atual, ignorando o status do orçamento. Se um orçamento foi `APROVADO`, `REJEITADO` ou `CANCELADO`, ele não deve constar como expirado. A entidade de domínio `Budget.java` já possui o método correto `budget.isExpired()`.

### Correção:
Substituir a expressão em `@Mapping(target = "expired", ...)` para delegar diretamente a `budget.isExpired()`:

```java
// ANTES:
@Mapping(target = "expired", expression = "java(budget.getValidUntil() != null && budget.getValidUntil().isBefore(java.time.OffsetDateTime.now()))")

// DEPOIS:
@Mapping(target = "expired", expression = "java(budget.isExpired())")
```

---

## 🟡 [P1 - BACKEND] Corrigir Typos nas anotações OpenAPI/Swagger do `BudgetController`

### Arquivo:
`backend/src/main/java/com/alumigest/controller/BudgetController.java`

### Correções:
1. Na linha ~147:
   - De: `"Aplica um **descontto** financeiro"`
   - Para: `"Aplica um **desconto** financeiro"`
2. Nas linhas ~154 e ~179:
   - De: `"Orçamento não **econtrado**"`
   - Para: `"Orçamento não **encontrado**"`

---

## ✅ Verificação e Commit

Após aplicar as alterações, execute os testes para garantir que tudo compila e passa perfeitamente:

```bash
cd backend
./mvnw clean test
```

Em seguida, faça o commit e push das alterações:

```bash
git add backend/
git commit -m "fix(budgets): corrigir numeracao de migration flyway e consistencia de expiracao e transacao"
git push origin feat/us-09-descontos-condicoes-comerciais
```

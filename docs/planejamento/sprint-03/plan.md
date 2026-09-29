# ⚙️ Plano de Implementação Técnica — Sprint 03

> **Fase:** Clientes, Motor de Orçamentos e Templates  
> **Status:** 🟢 Executado e Homologado  

---

## 1. 🏛️ Constitution Check
- ✅ Pacotes `br.edu.ifpb.alumigest.clients` e `br.edu.ifpb.alumigest.budgets`.
- ✅ Strategy Pattern com `QuantityCalculatorStrategy` e `QuantityCalculatorFactory`.
- ✅ Migrations Flyway V8, V9 e V10 (`tb_customers`, `tb_budgets`, `tb_budget_items`, `tb_budget_item_options`).
- ✅ Records Java imutáveis para DTOs e MapStruct.
- ✅ SonarQube Scanner integrado com JaCoCo.

---

## 2. 📦 Estrutura de Pacotes

```
backend/src/main/java/br/edu/ifpb/alumigest/
├── clients/
│   ├── controller/ (ClientController)
│   ├── domain/ (Client, PersonType)
│   ├── dto/ (ClientRequestDTO, ClientResponseDTO)
│   ├── repository/ (ClientRepository)
│   └── service/ (ClientService)
└── budgets/
    ├── calculator/
    │   ├── QuantityCalculatorStrategy.java
    │   ├── QuantityCalculatorFactory.java
    │   └── impl/ (GlassQuantityCalculator, ProfileQuantityCalculator, HardwareQuantityCalculator, FilmQuantityCalculator)
    ├── controller/ (BudgetController)
    ├── domain/ (Budget, BudgetItem, BudgetItemOption, BudgetStatus)
    ├── dto/ (BudgetRequestDTO, BudgetResponseDTO, BudgetItemRequestDTO, etc.)
    ├── mapper/ (BudgetMapper)
    ├── repository/ (BudgetRepository, BudgetItemRepository)
    └── service/ (BudgetService, BudgetPricingService, BudgetCodeGeneratorService)
```

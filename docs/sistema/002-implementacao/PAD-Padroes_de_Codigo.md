# PAD — Padrões de Código
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Sigla:** ALG  
**Versão:** 2.0 (Atualizado com convenções IFPB, UUIDs, MapStruct e Nomenclatura Oficial)  
**Data:** 31/08/2026  
**Autor:** Equipe de Engenharia AlumiGest (Scrum Master: Italo Santos)  

---

## 1. Convenções Java (Backend Spring Boot 3.4 / Java 21)

### 1.1 Nomenclatura e Idioma

> 📌 **Diretriz de Idioma:** Código-fonte (classes, métodos, variáveis, DTOs e entidades) é escrito em **inglês técnico**. Mensagens de validação de formulários, erros de API, interfaces de usuário e documentação de requisitos são escritas em **Português do Brasil (`pt-br`)**.

| Elemento | Convenção | Exemplo |
|---|---|---|
| Classe / Record | PascalCase | `BudgetService`, `GlassController`, `BudgetRequestDTO` |
| Interface | PascalCase | `QuantityCalculatorStrategy`, `BudgetRepository` |
| Método | camelCase | `calculateQuantity()`, `findById()`, `updateStatus()` |
| Variável / Parâmetro | camelCase | `linearMeterPrice`, `glassAreaM2`, `subtotal` |
| Constante | UPPER_SNAKE_CASE | `MINIMUM_GLASS_AREA_M2`, `DEFAULT_VALIDITY_DAYS` |
| Pacote | lowercase | `br.edu.ifpb.alumigest.budgets.service` |
| Enum (Tipo e Valores) | PascalCase (tipo), UPPER_SNAKE (valores) | `BudgetStatus.DRAFT`, `TemplateType.SLIDING_DOOR_2F` |
| Tabela (DB) | snake_case com prefixo `tb_*` | `tb_budgets`, `tb_materials`, `tb_customers` |
| Coluna (DB) | snake_case | `cost_price`, `thickness_mm`, `template_config` |

---

### 1.2 Organização de Pacotes (`package-by-feature`)

```
br.edu.ifpb.alumigest.{feature}/
├── controller/    → @RestController e anotações OpenAPI Swagger
├── service/       → @Service com regras de negócio e orquestração
├── repository/    → JpaRepository<Entity, UUID> e queries JPQL
├── domain/        → Entidades JPA (@Entity), Enums e Value Objects
├── dto/           → Records Java imutáveis de entrada e saída
├── mapper/        → Interfaces MapStruct (@Mapper(componentModel = "spring"))
└── calculator/    → (Módulo budgets) Strategy e Factory de precificação física
```

---

### 1.3 Padrões de Controller REST

```java
@RestController
@RequestMapping({"/api/orcamentos", "/api/v1/budgets"})
@Tag(name = "Orçamentos", description = "Endpoints para gerenciamento de orçamentos")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Criar orçamento", description = "Cria um novo orçamento com cálculo automático.")
    public ResponseEntity<BudgetResponseDTO> create(@RequestBody @Valid BudgetRequestDTO request) {
        BudgetResponseDTO response = budgetService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }
}
```

---

### 1.4 Padrões de Service e Transacionalidade

```java
@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetPricingService pricingService;
    private final BudgetMapper mapper;

    @Transactional
    public BudgetResponseDTO create(BudgetRequestDTO request) {
        // 1. Validação de regras de negócio
        // 2. Mapeamento DTO -> Entidade
        // 3. Execução do motor de cálculo via PricingService
        // 4. Persistência
        // 5. Retorno do DTO de resposta
    }
}
```

---

### 1.5 Padrões de DTO (Java Records & JSR-380)

```java
public record BudgetRequestDTO(
    @NotNull(message = "O ID do cliente é obrigatório")
    UUID clientId,

    @DecimalMin(value = "0.0", message = "O percentual de desconto não pode ser negativo")
    @DecimalMax(value = "100.0", message = "O desconto não pode ultrapassar 100%")
    BigDecimal discountPercent,

    @DecimalMin(value = "0.0", message = "O valor de desconto não pode ser negativo")
    BigDecimal discountValue,

    String notes,

    @NotEmpty(message = "O orçamento deve conter pelo menos 1 item")
    @Valid
    List<BudgetItemRequestDTO> items
) {}
```

---

### 1.6 Tratamento de Exceções e Erros

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY.value(), ex.getMessage()));
    }
}
```

---

## 2. Convenções Frontend (React 18 + TypeScript + Vite + Tailwind)

### 2.1 Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componente React | PascalCase | `BudgetWizardModal.tsx`, `GlassFormModal.tsx` |
| Custom Hook | camelCase com prefixo `use` | `useBudgets.ts`, `useDebounce.ts` |
| Função Utilitária | camelCase | `formatCurrency()`, `calculateM2()` |
| Interface / Type | PascalCase | `BudgetResponse`, `BudgetItemOption` |
| Estilização | Classes Utilitárias Tailwind | `className="flex items-center gap-2 p-4"` |

### 2.2 Padrão de Chamadas HTTP

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const budgetService = {
  async create(data: BudgetRequest): Promise<BudgetResponse> {
    const response = await api.post<BudgetResponse>('/budgets', data);
    return response.data;
  },
};
```

---

## 3. Convenções de Banco de Dados (PostgreSQL 16 & Flyway)

```sql
-- Padrão de Migration Flyway: V{N}__{descricao_em_snake_case}.sql
CREATE TABLE tb_customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    person_type VARCHAR(20) NOT NULL,
    cpf_cnpj    VARCHAR(20) UNIQUE,
    phone       VARCHAR(20),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_name ON tb_customers(name);
CREATE INDEX idx_customers_active ON tb_customers(is_active);
```

---

## 4. Qualidade e Análise Estática

* **Backend:** Validação contínua via **Checkstyle (`google_checks.xml`)**, **JaCoCo** e **SonarQube Scanner**.
* **Frontend:** Validação via **Oxlint**, **TypeScript Compiler (`tsc`)** e testes **Cypress E2E**.

---

*Padrões de Código homologados pela Equipe AlumiGest — Versão 2.0 — 31/08/2026*

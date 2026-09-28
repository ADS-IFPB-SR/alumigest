# 📏 PAD — Padrões de Código e Diretrizes de Qualidade (AlumiGest)

| Metadado | Descrição |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 3.0 (Homologado com Protocolo SonarLint, BigDecimal Estrito, TanStack Query v5 e Zod) |
| **Data** | 24/09/2026 |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial dos padrões de código | Ítalo Jefferson / Equipe AlumiGest |
| 31/08/2026 | 2.0 | Atualização para padrão `br.edu.ifpb.alumigest`, UUIDs nativos, MapStruct e Nomenclatura Oficial | Equipe AlumiGest (Scrum Master: Italo Santos) |
| 24/09/2026 | 3.0 | Incorporação do protocolo SonarLint, regras de precisão BigDecimal com RoundingMode explícito, TanStack Query v5, schemas Zod e Quality Gate SonarQube | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |

---

## 1. Convenções Java (Backend Spring Boot 3.4 / Java 21)

### 1.1 Nomenclatura e Idioma

> 📌 **Diretriz de Idioma:** Código-fonte (classes, métodos, variáveis, DTOs e entidades) é escrito em **inglês técnico**. Mensagens de validação de formulários, respostas de erro de API, interfaces visuais e documentação de requisitos são escritas em **Português do Brasil (`pt-br`)**.

| Elemento | Convenção | Exemplo |
|---|---|---|
| Classe / Record | PascalCase | `BudgetService`, `GlassQuantityCalculator`, `BudgetResponseDTO` |
| Interface | PascalCase | `MaterialQuantityCalculator`, `BudgetRepository` |
| Método | camelCase | `calculateQuantities()`, `findById()`, `aplicarDesconto()` |
| Variável / Parâmetro | camelCase | `linearMeterPrice`, `glassAreaM2`, `subtotal`, `widthMm` |
| Constante | UPPER_SNAKE_CASE | `MIN_AREA`, `RESOURCE_ORCAMENTO`, `DEFAULT_VALIDITY_DAYS` |
| Pacote | lowercase | `br.edu.ifpb.alumigest.budgets.service` |
| Enum (Tipo e Valores) | PascalCase (tipo), UPPER_SNAKE (valores) | `BudgetStatus.DRAFT`, `PaymentCondition.A_VISTA_PIX` |
| Tabela (DB) | snake_case com prefixo `tb_*` | `tb_budgets`, `tb_budget_items`, `tb_customers` |
| Coluna (DB) | snake_case | `cost_price`, `thickness_mm`, `template_config` |

---

### 1.2 Regras Estritas de Precisão Numérica (`BigDecimal` e `RoundingMode`)

Para eliminar erros de arredondamento em cortes de esquadrias e fechamento contábil de orçamentos, aplicam-se as seguintes regras inegociáveis:

1. **Proibição de Tipos Flutuantes:** É expressamente vedado o uso de `double` ou `float` para qualquer cálculo financeiro ou dimensionamento físico. Utilizar sempre `java.math.BigDecimal`.
2. **Cálculos Financeiros (Monetários):**
   * Escala padrão: **2 casas decimais**.
   * Modo de arredondamento: `RoundingMode.HALF_EVEN` (arredondamento bancário) ou `RoundingMode.HALF_UP`.
   ```java
   BigDecimal discountValue = subtotal.multiply(discountPercent)
           .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_EVEN);
   ```
3. **Cálculos Físicos de Corte (Metros e Áreas):**
   * Metragem linear de perfis: escala de 2 casas decimais com `RoundingMode.CEILING` (para garantir folga e evitar barra insuficiente no corte).
   * Área de vidro/película: escala de 2 casas decimais com `RoundingMode.CEILING` e validação do piso mínimo de $0,25 m^2$.
   * Fatores de conversão de milímetros para metros: divisão por 1000 com 4 casas decimais e `RoundingMode.HALF_UP`.
   ```java
   BigDecimal widthM = BigDecimal.valueOf(widthMm).divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
   ```

---

### 1.3 Organização de Pacotes (`package-by-feature`)

```
br.edu.ifpb.alumigest.{feature}/
├── controller/    → @RestController e anotações OpenAPI Swagger 3.0
├── service/       → @Service com regras de negócio e transações (@Transactional)
├── repository/    → JpaRepository<Entity, UUID> e queries customizadas JPQL
├── domain/        → Entidades JPA (@Entity, @Table(name = "tb_*")), Enums
├── dto/           → Records Java imutáveis de entrada e saída com JSR-380
├── mapper/        → Interfaces MapStruct (@Mapper(componentModel = "spring"))
└── calculator/    → (Módulo budgets) Padrão Strategy e Factory de cálculo
```

---

### 1.4 Padrões de Controllers REST

* Retornar `ResponseEntity<T>` com status HTTP semântico (`200 OK`, `201 Created`, `204 No Content`).
* Utilizar anotações OpenAPI (`@Operation`, `@ApiResponse`, `@Tag`).
* Validação de payload de entrada obrigatória com `@Valid`.

```java
@RestController
@RequestMapping({"/api/v1/budgets", "/api/orcamentos"})
@Tag(name = "Orçamentos", description = "Endpoints para gerenciamento do ciclo de vida de orçamentos")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Criar orçamento", description = "Cria um novo orçamento com cálculo automático de insumos e preços.")
    public ResponseEntity<BudgetResponseDTO> create(@RequestBody @Valid BudgetCreateRequest request) {
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

### 1.5 Padrões de DTO (Java Records & JSR-380)

* Todos os DTOs devem ser implementados como `record` para garantir imutabilidade estrutural.
* Anotações de validação JSR-380 (`@NotNull`, `@NotBlank`, `@DecimalMin`, `@DecimalMax`, `@Size`, `@Valid`).

```java
public record DiscountRequest(
    @NotNull(message = "O tipo de desconto é obrigatório.")
    DiscountType tipo,

    @NotNull(message = "O valor do desconto é obrigatório.")
    @DecimalMin(value = "0.01", message = "O valor do desconto deve ser maior que zero.")
    BigDecimal valor,

    PaymentCondition condicaoPagamento,
    String observacoesPagamento,
    LocalDate dataValidade
) {}
```

---

### 1.6 Tratamento Global de Exceções

* Centralizado na classe `GlobalExceptionHandler` (`@RestControllerAdvice`).
* Respostas padronizadas com classe de payload de erro `ErrorResponse` (status, mensagem, timestamp).

---

## 2. Convenções Frontend (React 18/19 + TypeScript + Vite + Tailwind)

### 2.1 Nomenclatura e Tipagem
* **Componentes React:** PascalCase (`BudgetDetailPage.tsx`, `CustomerQuickCreateModal.tsx`).
* **Custom Hooks:** camelCase com prefixo `use` (`useBudgets.ts`, `useDownloadPdf.ts`).
* **Tipagem Estrita:** Proibido o uso de `any`. Definir interfaces e tipos explicitamente espelhados no backend.
* **Validação de Formulários:** Obrigatório o uso de schemas **Zod** acoplados ao React Hook Form.

### 2.2 Chamadas de API e Gerenciamento de Estado de Servidor (TanStack Query)
* Requisições HTTP encapsuladas em serviços dedicados (`budgetsApi.ts`).
* Mutação e cache gerenciados via `useQuery` e `useMutation` do TanStack Query v5:

```typescript
export function useApplyDiscount(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DiscountRequest) => budgetsApi.applyDiscount(budgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
```

---

## 3. 🛡️ Protocolo de Qualidade — SonarLint & Pre-PR

Antes de qualquer commit ou abertura de Pull Request, o código deve ser submetido às seguintes validações estáticas:

### 3.1 As 10 Regras de Ouro do SonarLint
1. **`java:S1128` (Unused Imports):** Proibido qualquer import não utilizado.
2. **`java:S1192` (String Literals):** Literais de string repetidos 3 ou mais vezes devem ser extraídos como constantes (`private static final String`).
3. **`java:S3776` (Cognitive Complexity):** Manter a complexidade cognitiva de métodos sempre $\le 15$.
4. **`java:S1141` (Nested try-catch):** Proibidos blocos `try-catch` aninhados; extrair métodos auxiliares.
5. **`java:S4087` (Redundant close):** Não invocar `.close()` manualmente em recursos abertos em blocos `try-with-resources`.
6. **`java:S1172` (Unused Parameters):** Eliminar parâmetros não utilizados em métodos privados e internos.
7. **`java:S5976` (Parameterized Tests):** Agrupar asserções e testes repetitivos usando `@ParameterizedTest` com `@CsvSource` ou `@ValueSource`.
8. **`java:S1130` (Undeclared Exceptions):** Remover cláusulas `throws` não lançadas em assinaturas de métodos e testes.
9. **`javascript:S6747` / `S6742` (JSX Semântico):** Evitar tags HTML genéricas sem significado semântico e props não tipadas.
10. **Prevenção de NPE e Lazy Loading:** Inicializar explicitamente coleções JPA aninhadas antes da serialização ou geração de PDFs (`Hibernate.initialize()`).

### 3.2 Comandos de Validação Local Obrigatória
```bash
# Validação Backend:
cd backend && ./mvnw checkstyle:check && ./mvnw test

# Validação Frontend:
cd frontend && npm run lint && npm run test
```

---
*Padrões de Código homologados pela Equipe AlumiGest — Versão 3.0 — 24/09/2026.*

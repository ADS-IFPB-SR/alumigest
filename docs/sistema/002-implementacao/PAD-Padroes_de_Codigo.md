# PAD — Padrões de Código

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## 1. Convenções Java (Backend)

### 1.1 Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Classe | PascalCase | `OrcamentoService`, `VidroController` |
| Interface | PascalCase | `OrcamentoRepository` |
| Método | camelCase | `calcularAreaVidro()`, `buscarPorId()` |
| Variável | camelCase | `precoMetroLinear`, `areaVidroM2` |
| Constante | UPPER_SNAKE_CASE | `AREA_MINIMA_VIDRO`, `MAX_TENTATIVAS_LOGIN` |
| Pacote | lowercase | `com.alumigest.orcamento.service` |
| Enum | PascalCase (tipo), UPPER_SNAKE_CASE (valores) | `StatusOrcamento.RASCUNHO` |
| Tabela (DB) | snake_case, plural | `itens_orcamento`, `perfis_aluminio` |
| Coluna (DB) | snake_case | `preco_metro_quadrado` |

### 1.2 Organização de Pacotes (Package-by-Feature)

```
com.alumigest.{feature}/
├── controller/    → @RestController (1 por feature principal)
├── service/       → @Service com lógica de negócio
├── repository/    → JpaRepository
├── domain/        → @Entity, Enums, Value Objects
├── dto/           → Records Java (Request/Response)
└── config/        → Configurações específicas da feature (se necessário)
```

### 1.3 Padrões de Controller

```java
@RestController
@RequestMapping("/api/vidros")
@RequiredArgsConstructor
public class VidroController {

    private final VidroService vidroService;

    @GetMapping
    public ResponseEntity<PageResponse<VidroResponse>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(vidroService.listar(PageRequest.of(page, size), busca, ativo));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<VidroResponse> criar(@RequestBody @Valid VidroRequest request) {
        VidroResponse response = vidroService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### 1.4 Padrões de Service

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VidroService {

    private final VidroRepository repository;

    public PageResponse<VidroResponse> listar(Pageable pageable, String busca, Boolean ativo) {
        // Lógica de listagem com filtros
    }

    @Transactional
    public VidroResponse criar(VidroRequest request) {
        // Validações de negócio
        // Conversão DTO → Entity
        // Persistência
        // Conversão Entity → Response
    }
}
```

### 1.5 Padrões de DTO (Records Java)

```java
public record VidroRequest(
    @NotBlank(message = "Nome é obrigatório")
    String nome,

    @NotNull(message = "Espessura é obrigatória")
    @Positive(message = "Espessura deve ser positiva")
    BigDecimal espessuraMm,

    @NotBlank(message = "Cor/acabamento é obrigatório")
    String corAcabamento,

    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser maior que zero")
    BigDecimal precoMetroQuadrado,

    @NotNull @Positive Integer larguraMaximaMm,
    @NotNull @Positive Integer alturaMaximaMm,

    Long fornecedorId
) {}
```

### 1.6 Tratamento de Exceções

```java
// Exceções customizadas
public class ResourceNotFoundException extends RuntimeException { ... }
public class BusinessException extends RuntimeException { ... }
public class ValidationException extends RuntimeException { ... }

// Handler global
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class) → 404
    @ExceptionHandler(BusinessException.class)        → 422
    @ExceptionHandler(MethodArgumentNotValidException.class) → 400
    @ExceptionHandler(DataIntegrityViolationException.class) → 409
}
```

### 1.7 Boas Práticas

- **Injeção de dependência** via construtor (`@RequiredArgsConstructor` do Lombok)
- **Nunca** retornar entidades JPA diretamente — sempre usar DTOs
- **`@Transactional(readOnly = true)`** no nível do Service, `@Transactional` nos métodos que alteram dados
- **Validação dupla:** Bean Validation no DTO + validação de negócio no Service
- **Soft delete** (`ativo = false`) em vez de DELETE real para dados de negócio
- **Paginação** obrigatória em listagens (`Pageable`)

---

## 2. Convenções TypeScript (Frontend)

### 2.1 Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `ClienteForm.tsx`, `OrcamentoList.tsx` |
| Função | camelCase | `calcularAreaVidro()`, `formatarMoeda()` |
| Variável | camelCase | `precoTotal`, `listaClientes` |
| Constante | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_DESCONTO` |
| Interface/Type | PascalCase com prefixo semântico | `ClienteResponse`, `VidroRequest` |
| CSS class | kebab-case | `orcamento-card`, `btn-primary` |
| Arquivo | kebab-case ou PascalCase (componentes) | `api.ts`, `ClienteForm.tsx` |

### 2.2 Padrão de Service (API)

```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  });
  if (!response.ok) throw new ApiError(response);
  return response.json();
}
```

### 2.3 Formatação

- **Indentação:** 2 espaços
- **Ponto e vírgula:** Obrigatório
- **Aspas:** Simples (`'`)
- **Trailing comma:** Sempre
- **Max line length:** 120 caracteres

---

## 3. Convenções SQL (Migrações Flyway)

```sql
-- V001__create_clientes.sql
CREATE TABLE clientes (
    id          BIGSERIAL       PRIMARY KEY,
    nome_completo VARCHAR(200)  NOT NULL,
    cpf_cnpj    VARCHAR(18)     NOT NULL,
    -- ... demais colunas
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    ativo       BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT uk_clientes_cpf_cnpj UNIQUE (cpf_cnpj)
);

CREATE INDEX idx_clientes_nome ON clientes (nome_completo);
```

---

## 4. Logs e Mensagens

- **Logs:** SLF4J com Logback. Nível INFO em produção, DEBUG em desenvolvimento.
- **Mensagens de validação:** Em português (`"Nome é obrigatório"`, `"Preço deve ser maior que zero"`).
- **Mensagens de erro HTTP:** Em português, claras e acionáveis.

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*

# ARQ — Documento de Arquitetura

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial do Documento de Arquitetura | Ítalo Jefferson / Equipe AlumiGest |

---

## 1. Visão Geral da Arquitetura

O AlumiGest utiliza uma arquitetura **monolítica modular** com separação clara entre backend e frontend, organizados em um monorepo.

### 1.1 Diagrama de Alto Nível

```
┌───────────────────────────────────────────────────────────────┐
│                         CLIENTE                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Frontend (TypeScript + PWA)                 │  │
│  │          Navegador Web / PWA Instalado                   │  │
│  └──────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼─────────────────────────────────────┘
                          │ HTTPS (REST API)
┌─────────────────────────┼─────────────────────────────────────┐
│                    SERVIDOR                                    │
│  ┌──────────────────────┴──────────────────────────────────┐  │
│  │           Backend (Java 21 + Spring Boot 3)              │  │
│  │                                                          │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │  Auth   │  │Materiais │  │Orçamento │  │ Cliente │  │  │
│  │  │ Module  │  │  Module  │  │  Module  │  │ Module  │  │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────┘  │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │ Pedido  │  │ Estoque  │  │Financeiro│  │   OS    │  │  │
│  │  │ Module  │  │  Module  │  │  Module  │  │ Module  │  │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │              Shared / Common                      │    │  │
│  │  │  (Security, Exceptions, DTOs, Utils, Config)      │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                          │ JDBC / JPA                          │
│  ┌──────────────────────┴──────────────────────────────────┐  │
│  │              PostgreSQL 16 (Flyway migrations)           │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Decisões Arquiteturais (ADRs)

| # | Decisão | Justificativa |
|---|---|---|
| ADR-01 | **Monolítico modular** (não microserviços) | Equipe de 8 alunos, prazo de 6 meses, complexidade reduzida de deploy e infraestrutura |
| ADR-02 | **Package-by-feature** (não package-by-layer) | Melhor coesão, cada módulo é auto-contido, facilita divisão de trabalho por sprint |
| ADR-03 | **Monorepo** (backend + frontend + docs) | Único repositório simplifica CI/CD, versionamento e governança |
| ADR-04 | **PWA** (não app nativo) | Um único codebase atende desktop e mobile, sem custo de publicação em lojas |
| ADR-05 | **REST API** (não GraphQL) | Mais simples, bem conhecido pela equipe, documentação direta com Swagger |
| ADR-06 | **JWT** para autenticação (stateless) | Escalável, sem necessidade de sessão no servidor |

---

## 2. Arquitetura do Backend

### 2.1 Padrão Package-by-Feature

Cada módulo/feature é um pacote independente contendo todas as suas camadas:

```
backend/src/main/java/com/alumigest/
├── auth/                          # Módulo de Autenticação
│   ├── controller/
│   │   └── AuthController.java
│   ├── service/
│   │   └── AuthService.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── domain/
│   │   ├── User.java
│   │   └── Role.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   └── UserDTO.java
│   └── config/
│       └── SecurityConfig.java
│
├── cliente/                       # Módulo de Clientes
│   ├── controller/
│   │   └── ClienteController.java
│   ├── service/
│   │   └── ClienteService.java
│   ├── repository/
│   │   └── ClienteRepository.java
│   ├── domain/
│   │   └── Cliente.java
│   └── dto/
│       ├── ClienteRequest.java
│       └── ClienteResponse.java
│
├── catalog/                       # Módulo de Catálogo e Produtos
│   ├── controller/
│   │   ├── AluminumProfileController.java
│   │   ├── HardwareController.java
│   │   ├── FilmController.java
│   │   ├── ProductController.java
│   │   └── ProductCategoryController.java
│   ├── service/
│   │   ├── MaterialService.java
│   │   ├── ProductService.java
│   │   └── ProductCategoryService.java
│   ├── repository/
│   │   ├── MaterialRepository.java
│   │   ├── ProductRepository.java
│   │   └── ProductCategoryRepository.java
│   ├── domain/
│   │   ├── Material.java
│   │   ├── MaterialGroup.java
│   │   ├── Product.java
│   │   ├── ProductCategory.java
│   │   └── ProductItem.java
│   └── dto/
│       ├── MaterialRequest.java
│       ├── ProductResponse.java
│       └── ...
│
├── orcamento/                     # Módulo de Orçamentos
│   ├── controller/
│   │   └── OrcamentoController.java
│   ├── service/
│   │   ├── OrcamentoService.java
│   │   └── CalculoOrcamentoService.java
│   ├── repository/
│   │   ├── OrcamentoRepository.java
│   │   └── ItemOrcamentoRepository.java
│   ├── domain/
│   │   ├── Orcamento.java
│   │   ├── ItemOrcamento.java
│   │   ├── MaterialItem.java
│   │   └── StatusOrcamento.java
│   ├── dto/
│   │   ├── OrcamentoRequest.java
│   │   ├── OrcamentoResponse.java
│   │   ├── ItemOrcamentoRequest.java
│   │   └── CalculoResultado.java
│   └── pdf/
│       └── OrcamentoPdfGenerator.java
│
├── shared/                        # Módulo Compartilhado
│   ├── config/
│   │   ├── CorsConfig.java
│   │   ├── JacksonConfig.java
│   │   └── FlywayConfig.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   ├── ResourceNotFoundException.java
│   │   └── ValidationException.java
│   ├── dto/
│   │   ├── PageResponse.java
│   │   └── ErrorResponse.java
│   └── util/
│       ├── CpfCnpjValidator.java
│       └── MoneyUtils.java
│
└── AlumiGestApplication.java      # Classe principal Spring Boot
```

### 2.2 Camadas Dentro de Cada Feature

```
┌───────────────────────────────────────┐
│           Controller (REST API)        │  ← Recebe requests HTTP
│  @RestController, @RequestMapping      │  ← Validação de entrada (@Valid)
│  Converte DTO ↔ Service               │  ← Retorna ResponseEntity
├───────────────────────────────────────┤
│              Service                   │  ← Lógica de negócio
│  @Service, @Transactional             │  ← Regras de cálculo
│  Orquestra Repository + Domain         │  ← Validações de negócio
├───────────────────────────────────────┤
│            Repository (JPA)            │  ← Acesso ao banco de dados
│  extends JpaRepository                 │  ← Queries personalizadas
│  @Query, Specification                 │  ← Paginação e filtros
├───────────────────────────────────────┤
│          Domain (Entidades)            │  ← Modelos JPA (@Entity)
│  Mapeamento objeto-relacional          │  ← Regras de domínio
│  Enums, Value Objects                  │  ← Validações Bean (@NotNull)
├───────────────────────────────────────┤
│            DTO (Data Transfer)         │  ← Request/Response objects
│  Records Java (imutáveis)              │  ← Validação de entrada
│  Desacoplados das entidades            │  ← Serialização JSON
└───────────────────────────────────────┘
```

### 2.3 Regras de Dependência

| Regra | Descrição |
|---|---|
| **Controller → Service** | Controllers nunca acessam Repository diretamente |
| **Service → Repository + Domain** | Lógica de negócio concentrada nos Services |
| **Feature → Shared** | Qualquer feature pode usar o módulo `shared` |
| **Feature ↛ Feature (direto)** | Features não importam diretamente. Comunicação entre features é feita via Services injetados |
| **DTO ↛ Entity** | DTOs nunca são entidades JPA e vice-versa. Conversão explícita no Service |

---

## 3. Arquitetura do Frontend

### 3.1 Estrutura do Frontend (TypeScript + PWA)

```
frontend/src/
├── components/               # Componentes reutilizáveis (UI)
│   ├── ui/                   # Componentes genéricos (Button, Input, Modal, Table)
│   ├── layout/               # Header, Sidebar, Footer, MainLayout
│   └── forms/                # Formulários específicos (ClienteForm, VidroForm)
├── pages/                    # Páginas/telas da aplicação
│   ├── auth/                 # Login, perfil
│   ├── clientes/             # Lista, cadastro, detalhe
│   ├── materiais/            # Catálogo (vidros, alumínio, ferragens, películas)
│   ├── orcamentos/           # Lista, criação, detalhe, PDF
│   ├── pedidos/              # (Release 2)
│   ├── estoque/              # (Release 2)
│   └── financeiro/           # (Release 3)
├── services/                 # Chamadas à API REST (fetch/axios)
│   ├── api.ts                # Configuração base da API
│   ├── authService.ts
│   ├── clienteService.ts
│   ├── materialService.ts
│   └── orcamentoService.ts
├── hooks/                    # Custom hooks React/composables
├── types/                    # TypeScript interfaces e types
├── utils/                    # Funções utilitárias (formatação, validação)
├── styles/                   # CSS/SCSS global
├── App.tsx                   # Componente raiz
├── main.tsx                  # Entry point
└── manifest.json             # PWA manifest
```

### 3.2 Comunicação Frontend ↔ Backend

```
Frontend (TypeScript)          Backend (Java/Spring)
┌──────────────┐              ┌──────────────┐
│   Page/       │  HTTP/JSON   │  Controller  │
│   Component   │─────────────→│  @RestContr  │
│               │              │              │
│  service.ts   │  JSON resp   │  Service     │
│  (fetch/axios)│←─────────────│  Repository  │
└──────────────┘              └──────────────┘
```

---

## 4. Banco de Dados

### 4.1 SGBD

- **PostgreSQL 16+** — Banco relacional robusto, suporte a JSON, full-text search e extensões
- **Flyway 10.x** — Migrações versionadas e reprodutíveis

### 4.2 Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabela | snake_case, plural | `clientes`, `perfis_aluminio` |
| Coluna | snake_case | `nome_completo`, `preco_metro_linear` |
| Chave primária | `id` (BIGSERIAL) | `id BIGSERIAL PRIMARY KEY` |
| Chave estrangeira | `<tabela_singular>_id` | `cliente_id`, `vidro_id` |
| Índice | `idx_<tabela>_<colunas>` | `idx_clientes_cpf_cnpj` |
| Unique | `uk_<tabela>_<colunas>` | `uk_clientes_cpf_cnpj` |
| Migration | `V<versão>__<descricao>.sql` | `V001__create_clientes.sql` |

### 4.3 Campos Padrão (Audit)

Todas as tabelas principais devem incluir:

```sql
created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
created_by   VARCHAR(100),
updated_by   VARCHAR(100),
ativo        BOOLEAN NOT NULL DEFAULT TRUE
```

---

## 5. Segurança

### 5.1 Autenticação (JWT)

```
┌────────┐     POST /api/auth/login      ┌────────┐
│ Client │ ──────────────────────────────→│ Server │
│        │     {email, senha}             │        │
│        │                                │        │
│        │     200 {token, refreshToken}  │        │
│        │ ←──────────────────────────────│        │
│        │                                │        │
│        │     GET /api/clientes          │        │
│        │     Authorization: Bearer xxx  │        │
│        │ ──────────────────────────────→│        │
│        │                                │ Valida │
│        │     200 [{...}]                │  JWT   │
│        │ ←──────────────────────────────│        │
└────────┘                                └────────┘
```

### 5.2 Autorização (Perfis)

| Perfil | Permissões |
|---|---|
| **Administrador** | Acesso total: cadastros, catálogo, orçamentos, pedidos, estoque, financeiro, configurações, usuários |
| **Vendedor** | Clientes, orçamentos (CRUD), pedidos (consulta), catálogo (consulta) |
| **Produção** | Pedidos (consulta), OPs, listas de corte, estoque (consumo e perdas) |

---

## 6. Deploy e Infraestrutura

### 6.1 Docker Compose (Desenvolvimento)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: alumigest
      POSTGRES_USER: alumigest
      POSTGRES_PASSWORD: alumigest_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports: ["8080:8080"]
    depends_on: [db]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/alumigest

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  pgdata:
```

### 6.2 CI/CD (GitHub Actions)

```
Push/PR → Build → Testes → Lint → (merge) → Deploy
```

| Stage | Ação |
|---|---|
| Build | `mvn clean package` (backend) + `npm run build` (frontend) |
| Testes | `mvn test` (JUnit 5) + `npm test` (frontend) |
| Lint | Checkstyle (Java) + ESLint (TypeScript) |
| Deploy | Docker build + push (quando merge em main) |

---

## 7. Dependências Principais

### 7.1 Backend (Maven/Gradle)

| Dependência | Propósito |
|---|---|
| `spring-boot-starter-web` | API REST |
| `spring-boot-starter-data-jpa` | JPA/Hibernate |
| `spring-boot-starter-security` | Segurança e autenticação |
| `spring-boot-starter-validation` | Bean Validation (@Valid) |
| `jjwt` (io.jsonwebtoken) | Geração e validação de JWT |
| `postgresql` (driver) | Conexão PostgreSQL |
| `flyway-core` | Migrações de banco |
| `openpdf` ou `itext` | Geração de PDF |
| `springdoc-openapi` | Swagger/OpenAPI |
| `spring-boot-starter-test` | JUnit 5, Mockito |
| `lombok` | Redução de boilerplate |

### 7.2 Frontend (npm)

| Dependência | Propósito |
|---|---|
| `react` / `vue` | Framework UI (a definir) |
| `typescript` | Tipagem estática |
| `axios` ou `fetch API` | Chamadas HTTP |
| `react-router` / `vue-router` | Roteamento SPA |
| `react-hook-form` / equivalente | Formulários com validação |
| `vite` | Build tool |

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*

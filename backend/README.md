# ☕ AlumiGest - Backend

Serviço de backend e API REST do sistema **AlumiGest**, construído em **Java 21** e **Spring Boot 3.4** com arquitetura modular orientada a funcionalidades (*package-by-feature*).

---

## 🛠️ Tecnologias & Frameworks
- **Linguagem:** Java 21 LTS
- **Framework:** Spring Boot 3.4.2
- **Persistência:** Spring Data JPA / Hibernate 6
- **Migrações:** Flyway 10.x
- **Banco de Dados:** PostgreSQL 16+
- **Documentação de API:** SpringDoc OpenAPI 2.8 (Swagger UI)
- **Testes:** JUnit 5, Mockito, AssertJ, H2 Database (modo PostgreSQL)
- **Build Tool:** Maven Wrapper (`mvnw` / `mvnw.cmd`)

---

## 📂 Estrutura de Pacotes (Package-by-Feature)
```text
src/main/java/br/edu/ifpb/alumigest/
├── common/          # Configurações globais (OpenAPI, CORS), DTOs universais, Exception Handlers
│   ├── config/      # OpenApiConfig, CorsConfig
│   ├── controller/  # HealthController (/api/v1/health)
│   ├── dto/         # ApiResponse<T>, PageResponse<T>, ErrorResponse
│   └── exception/   # BusinessException, ResourceNotFoundException, GlobalExceptionHandler
├── catalog/         # Materiais & Insumos (Sprint 2: Vidros, Perfis, Ferragens, Películas)
├── clients/         # Gestão de Clientes e Contatos Comerciais (Sprint 2)
├── auth/            # Autenticação, Usuários e RBAC
├── budgets/         # Orçamentos, Templates de Produtos e Motor de Cálculo (Sprint 3)
└── AlumiGestApplication.java # Ponto de entrada da aplicação
```

---

## 🚀 Como Executar Localmente

### 1. Subir o Banco de Dados (PostgreSQL)
Na raiz do monorepo:
```bash
docker compose up -d
```

### 2. Executar a Aplicação com Maven Wrapper
Dentro da pasta `backend/`:

**No Windows (PowerShell / CMD):**
```cmd
.\mvnw.cmd spring-boot:run
```

**No Linux / Mac:**
```bash
./mvnw spring-boot:run
```

---

## 🧪 Como Executar os Testes Automatizados

```bash
.\mvnw.cmd test
```

---

## 📖 Documentação Interativa da API (Swagger)

Com o backend em execução, acesse no navegador:
* **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
* **Health Check:** [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

---

## 📋 Padrões para Criação de Novas Features
1. **Nomenclatura:** Classes em `PascalCase`, métodos/atributos em `camelCase`, endpoints REST no plural em inglês (`/api/v1/materials`, `/api/v1/clients`).
2. **DTOs:** Utilizar **Java Records** com anotações de validação do `jakarta.validation.constraints`.
3. **Respostas da API:** Retornar `ResponseEntity<ApiResponse<T>>` ou `ResponseEntity<PageResponse<T>>`.
4. **Erros:** Lançar `ResourceNotFoundException` ou `BusinessException` (capturados automaticamente pelo `GlobalExceptionHandler`).

# API — Especificação da API REST
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Sigla:** ALG  
**Versão:** 3.0 (Atualizado e sincronizado com os Controllers Spring Boot da Sprint 3)  
**Data:** 31/08/2026  
**Base URL:** `http://localhost:8080/api` (Aliases suportados: `/api/v1/...`)  

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial — Endpoints de Catálogo de Materiais | Ítalo Jefferson / Equipe AlumiGest |
| 21/08/2026 | 2.0 | Atualização com templates de esquadrias e orçamentos | Equipe de Engenharia AlumiGest |
| 31/08/2026 | 3.0 | Inclusão de `/recalcular`, `DELETE /orcamentos`, rotas canônicas `/api/v1/catalog/...` e remoção de `laborCost` do catálogo | Equipe AlumiGest (Scrum Master: Italo Santos) |

---

## 1. Convenções Gerais

### 1.1 Padrões de URL

```
/api/v1/{recurso}              → Coleção (GET lista paginada, POST cria)
/api/v1/{recurso}/{id}         → Elemento (GET detalhe, PUT atualiza, DELETE remove)
/api/v1/{recurso}/{id}/{acao}  → Ação específica (ex: /status, /recalcular)
```

### 1.2 Formatos e Padrões de Dados
* **Content-Type:** `application/json; charset=UTF-8`
* **Datas:** Formato ISO 8601 (`2026-08-31T14:30:00`)
* **Monetário:** `BigDecimal` serializado em formato numérico decimal (`1850.00`)
* **Paginação:** `PageResponse<T>` contendo `content`, `page: { number, size, totalElements, totalPages }`
* **Tratamento de Exceções:** Retorno em `ErrorResponse` padronizado via `GlobalExceptionHandler`

### 1.3 Códigos de Status HTTP

| Código | Significado | Uso |
|---|---|---|
| `200 OK` | Sucesso | Consultas (`GET`), atualizações (`PUT`/`PATCH`) e ações |
| `201 Created` | Criado | Criação com header `Location` apontando para o recurso criado |
| `204 No Content` | Sem Conteúdo | Exclusão lógica ou cancelamento |
| `400 Bad Request` | Requisição Inválida | Falhas de validação de DTOs (JSR-380 / Bean Validation) |
| `404 Not Found` | Não Encontrado | Recurso inexistente |
| `409 Conflict` | Conflito | Duplicidade de chave única (CPF/CNPJ, SKU) |
| `422 Unprocessable` | Regra de Negócio | Violação de regras (ex: tentar alterar orçamento aprovado) |
| `500 Internal Error`| Erro de Servidor | Falha não tratada |

---

## 2. Módulo de Sanidade e Infraestrutura (`/api/v1/health`)

### GET `/api/v1/health`
Verifica a saúde da API e status da conexão com o banco de dados.

**Response 200:**
```json
{
  "status": "UP",
  "timestamp": "2026-08-31T15:00:00Z"
}
```

---

## 3. Módulo de Clientes (`/api/v1/clients` ou `/api/clientes`)

### GET `/api/v1/clients`
Lista clientes com paginação e busca textual.

**Query params:** `?busca=joao&page=0&size=20&sort=name,asc`

**Response 200:**
```json
{
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "João da Silva",
      "personType": "INDIVIDUAL",
      "cpfCnpj": "123.456.789-00",
      "phone": "(83) 99999-0000",
      "email": "joao@email.com",
      "isActive": true
    }
  ],
  "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 }
}
```

### POST `/api/v1/clients`
Cadastra um novo cliente PF ou PJ.

**Request:**
```json
{
  "name": "João da Silva",
  "personType": "INDIVIDUAL",
  "cpfCnpj": "123.456.789-00",
  "phone": "(83) 99999-0000",
  "email": "joao@email.com",
  "address": "Rua das Flores, 123",
  "notes": "Cliente preferencial"
}
```

**Response 201:** Retorna o `ClientResponseDTO` criado com header `Location`.

---

## 4. Módulo de Catálogo de Materiais (`/api/v1/catalog/...`)

### 4.1 Vidros (`/api/v1/catalog/glasses`)
* `GET /api/v1/catalog/glasses` — Lista tipos de vidro cadastrados.
* `POST /api/v1/catalog/glasses` — Cadastra novo vidro (espessura mm, cor, preço/m²).
* `PUT /api/v1/catalog/glasses/{id}` — Atualiza cadastro de vidro.
* `PATCH /api/v1/catalog/glasses/{id}/status` — Altera status ativo/inativo.

### 4.2 Perfis de Alumínio (`/api/v1/catalog/aluminum-profiles`)
* `GET /api/v1/catalog/aluminum-profiles` — Lista perfis e puxadores (linhas Rometal/Alternativa, barras 3m/6m, preço/m).
* `POST /api/v1/catalog/aluminum-profiles` — Cadastra perfil de alumínio.

### 4.3 Ferragens (`/api/v1/catalog/hardware`)
* `GET /api/v1/catalog/hardware` — Lista ferragens, roldanas e fechaduras (UN, PAR, METRO).
* `POST /api/v1/catalog/hardware` — Cadastra ferragem.

### 4.4 Películas (`/api/v1/catalog/films`)
* `GET /api/v1/catalog/films` — Lista películas (Fumê, Jateada, Leitosa, Espelhada).
* `POST /api/v1/catalog/films` — Cadastra película com preço/m².

---

## 5. Módulo de Produtos e Templates (`/api/v1/catalog/products`)

> 📌 **Refatoração Sprint 3:** A entidade `Product` representa o **Template Paramétrico** de esquadria. O campo `laborCost` foi removido do produto mestre e transferido exclusivamente para o orçamento (`BudgetItem`).

### GET `/api/v1/catalog/products`
Lista todos os templates de esquadrias com paginação.

**Response 200:**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Porta de Correr 2 Folhas Linha Suprema",
      "categoryId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "categoryName": "Portas de Vidro e Alumínio",
      "templateType": "SLIDING_DOOR_2F",
      "templateConfig": {
        "templateType": "SLIDING_DOOR_2F",
        "aluminumColor": "BLACK",
        "glassFinish": "CLEAR",
        "openingDirection": "LEFT_TO_RIGHT",
        "handleType": "BAR_TUBULAR"
      },
      "categoryRequirements": [
        { "categoryType": "GLASS", "label": "Vidro das Folhas", "isOptional": false },
        { "categoryType": "PROFILE", "label": "Perfis e Trilhos", "isOptional": false },
        { "categoryType": "HARDWARE", "label": "Kit de Roldanas", "isOptional": false },
        { "categoryType": "FILM", "label": "Película Protetora", "isOptional": true }
      ],
      "isActive": true
    }
  ],
  "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 }
}
```

### POST `/api/v1/catalog/products`
Cria um novo template de esquadria.

---

## 6. Módulo de Orçamentos (`/api/v1/budgets` ou `/api/orcamentos`)

### GET `/api/v1/budgets`
Lista orçamentos de forma paginada com busca textual por código/cliente e filtro de status.

**Query params:** `?busca=silva&status=DRAFT&page=0&size=20`

**Response 200:**
```json
{
  "content": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "code": "ORC-20260831-0001",
      "client": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "João da Silva"
      },
      "status": "DRAFT",
      "subtotal": 1850.00,
      "discountPercent": 5.0,
      "discountValue": 92.50,
      "total": 1757.50,
      "itemCount": 1,
      "createdAt": "2026-08-31T10:00:00"
    }
  ],
  "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 }
}
```

---

### POST `/api/v1/budgets`
Cria um orçamento completo. O Backend aciona o motor de cálculo (`BudgetQuantityService` e `BudgetPricingService`) para calcular automaticamente as quantidades de perfis, vidros e ferragens.

**Request:**
```json
{
  "clientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "discountPercent": 5.0,
  "discountValue": 0.0,
  "notes": "Orçamento para sala comercial",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "width": 2000,
      "height": 2100,
      "quantity": 1,
      "laborCost": 150.00,
      "notes": "Folha direita móvel",
      "options": [
        {
          "materialId": "11111111-1111-1111-1111-111111111111",
          "categoryType": "GLASS",
          "unitPrice": 220.00
        },
        {
          "materialId": "22222222-2222-2222-2222-222222222222",
          "categoryType": "PROFILE",
          "unitPrice": 45.00
        },
        {
          "materialId": "33333333-3333-3333-3333-333333333333",
          "categoryType": "HARDWARE",
          "unitPrice": 120.00
        }
      ]
    }
  ]
}
```

**Response 201:** Retorna o `BudgetResponseDTO` detalhado com todos os cálculos resolvidos.

---

### POST `/api/v1/budgets/{id}/recalcular`
Força o recálculo de quantidades e valores para um orçamento em status `DRAFT` (útil após alterações de preços no catálogo).

**Response 200:** Retorna o `BudgetResponseDTO` recalculado.

---

### PATCH `/api/v1/budgets/{id}/status`
Altera o status do orçamento seguindo a máquina de estados:
`DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` ou `CANCELLED`.

**Request:**
```json
{
  "status": "APPROVED"
}
```

---

### DELETE `/api/v1/budgets/{id}`
Cancela o orçamento alterando seu status para `CANCELLED` (soft delete).

**Response 204:** No Content.

---

## 7. Resumo Consolidado de Endpoints

| Método | Rota | Descrição | Módulo |
|---|---|---|---|
| `GET` | `/api/v1/health` | Verificação de saúde da aplicação | `common` |
| `GET` | `/api/v1/clients` | Listar clientes paginados com busca | `clients` |
| `POST` | `/api/v1/clients` | Cadastrar novo cliente | `clients` |
| `GET` | `/api/v1/catalog/glasses` | Listar tipos de vidros | `catalog` |
| `GET` | `/api/v1/catalog/aluminum-profiles` | Listar perfis de alumínio e puxadores | `catalog` |
| `GET` | `/api/v1/catalog/hardware` | Listar ferragens e acessórios | `catalog` |
| `GET` | `/api/v1/catalog/films` | Listar películas | `catalog` |
| `GET` | `/api/v1/catalog/products` | Listar templates de esquadrias | `catalog` |
| `POST` | `/api/v1/catalog/products` | Criar template de esquadria | `catalog` |
| `GET` | `/api/v1/budgets` | Listar orçamentos com filtros | `budgets` |
| `GET` | `/api/v1/budgets/{id}` | Buscar detalhes do orçamento | `budgets` |
| `POST` | `/api/v1/budgets` | Criar orçamento com motor de cálculo | `budgets` |
| `PUT` | `/api/v1/budgets/{id}` | Atualizar orçamento DRAFT | `budgets` |
| `POST` | `/api/v1/budgets/{id}/recalcular` | Forçar recálculo de quantidades/preços | `budgets` |
| `PATCH` | `/api/v1/budgets/{id}/status` | Alterar status (DRAFT → SENT → APPROVED) | `budgets` |
| `DELETE` | `/api/v1/budgets/{id}` | Cancelar orçamento (status CANCELLED) | `budgets` |

---

*Especificação homologada com os Controllers Spring Boot 3.4 — Versão 3.0 — 31/08/2026*

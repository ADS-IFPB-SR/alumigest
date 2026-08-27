# API — Especificação da API REST

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 2.0 (Atualizado para Sprint 3) |
| **Data** | 21/08/2026 |
| **Base URL** | `http://localhost:8080/api` |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial — Endpoints da Release 1 (Materiais) | Ítalo Jefferson / Equipe AlumiGest |
| 21/08/2026 | 2.0 | Atualização Sprint 3 — Módulo de Produtos com Templates Paramétricos SVG, Requisitos de Categorias e Orçamentos com Romaneio | Equipe de Engenharia AlumiGest |

---

## 1. Convenções Gerais

### 1.1 Padrões de URL

```
/api/{recurso}              → Coleção (GET lista, POST cria)
/api/{recurso}/{id}         → Elemento (GET detalhe, PUT atualiza, DELETE remove)
/api/{recurso}/{id}/{acao}  → Ação específica
```

### 1.2 Formatos de Resposta

- **Content-Type:** `application/json; charset=UTF-8`
- **Datas:** ISO 8601 (`2026-08-21T14:30:00`)
- **Monetário:** Decimal com 2 casas (`180.00`)
- **Paginação:** `PageResponse<T>` com `content`, `page: { number, size, totalElements, totalPages }`

### 1.3 Códigos de Status HTTP

| Código | Significado | Uso |
|---|---|---|
| 200 | OK | Consulta ou atualização bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Exclusão/ação sem retorno |
| 400 | Bad Request | Validação falhou |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Perfil sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Duplicidade (CPF, código, etc.) |
| 422 | Unprocessable Entity | Regra de negócio violada |
| 500 | Internal Server Error | Erro inesperado |

---

## 2. Módulo de Autenticação (`/api/auth`)

### POST `/api/auth/login`
Autentica o usuário e retorna tokens JWT.

### POST `/api/auth/refresh`
Renova o token JWT usando o refresh token.

### POST `/api/auth/logout`
Invalida o refresh token.

---

## 3. Módulo de Clientes (`/api/clientes`)

> **Perfis:** ADMINISTRADOR, VENDEDOR

### GET `/api/clientes`
Lista clientes com paginação e busca textual.

**Query params:** `?page=0&size=20&busca=silva&ativo=true`

**Response 200:**
```json
{
  "content": [
    {
      "id": "cli-1",
      "nomeCompleto": "João da Silva",
      "cpfCnpj": "123.456.789-00",
      "telefone": "(83) 99999-0000",
      "email": "joao@email.com",
      "cidade": "Santa Rita",
      "uf": "PB",
      "ativo": true
    }
  ],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### GET `/api/clientes/{id}`
Retorna detalhe completo do cliente com endereço da obra.

### POST `/api/clientes`
Cadastra um novo cliente.

**Request:**
```json
{
  "nomeCompleto": "João da Silva",
  "cpfCnpj": "123.456.789-00",
  "telefone": "(83) 99999-0000",
  "email": "joao@email.com",
  "cep": "58300-000",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Casa",
  "bairro": "Centro",
  "cidade": "Santa Rita",
  "uf": "PB",
  "observacoes": "Entrega na obra principal"
}
```

**Response 201:** Retorna o cliente criado com `id`.

### PUT `/api/clientes/{id}`
Atualiza os dados do cliente.

### PATCH `/api/clientes/{id}/status`
Ativa ou inativa o cliente (soft delete).

---

## 4. Módulo de Catálogo de Materiais

### 4.1 Vidros (`/api/vidros` ou `/api/glasses`)
- `GET /api/glasses` — Lista tipos de vidro cadastrados.
- `POST /api/glasses` — Cadastra novo vidro (espessura mm, cor/acabamento, preço/m²).
- `PUT /api/glasses/{id}` | `PATCH /api/glasses/{id}/status`

### 4.2 Perfis de Alumínio (`/api/aluminum-profiles`)
- `GET /api/aluminum-profiles` — Lista perfis lineares (barra 3m/6m, preço/m, cor).
- `POST /api/aluminum-profiles` — Cadastra perfil de alumínio.

### 4.3 Ferragens (`/api/hardwares`)
- `GET /api/hardwares` — Lista ferragens, puxadores e kits.
- `POST /api/hardwares` — Cadastra ferragem.

### 4.4 Películas (`/api/films`)
- `GET /api/films` — Lista películas decorativas e de proteção.

### 4.5 Resumo de Materiais (`/api/materials/summary`)
Retorna visão simplificada de todos os insumos para os seletores de formulário.

---

## 5. Módulo de Produtos e Templates (`/api/products`)

> **Conceito:** Cada produto funciona como um **Template de Esquadria Paramétrica** com modelo gráfico SVG e **Requisitos de Categorias de Insumos** (`GLASS`, `PROFILE`, `HARDWARE`, `FILM`).

### GET `/api/products`
Lista todos os produtos/templates com paginação.

**Response 200:**
```json
{
  "content": [
    {
      "id": "prod-1",
      "name": "Porta de Correr 2 Folhas Linha Suprema",
      "categoryId": "cat-portas",
      "categoryName": "Portas de Vidro e Alumínio",
      "laborCost": 150.00,
      "isActive": true,
      "templateType": "SLIDING_DOOR_2F",
      "templateConfig": {
        "templateType": "SLIDING_DOOR_2F",
        "aluminumColor": "BLACK",
        "glassFinish": "CLEAR",
        "openingDirection": "LEFT_TO_RIGHT",
        "handleType": "BAR_TUBULAR",
        "handleConfig": {
          "handleType": "BAR_TUBULAR",
          "side": "BOTH_SIDES",
          "coverage": "PIECE",
          "pieceLengthCm": 40
        },
        "drillingConfig": {
          "holeCount": 2,
          "divisionType": "EQUAL",
          "customDistancesMm": [150, 450]
        }
      },
      "categoryRequirements": [
        { "id": "req-vidro", "categoryType": "GLASS", "label": "Vidro das Folhas", "isOptional": false },
        { "id": "req-perfil", "categoryType": "PROFILE", "label": "Perfis e Trilhos de Alumínio", "isOptional": false },
        { "id": "req-ferragem", "categoryType": "HARDWARE", "label": "Kit de Ferragens e Fechos", "isOptional": false },
        { "id": "req-pelicula", "categoryType": "FILM", "label": "Película Protetora/Decorativa", "isOptional": true }
      ]
    }
  ],
  "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 }
}
```

### GET `/api/products/{id}`
Retorna detalhe completo do template com todas as configurações.

### POST `/api/products`
Cria um novo template de produto.

**Request:**
```json
{
  "name": "Box Frontal F1 com Fixo e Correr",
  "categoryId": "cat-box",
  "laborCost": 100.00,
  "templateType": "GLASS_BOX_FRONTAL",
  "templateConfig": {
    "templateType": "GLASS_BOX_FRONTAL",
    "aluminumColor": "NATURAL",
    "glassFinish": "CLEAR",
    "openingDirection": "LEFT_TO_RIGHT",
    "handleType": "SHELL_LOCK"
  },
  "categoryRequirements": [
    { "id": "req-1", "categoryType": "GLASS", "label": "Vidro Temperado 8mm", "isOptional": false },
    { "id": "req-2", "categoryType": "PROFILE", "label": "Kit Alumínio Box", "isOptional": false },
    { "id": "req-3", "categoryType": "HARDWARE", "label": "Roldanas e Acessórios", "isOptional": false }
  ]
}
```

**Response 201:** Retorna o produto criado com `id`.

### PUT `/api/products/{id}`
Atualiza dados do template e seus requisitos de categorias.

---

## 6. Módulo de Orçamentos (`/api/orcamentos` ou `/api/budgets`)

> **Conceito:** O orçamento agrega dados do cliente, itens de esquadrias cotadas com medidas em mm, insumos específicos selecionados para cada categoria, puxadores, furação e totais calculados.

### GET `/api/orcamentos`
Lista orçamentos com filtros de status e busca.

**Query params:** `?page=0&size=20&status=DRAFT&busca=joao`

**Response 200:**
```json
{
  "content": [
    {
      "id": "orc-1",
      "code": "ORC-2026-001",
      "customer": {
        "id": "cli-1",
        "name": "João da Silva",
        "phone": "(83) 99999-0000"
      },
      "status": "DRAFT",
      "subtotal": 1850.00,
      "discountPercent": 5.0,
      "discountValue": 92.50,
      "total": 1757.50,
      "itemCount": 1,
      "createdAt": "2026-08-21T10:00:00",
      "validUntil": "2026-09-05T10:00:00"
    }
  ],
  "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 }
}
```

### GET `/api/orcamentos/{id}`
Retorna orçamento completo com todos os itens, opções de materiais, gabarito e romaneio.

**Response 200:**
```json
{
  "id": "orc-1",
  "code": "ORC-2026-001",
  "customer": {
    "id": "cli-1",
    "name": "João da Silva",
    "phone": "(83) 99999-0000",
    "email": "joao@email.com",
    "document": "123.456.789-00",
    "address": "Rua das Flores, 123 - Centro - Santa Rita/PB"
  },
  "status": "DRAFT",
  "subtotal": 1850.00,
  "discountPercent": 5.0,
  "discountValue": 92.50,
  "total": 1757.50,
  "notes": "Entrega em até 15 dias úteis. Pagamento em 3x no cartão.",
  "createdAt": "2026-08-21T10:00:00",
  "validUntil": "2026-09-05T10:00:00",
  "items": [
    {
      "id": "item-1",
      "productId": "prod-1",
      "productName": "Porta de Correr 2 Folhas Linha Suprema",
      "templateType": "SLIDING_DOOR_2F",
      "templateConfig": {
        "templateType": "SLIDING_DOOR_2F",
        "aluminumColor": "BLACK",
        "glassFinish": "CLEAR",
        "openingDirection": "LEFT_TO_RIGHT"
      },
      "handleConfig": {
        "handleType": "BAR_TUBULAR",
        "side": "BOTH_SIDES",
        "coverage": "PIECE",
        "pieceLengthCm": 40
      },
      "drillingConfig": {
        "holeCount": 2,
        "divisionType": "EQUAL"
      },
      "width": 2000,
      "height": 2100,
      "quantity": 1,
      "laborCost": 150.00,
      "options": [
        {
          "materialId": "mat-vidro-8mm",
          "materialName": "Vidro Temperado 8mm Incolor",
          "categoryType": "GLASS",
          "unitMeasure": "M2",
          "selectedType": "8mm Temperado",
          "selectedColor": "Incolor",
          "quantity": 4.20,
          "unitPrice": 220.00,
          "totalPrice": 924.00
        },
        {
          "materialId": "mat-perfil-suprema",
          "materialName": "Perfis Linha Suprema",
          "categoryType": "PROFILE",
          "unitMeasure": "METRO",
          "selectedType": "Suprema 25",
          "selectedColor": "Preto",
          "quantity": 8.20,
          "unitPrice": 45.00,
          "totalPrice": 369.00
        },
        {
          "materialId": "mat-kit-porta",
          "materialName": "Kit Acessórios Porta de Correr",
          "categoryType": "HARDWARE",
          "unitMeasure": "UN",
          "quantity": 1,
          "unitPrice": 407.00,
          "totalPrice": 407.00
        }
      ],
      "subtotal": 1850.00,
      "notes": "Folha esquerda fixa, direita móvel."
    }
  ]
}
```

### POST `/api/orcamentos`
Cria um orçamento completo.

**Request:**
```json
{
  "customerId": "cli-1",
  "discountPercent": 5.0,
  "notes": "Orçamento para reforma da sala",
  "items": [
    {
      "productId": "prod-1",
      "templateType": "SLIDING_DOOR_2F",
      "templateConfig": {
        "templateType": "SLIDING_DOOR_2F",
        "aluminumColor": "BLACK",
        "glassFinish": "CLEAR",
        "openingDirection": "LEFT_TO_RIGHT"
      },
      "handleConfig": {
        "handleType": "BAR_TUBULAR",
        "side": "BOTH_SIDES",
        "coverage": "PIECE",
        "pieceLengthCm": 40
      },
      "drillingConfig": {
        "holeCount": 2,
        "divisionType": "EQUAL"
      },
      "width": 2000,
      "height": 2100,
      "quantity": 1,
      "options": [
        { "materialId": "mat-vidro-8mm", "quantity": 4.20 },
        { "materialId": "mat-perfil-suprema", "quantity": 8.20 },
        { "materialId": "mat-kit-porta", "quantity": 1 }
      ],
      "notes": "Folha esquerda fixa, direita móvel."
    }
  ]
}
```

**Response 201:** Retorna o orçamento criado com código gerado (`ORC-2026-001`) e totais calculados.

### PUT `/api/orcamentos/{id}`
Atualiza o orçamento em status `DRAFT`.

### PATCH `/api/orcamentos/{id}/status`
Altera o status do orçamento (`DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` ou `REJECTED` ou `CANCELLED`).

**Request:**
```json
{
  "status": "APPROVED"
}
```

---

## 7. Resumo Geral de Rotas da API

| Método | Rota | Descrição | Módulo |
|---|---|---|---|
| **Clientes** | | | |
| `GET` | `/api/clientes` | Listar clientes paginados | `clients` |
| `GET` | `/api/clientes/{id}` | Detalhes do cliente | `clients` |
| `POST` | `/api/clientes` | Criar cliente | `clients` |
| `PUT` | `/api/clientes/{id}` | Atualizar cliente | `clients` |
| `PATCH` | `/api/clientes/{id}/status` | Ativar/Inativar cliente | `clients` |
| **Produtos** | | | |
| `GET` | `/api/products` | Listar produtos/templates | `catalog` |
| `GET` | `/api/products/{id}` | Detalhes do template | `catalog` |
| `POST` | `/api/products` | Criar template de produto | `catalog` |
| `PUT` | `/api/products/{id}` | Atualizar template | `catalog` |
| `GET` | `/api/product-categories` | Listar categorias de produto | `catalog` |
| **Orçamentos** | | | |
| `GET` | `/api/orcamentos` | Listar orçamentos paginados | `budgets` |
| `GET` | `/api/orcamentos/{id}` | Detalhes do orçamento e romaneio | `budgets` |
| `POST` | `/api/orcamentos` | Criar orçamento completo | `budgets` |
| `PUT` | `/api/orcamentos/{id}` | Atualizar orçamento | `budgets` |
| `PATCH` | `/api/orcamentos/{id}/status` | Alterar status | `budgets` |

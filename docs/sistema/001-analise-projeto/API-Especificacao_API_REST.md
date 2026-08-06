# API — Especificação da API REST

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |
| **Base URL** | `http://localhost:8080/api` |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial — Endpoints da Release 1 (Materiais e Orçamentos) | Ítalo Jefferson / Equipe AlumiGest |

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
- **Datas:** ISO 8601 (`2026-08-05T14:30:00`)
- **Monetário:** Decimal com 2 casas (`180.00`)
- **Paginação:** `?page=0&size=20&sort=nome,asc`

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

### 1.4 Formato de Erro Padrão

```json
{
  "timestamp": "2026-08-05T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Campos obrigatórios não preenchidos",
  "details": [
    { "field": "nome", "message": "Nome é obrigatório" },
    { "field": "preco_metro_quadrado", "message": "Preço deve ser maior que zero" }
  ],
  "path": "/api/vidros"
}
```

### 1.5 Formato de Paginação

```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### 1.6 Autenticação

Todos os endpoints (exceto `/api/auth/login`) requerem header:

```
Authorization: Bearer <jwt_token>
```

---

## 2. Módulo de Autenticação (`/api/auth`)

### POST `/api/auth/login`

Autentica o usuário e retorna tokens JWT.

**Request:**
```json
{
  "email": "vendedor@alumiportas.com",
  "senha": "minhasenha123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 28800,
  "usuario": {
    "id": 1,
    "nome": "João Vendedor",
    "email": "vendedor@alumiportas.com",
    "perfil": "VENDEDOR"
  }
}
```

**Response 401:**
```json
{
  "status": 401,
  "message": "E-mail ou senha incorretos"
}
```

---

### POST `/api/auth/refresh`

Renova o token JWT usando o refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:** Mesmo formato do login.

---

### POST `/api/auth/logout`

Invalida o refresh token.

**Response:** `204 No Content`

---

## 3. Módulo de Usuários (`/api/usuarios`)

> **Perfil requerido:** ADMINISTRADOR

### GET `/api/usuarios`

Lista todos os usuários. Suporta paginação e filtros.

**Query params:** `?page=0&size=20&perfil=VENDEDOR&ativo=true&busca=joao`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nomeCompleto": "João Vendedor",
      "email": "vendedor@alumiportas.com",
      "perfil": "VENDEDOR",
      "ativo": true,
      "createdAt": "2026-08-05T10:00:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5
}
```

### POST `/api/usuarios`

Cria um novo usuário.

**Request:**
```json
{
  "nomeCompleto": "Maria Produção",
  "email": "maria@alumiportas.com",
  "senha": "senha123",
  "perfil": "PRODUCAO"
}
```

**Response 201:** Retorna o usuário criado (sem senha).

### PUT `/api/usuarios/{id}`

Atualiza dados do usuário (nome, perfil). Não altera senha.

### PATCH `/api/usuarios/{id}/status`

Ativa/inativa o usuário.

**Request:**
```json
{ "ativo": false }
```

---

## 4. Módulo de Clientes (`/api/clientes`)

> **Perfis:** ADMINISTRADOR, VENDEDOR

### GET `/api/clientes`

Lista clientes com paginação e busca.

**Query params:** `?page=0&size=20&busca=thiago&ativo=true`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nomeCompleto": "Thiago Thasso de Melo",
      "cpfCnpj": "123.456.789-00",
      "tipoPessoa": "PF",
      "telefone": "(83) 99999-0000",
      "email": "thiago@email.com",
      "cidade": "Santa Rita",
      "uf": "PB",
      "ativo": true
    }
  ],
  "totalElements": 1
}
```

### GET `/api/clientes/{id}`

Retorna detalhe completo do cliente com endereço.

### POST `/api/clientes`

Cria um novo cliente.

**Request:**
```json
{
  "nomeCompleto": "Thiago Thasso de Melo",
  "cpfCnpj": "123.456.789-00",
  "tipoPessoa": "PF",
  "telefone": "(83) 99999-0000",
  "email": "thiago@email.com",
  "cep": "58300-000",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 1",
  "bairro": "Centro",
  "cidade": "Santa Rita",
  "uf": "PB",
  "observacoes": "Cliente VIP"
}
```

**Response 201:** Retorna o cliente criado com `id`.

**Response 409:**
```json
{ "message": "Já existe um cliente com este CPF/CNPJ" }
```

### PUT `/api/clientes/{id}`

Atualiza dados do cliente.

### PATCH `/api/clientes/{id}/status`

Ativa/inativa o cliente.

### GET `/api/clientes/{id}/historico`

Retorna histórico de orçamentos e pedidos do cliente.

---

## 5. Módulo de Materiais — Vidros (`/api/vidros`)

### GET `/api/vidros`

Lista vidros do catálogo.

**Query params:** `?page=0&size=20&busca=temperado&ativo=true`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Vidro Temperado 8mm Incolor",
      "espessuraMm": 8.0,
      "corAcabamento": "Incolor",
      "precoMetroQuadrado": 180.00,
      "larguraMaximaMm": 2500,
      "alturaMaximaMm": 3500,
      "fornecedorId": 1,
      "fornecedorNome": "Vidraçaria Central",
      "ativo": true
    }
  ]
}
```

### POST `/api/vidros`

> **Perfil:** ADMINISTRADOR

**Request:**
```json
{
  "nome": "Vidro Temperado 8mm Incolor",
  "espessuraMm": 8.0,
  "corAcabamento": "Incolor",
  "precoMetroQuadrado": 180.00,
  "larguraMaximaMm": 2500,
  "alturaMaximaMm": 3500,
  "fornecedorId": 1
}
```

**Response 201:** Retorna o vidro criado.

### PUT `/api/vidros/{id}`

Atualiza dados do vidro.

### PATCH `/api/vidros/{id}/status`

Ativa/inativa o vidro no catálogo.

---

## 6. Módulo de Materiais — Perfis de Alumínio (`/api/perfis-aluminio`)

### GET `/api/perfis-aluminio`

**Query params:** `?busca=montante&linha=Suprema&ativo=true`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "codigo": "ALU-SUP-MON-01",
      "descricao": "Montante Suprema 25×50",
      "linhaComercial": "Suprema",
      "pesoMetroKg": 0.450,
      "precoMetroLinear": 28.50,
      "comprimentoBarraMm": 6000,
      "ativo": true
    }
  ]
}
```

### POST `/api/perfis-aluminio`

> **Perfil:** ADMINISTRADOR

**Request:**
```json
{
  "codigo": "ALU-SUP-MON-01",
  "descricao": "Montante Suprema 25×50",
  "linhaComercial": "Suprema",
  "pesoMetroKg": 0.450,
  "precoMetroLinear": 28.50,
  "comprimentoBarraMm": 6000,
  "fornecedorId": 2
}
```

### PUT `/api/perfis-aluminio/{id}` | PATCH `/api/perfis-aluminio/{id}/status`

Mesmo padrão dos vidros.

---

## 7. Módulo de Materiais — Ferragens (`/api/ferragens`)

### GET `/api/ferragens`

### POST `/api/ferragens`

**Request:**
```json
{
  "nome": "Roldana Superior para Porta de Correr",
  "codigo": "FER-ROL-SUP-01",
  "unidadeMedida": "UNIDADE",
  "precoUnitario": 45.00,
  "fornecedorId": 3
}
```

### PUT `/api/ferragens/{id}` | PATCH `/api/ferragens/{id}/status`

---

## 8. Módulo de Materiais — Películas (`/api/peliculas`)

### GET `/api/peliculas`

### POST `/api/peliculas`

**Request:**
```json
{
  "nome": "Película Jateada",
  "tipo": "JATEADO",
  "precoMetroQuadrado": 35.00
}
```

### PUT `/api/peliculas/{id}` | PATCH `/api/peliculas/{id}/status`

---

## 9. Tipos de Produto (`/api/tipos-produto`)

### GET `/api/tipos-produto`

Lista todos os tipos de produto/esquadria.

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Porta de Correr 2 Folhas",
      "codigo": "PORTA_CORRER_2F",
      "usaVidro": true,
      "usaAluminio": true,
      "usaPelicula": true,
      "ativo": true,
      "ferragens": [
        { "ferragemId": 1, "ferragemNome": "Roldana Superior", "quantidadePadrao": 4, "obrigatorio": true }
      ],
      "perfis": [
        { "perfilId": 1, "perfilDescricao": "Montante Suprema", "funcao": "MONTANTE", "formulaComprimento": "ALTURA*4", "quantidade": 1 }
      ]
    }
  ]
}
```

### POST `/api/tipos-produto` | PUT `/api/tipos-produto/{id}`

> **Perfil:** ADMINISTRADOR

### POST `/api/tipos-produto/{id}/ferragens`

Adiciona ferragem à composição do tipo de produto.

**Request:**
```json
{
  "ferragemId": 1,
  "quantidadePadrao": 4,
  "obrigatorio": true
}
```

### POST `/api/tipos-produto/{id}/perfis`

Adiciona perfil de alumínio à composição.

**Request:**
```json
{
  "perfilAluminioId": 1,
  "funcao": "MONTANTE",
  "formulaComprimento": "ALTURA*4",
  "quantidade": 1
}
```

---

## 10. Módulo de Orçamentos (`/api/orcamentos`)

### GET `/api/orcamentos`

Lista orçamentos com paginação e filtros.

**Query params:** `?page=0&size=20&status=RASCUNHO&clienteId=1&dataInicio=2026-08-01&dataFim=2026-08-31`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "numero": "ORC-20260820-0001",
      "clienteId": 1,
      "clienteNome": "Thiago Thasso de Melo",
      "status": "RASCUNHO",
      "dataCriacao": "2026-08-20T10:00:00",
      "dataValidade": "2026-09-04",
      "subtotal": 2500.00,
      "descontoPercentual": 5.00,
      "valorDesconto": 125.00,
      "valorTotal": 2375.00,
      "quantidadeItens": 3
    }
  ]
}
```

### GET `/api/orcamentos/{id}`

Retorna orçamento completo com todos os itens e materiais detalhados.

**Response 200:**
```json
{
  "id": 1,
  "numero": "ORC-20260820-0001",
  "cliente": {
    "id": 1,
    "nomeCompleto": "Thiago Thasso de Melo",
    "telefone": "(83) 99999-0000",
    "endereco": "Rua das Flores, 123 - Centro - Santa Rita/PB"
  },
  "status": "RASCUNHO",
  "dataCriacao": "2026-08-20T10:00:00",
  "dataValidade": "2026-09-04",
  "observacoes": "Orçamento para reforma da sala",
  "itens": [
    {
      "id": 1,
      "ordem": 1,
      "tipoProduto": { "id": 1, "nome": "Porta de Correr 2 Folhas" },
      "vidro": { "id": 1, "nome": "Temperado 8mm Incolor", "precoM2": 180.00 },
      "pelicula": null,
      "linhaAluminio": "Suprema",
      "larguraCm": 200.00,
      "alturaCm": 210.00,
      "quantidade": 1,
      "areaVidroM2": 4.20,
      "custoVidro": 756.00,
      "custoAluminio": 481.40,
      "custoFerragens": 235.00,
      "custoPelicula": 0.00,
      "descontoItemPercentual": 0.00,
      "subtotalItem": 1472.40,
      "totalItem": 1472.40,
      "materiais": [
        { "tipo": "PERFIL_ALUMINIO", "descricao": "Trilho Superior Suprema", "funcao": "TRILHO_SUPERIOR", "comprimentoMetros": 2.00, "quantidade": 1, "precoUnitario": 32.00, "custoTotal": 64.00 },
        { "tipo": "FERRAGEM", "descricao": "Roldana Superior", "quantidade": 4, "precoUnitario": 45.00, "custoTotal": 180.00 }
      ]
    }
  ],
  "subtotal": 1472.40,
  "descontoPercentual": 0.00,
  "valorDesconto": 0.00,
  "valorTotal": 1472.40
}
```

### POST `/api/orcamentos`

Cria um novo orçamento.

**Request:**
```json
{
  "clienteId": 1,
  "dataValidade": "2026-09-04",
  "observacoes": "Orçamento para reforma da sala"
}
```

**Response 201:** Retorna o orçamento criado com `id` e `numero`.

### POST `/api/orcamentos/{id}/itens`

Adiciona um item ao orçamento. O sistema calcula automaticamente todos os materiais e custos.

**Request:**
```json
{
  "tipoProdutoId": 1,
  "vidroId": 1,
  "peliculaId": null,
  "linhaAluminio": "Suprema",
  "larguraCm": 200.00,
  "alturaCm": 210.00,
  "quantidade": 1,
  "observacoes": "Porta da sala principal"
}
```

**Response 201:** Retorna o item criado com todos os materiais e custos calculados.

**Response 422:**
```json
{
  "message": "As medidas excedem a dimensão máxima disponível para este tipo de vidro",
  "details": [
    { "field": "larguraCm", "message": "Máximo: 250.0 cm (2500mm)" }
  ]
}
```

### PUT `/api/orcamentos/{id}/itens/{itemId}`

Atualiza um item (recalcula automaticamente).

### DELETE `/api/orcamentos/{id}/itens/{itemId}`

Remove um item do orçamento.

### PATCH `/api/orcamentos/{id}/desconto`

Aplica desconto geral no orçamento.

**Request:**
```json
{
  "descontoPercentual": 5.00
}
```

**Response 200:** Retorna orçamento com totais recalculados.

### PATCH `/api/orcamentos/{id}/status`

Altera o status do orçamento.

**Request:**
```json
{
  "status": "ENVIADO"
}
```

**Response 200:** Retorna orçamento com status atualizado.

**Response 422:**
```json
{ "message": "Transição de status inválida: RASCUNHO → APROVADO" }
```

### GET `/api/orcamentos/{id}/pdf?tipo=COM_VALORES`

Gera e retorna o PDF do orçamento.

**Query params:** `tipo=COM_VALORES` ou `tipo=SEM_VALORES`

**Response 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORC-20260820-0001.pdf"
```

### POST `/api/orcamentos/{id}/duplicar`

Duplica o orçamento gerando um novo em status RASCUNHO.

**Response 201:** Retorna o novo orçamento duplicado.

---

## 11. Módulo de Fornecedores (`/api/fornecedores`)

### GET `/api/fornecedores`

**Query params:** `?busca=vidracaria&ativo=true`

### POST `/api/fornecedores`

**Request:**
```json
{
  "razaoSocial": "Vidraçaria Central LTDA",
  "cnpj": "12.345.678/0001-00",
  "telefone": "(83) 3333-0000",
  "email": "contato@vidracariacentral.com",
  "endereco": "Rua Industrial, 500 - João Pessoa/PB"
}
```

### PUT `/api/fornecedores/{id}` | PATCH `/api/fornecedores/{id}/status`

---

## 12. Resumo dos Endpoints

| Método | Endpoint | Descrição | Perfil |
|---|---|---|---|
| **Autenticação** | | | |
| POST | `/api/auth/login` | Login | Público |
| POST | `/api/auth/refresh` | Refresh token | Autenticado |
| POST | `/api/auth/logout` | Logout | Autenticado |
| **Usuários** | | | |
| GET | `/api/usuarios` | Listar usuários | ADMIN |
| POST | `/api/usuarios` | Criar usuário | ADMIN |
| PUT | `/api/usuarios/{id}` | Atualizar usuário | ADMIN |
| PATCH | `/api/usuarios/{id}/status` | Ativar/Inativar | ADMIN |
| **Clientes** | | | |
| GET | `/api/clientes` | Listar clientes | ADMIN, VENDEDOR |
| GET | `/api/clientes/{id}` | Detalhe do cliente | ADMIN, VENDEDOR |
| POST | `/api/clientes` | Criar cliente | ADMIN, VENDEDOR |
| PUT | `/api/clientes/{id}` | Atualizar cliente | ADMIN, VENDEDOR |
| PATCH | `/api/clientes/{id}/status` | Ativar/Inativar | ADMIN |
| GET | `/api/clientes/{id}/historico` | Histórico | ADMIN, VENDEDOR |
| **Vidros** | | | |
| GET | `/api/vidros` | Listar vidros | Todos |
| POST | `/api/vidros` | Criar vidro | ADMIN |
| PUT | `/api/vidros/{id}` | Atualizar vidro | ADMIN |
| PATCH | `/api/vidros/{id}/status` | Ativar/Inativar | ADMIN |
| **Perfis Alumínio** | | | |
| GET | `/api/perfis-aluminio` | Listar perfis | Todos |
| POST | `/api/perfis-aluminio` | Criar perfil | ADMIN |
| PUT | `/api/perfis-aluminio/{id}` | Atualizar perfil | ADMIN |
| PATCH | `/api/perfis-aluminio/{id}/status` | Ativar/Inativar | ADMIN |
| **Ferragens** | | | |
| GET | `/api/ferragens` | Listar ferragens | Todos |
| POST | `/api/ferragens` | Criar ferragem | ADMIN |
| PUT | `/api/ferragens/{id}` | Atualizar ferragem | ADMIN |
| PATCH | `/api/ferragens/{id}/status` | Ativar/Inativar | ADMIN |
| **Películas** | | | |
| GET | `/api/peliculas` | Listar películas | Todos |
| POST | `/api/peliculas` | Criar película | ADMIN |
| PUT | `/api/peliculas/{id}` | Atualizar película | ADMIN |
| PATCH | `/api/peliculas/{id}/status` | Ativar/Inativar | ADMIN |
| **Tipos de Produto** | | | |
| GET | `/api/tipos-produto` | Listar tipos | Todos |
| POST | `/api/tipos-produto` | Criar tipo | ADMIN |
| PUT | `/api/tipos-produto/{id}` | Atualizar tipo | ADMIN |
| POST | `/api/tipos-produto/{id}/ferragens` | Composição ferragem | ADMIN |
| POST | `/api/tipos-produto/{id}/perfis` | Composição perfil | ADMIN |
| **Orçamentos** | | | |
| GET | `/api/orcamentos` | Listar orçamentos | ADMIN, VENDEDOR |
| GET | `/api/orcamentos/{id}` | Detalhe completo | ADMIN, VENDEDOR |
| POST | `/api/orcamentos` | Criar orçamento | ADMIN, VENDEDOR |
| POST | `/api/orcamentos/{id}/itens` | Adicionar item | ADMIN, VENDEDOR |
| PUT | `/api/orcamentos/{id}/itens/{itemId}` | Atualizar item | ADMIN, VENDEDOR |
| DELETE | `/api/orcamentos/{id}/itens/{itemId}` | Remover item | ADMIN, VENDEDOR |
| PATCH | `/api/orcamentos/{id}/desconto` | Aplicar desconto | ADMIN, VENDEDOR |
| PATCH | `/api/orcamentos/{id}/status` | Alterar status | ADMIN, VENDEDOR |
| GET | `/api/orcamentos/{id}/pdf` | Gerar PDF | ADMIN, VENDEDOR |
| POST | `/api/orcamentos/{id}/duplicar` | Duplicar orçamento | ADMIN, VENDEDOR |
| **Fornecedores** | | | |
| GET | `/api/fornecedores` | Listar fornecedores | ADMIN |
| POST | `/api/fornecedores` | Criar fornecedor | ADMIN |
| PUT | `/api/fornecedores/{id}` | Atualizar fornecedor | ADMIN |
| PATCH | `/api/fornecedores/{id}/status` | Ativar/Inativar | ADMIN |

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*

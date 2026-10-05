# API Contract: Orders REST Endpoints

**Base Path**: `/api/v1/orders` (Canônico / Padrão Frontend)  
**Aliases Suportados**: `/api/orders`, `/api/pedidos`  
**Content-Type**: `application/json`  
**Sprint**: Sprint 06 (29/09/2026 a 12/10/2026)  

---

## Endpoints

### 1. POST /api/v1/orders/from-budget/{budgetId} — Converter Orçamento em Pedido
*(Também acessível via `/api/orders/from-budget/{budgetId}` e `/api/pedidos/from-budget/{budgetId}`)*

**Request Body** (`OrderConvertRequest`):
```json
{
  "canalAprovacao": "WHATSAPP",
  "dataPrevisaoEntrega": "2026-10-14",
  "observacoes": "Cliente solicitou entrega pela manhã"
}
```

**Response** (201 Created): `OrderResponse`  
**Responses de Erro**:
- `400 Bad Request`: `ErrorResponse` (Payload inválido ou violações de validação)
- `404 Not Found`: `ErrorResponse` (Orçamento de origem não localizado)
- `409 Conflict`: `ErrorResponse` (Conflito de estado ou já existe pedido ativo para o orçamento)
- `422 Unprocessable Entity`: `ErrorResponse` (Regra de negócio violada, ex.: orçamento cancelado ou reprovado)

**Regras de Negócio**:
- Orçamento deve estar em status válido (`DRAFT` ou `SENT`).
- Atualiza o status do orçamento para `APPROVED`.
- Gera código único anual `PED-YYYY-NNNN`.
- Realiza clonagem profunda (*deep copy*) dos itens do orçamento para `OrderItem` (lock de preços).
- Se já existir pedido ativo para esse orçamento, retorna `409 Conflict` ou `422 Unprocessable Entity`.

---

### 2. GET /api/v1/orders — Listar Pedidos (Paginado)
*(Também acessível via `/api/orders` e `/api/pedidos`)*

**Query Parameters**:
- `page` (int, default: 0): Número da página (0-indexed)
- `size` (int, default: 20): Quantidade de registros por página
- `sort` (string, optional): Campo e direção de ordenação (ex.: `createdAt,desc`)
- `status` (string, optional): Filtro por status do pedido (`CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELADO`)
- `canalAprovacao` (string, optional): Filtro por canal de aprovação (`WHATSAPP`, `PRESENCIAL`, `EMAIL`, `TELEFONE`, `OUTRO`)
- `busca` (string, optional): Termo de busca textual por código do pedido (`PED-YYYY-NNNN`), código do orçamento ou nome do cliente

**Response** (200 OK): `PageResponse<OrderSummaryResponse>`  
**Responses de Erro**:
- `400 Bad Request`: `ErrorResponse` (Parâmetros de paginação ou filtro inválidos)

---

### 3. GET /api/v1/orders/{id} — Detalhar Pedido
*(Também acessível via `/api/orders/{id}` e `/api/pedidos/{id}`)*

**Path Parameters**:
- `id` (UUID, required): Identificador único do pedido

**Response** (200 OK): `OrderResponse` (com lista de `items` imutáveis)  
**Responses de Erro**:
- `400 Bad Request`: `ErrorResponse` (Identificador em formato UUID inválido)
- `404 Not Found`: `ErrorResponse` (Pedido não encontrado com o UUID informado)

---

### 4. PATCH /api/v1/orders/{id}/cancel — Cancelar Pedido
*(Também acessível via `/api/orders/{id}/cancel` e `/api/pedidos/{id}/cancel`)*

**Path Parameters**:
- `id` (UUID, required): Identificador único do pedido

**Request Body** (`OrderCancelRequest`):
```json
{
  "justificativa": "Cliente solicitou cancelamento por motivos de readequação da obra"
}
```

**Response** (200 OK): `OrderResponse`  
**Responses de Erro**:
- `400 Bad Request`: `ErrorResponse` (Justificativa ausente ou menor que 10 caracteres)
- `404 Not Found`: `ErrorResponse` (Pedido não encontrado)
- `422 Unprocessable Entity`: `ErrorResponse` (Pedido em status que não permite cancelamento)

**Validações**:
- `justificativa` é obrigatória (mínimo 10 caracteres).
- Não permite cancelar pedidos já em `EM_PRODUCAO` ou `CONCLUIDO`.

---

### 5. GET /api/v1/orders/{id}/pdf/comprovante — Download do Comprovante do Pedido
*(Também acessível via `/api/orders/{id}/pdf/comprovante` e `/api/pedidos/{id}/pdf/comprovante`)*

**Path Parameters**:
- `id` (UUID, required): Identificador único do pedido

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="PED-2026-0001-comprovante.pdf"`  
**Responses de Erro**:
- `404 Not Found`: `ErrorResponse` (Pedido não encontrado)
- `422 Unprocessable Entity`: `ErrorResponse` (Pedido em status incompatível com emissão de comprovante)

---

## Response DTOs

### OrderResponse
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "codigo": "PED-2026-0001",
  "orcamentoId": "f0e1d2c3-b4a5-6789-0123-456789abcdef",
  "orcamentoCodigo": "ORC-2026-0001",
  "clienteNome": "João Silva",
  "clienteTelefone": "(83) 99999-0000",
  "clienteEndereco": "Rua das Flores, 123",
  "status": "AGUARDANDO_PRODUCAO",
  "canalAprovacao": "WHATSAPP",
  "canalAprovacaoLabel": "WhatsApp",
  "dataAprovacao": "2026-09-29T10:00:00Z",
  "dataPrevisaoEntrega": "2026-10-14",
  "dataConclusao": null,
  "valorBruto": 2100.00,
  "valorDesconto": 210.00,
  "taxaInstalacao": 150.00,
  "taxaFrete": 0.00,
  "valorLiquido": 2040.00,
  "condicaoPagamento": "ENTRADA_50_SALDO_ENTREGA",
  "observacoesPagamento": "Entrada via PIX",
  "observacoes": "Cliente solicitou entrega pela manhã",
  "justificativaCancelamento": null,
  "items": [
    {
      "id": "11223344-5566-7788-99aa-bbccddeeff00",
      "productId": 2,
      "descricao": "Janela 2 Folhas Linha Suprema",
      "larguraMm": 1200,
      "alturaMm": 1000,
      "quantidade": 2,
      "corAluminio": "Branco",
      "tipoVidro": "Incolor 8mm Temperado",
      "orientacaoAbertura": "Correr",
      "ferragens": "Roldanas duplas, fecho concha",
      "valorUnitario": 1050.00,
      "valorTotal": 2100.00,
      "ordem": 1
    }
  ]
}
```

### OrderSummaryResponse
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "codigo": "PED-2026-0001",
  "clienteNome": "João Silva",
  "dataAprovacao": "2026-09-29T10:00:00Z",
  "dataPrevisaoEntrega": "2026-10-14",
  "status": "AGUARDANDO_PRODUCAO",
  "valorLiquido": 2040.00,
  "totalItens": 2
}
```

### ErrorResponse
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Pedido de venda não encontrado com o identificador: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "path": "/api/v1/orders/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "timestamp": "2026-10-05T12:00:00Z",
  "validationErrors": null
}
```


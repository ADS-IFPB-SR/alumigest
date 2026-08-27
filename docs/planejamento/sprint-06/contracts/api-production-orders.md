# API Contract: Production Orders REST Endpoints

**Base Path**: `/api/production-orders`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/production-orders/generate-from-order/{orderId} — Gerar OPs do Pedido

**Response** (201 Created): `List<ProductionOrderResponse>`

**Regras**:
- Pedido deve estar em status `AGUARDANDO_PRODUCAO`.
- Para cada item com `quantidade = N`, gera $N$ OPs com código sequencial (`OP-YYYY-NNNN-01`, etc.).
- Muda status do Pedido para `EM_PRODUCAO`.

---

### 2. GET /api/production-orders — Listar OPs (Paginado & Filtros)

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `status` (string, optional): AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO
- `orderId` (long, optional)
- `busca` (string, optional): Código da OP, código do pedido ou nome do cliente

**Response** (200 OK): `PageResponse<ProductionOrderResponse>`

---

### 3. GET /api/production-orders/by-code/{codigo} — Consultar OP por Código (Scanner)

**Response** (200 OK): `ProductionOrderResponse` (com histórico de movimentações)

---

### 4. PATCH /api/production-orders/{id}/transition — Transicionar Status da OP

**Request Body** (`ProductionOrderTransitionRequest`):
```json
{
  "novoStatus": "EM_MONTAGEM",
  "operadorNome": "Carlos Silva",
  "observacao": "Perfis cortados e conferidos"
}
```

**Response** (200 OK): `ProductionOrderResponse`

---

### 5. GET /api/production-orders/order/{orderId}/labels-pdf — Download do Lote de Etiquetas (100x50mm)

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="PED-2026-0001-etiquetas.pdf"`
# API Contract: Stock & Scrap REST Endpoints

**Base Path**: `/api/stock`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/stock — Listar Itens de Estoque com Saldos e Alertas

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `categoria` (string, optional): ALUMINIO, VIDRO, FERRAGEM
- `alertaEstoque` (boolean, optional): true para filtrar apenas itens abaixo do estoque mínimo
- `busca` (string, optional): Nome ou código do material

**Response** (200 OK): `PageResponse<StockItemResponse>`

---

### 2. POST /api/stock/movement — Lançamento Manual de Movimentação (Entrada/Ajuste)

**Request Body** (`StockMovementRequest`):
```json
{
  "stockItemId": 1,
  "tipo": "ENTRADA_COMPRA",
  "quantidade": 50.0,
  "documentoOrigem": "NF-12345",
  "operadorNome": "Almoxarife João",
  "motivo": "Recebimento de carga de perfis"
}
```

**Response** (201 Created): `StockMovementResponse`

---

### 3. POST /api/stock/scrap — Registrar Perda & Sucata

**Request Body** (`ScrapRecordRequest`):
```json
{
  "stockItemId": 2,
  "productionOrderId": 5,
  "quantidade": 1.8,
  "motivo": "QUEBRA_MANUSEIO",
  "operadorNome": "Carlos Cortador",
  "observacoes": "Chapa trincou na bancada"
}
```

**Response** (201 Created): `ScrapRecordResponse`

---

### 4. GET /api/stock/{id}/movements — Extrato Kardex do Material

**Response** (200 OK): `PageResponse<StockMovementResponse>`
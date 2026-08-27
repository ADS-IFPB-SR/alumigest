# API Contract: Cutting Lists & Assembly Sheets REST Endpoints

**Base Path**: `/api/production`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/production/orders/{orderId}/cutting-list — Obter Romaneio Consolidado do Pedido

**Response** (200 OK): `CuttingListResponse`

---

### 2. GET /api/production/orders/{orderId}/cutting-list-pdf — Download do Romaneio de Oficina em PDF (A4)

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="PED-2026-0001-romaneio-corte.pdf"`

---

### 3. GET /api/production/production-orders/{id}/assembly-sheet — Obter Ficha Técnica de Montagem da OP

**Response** (200 OK): `AssemblySheetResponse`

---

### 4. GET /api/production/production-orders/{id}/assembly-sheet-pdf — Download da Ficha Técnica da OP em PDF

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="OP-2026-0001-01-ficha-montagem.pdf"`
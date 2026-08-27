# API Contract: Receivables REST Endpoints

**Base Path**: `/api/finance/receivables`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/finance/receivables — Listar Títulos a Receber (Paginado & Filtros)

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `status` (string, optional): A_VENCER, VENCIDO, PAGO, CANCELADO
- `clienteId` (long, optional)
- `dataInicio`, `dataFim` (date, optional): Filtro por vencimento
- `busca` (string, optional): Nome do cliente ou código do pedido

**Response** (200 OK): `PageResponse<AccountReceivableResponse>`

---

### 2. POST /api/finance/receivables/order/{orderId}/generate — Gerar / Recalcular Parcelas do Pedido

**Request Body** (`InstallmentPlanCustomRequest`, opcional para ajuste manual):
```json
{
  "parcelas": [
    {
      "numeroParcela": 1,
      "tipoParcela": "ENTRADA_SINAL",
      "valor": 1500.00,
      "dataVencimento": "2026-08-27"
    },
    {
      "numeroParcela": 2,
      "tipoParcela": "SALDO_FINAL",
      "valor": 1500.00,
      "dataVencimento": "2026-09-20"
    }
  ]
}
```

**Response** (201 Created): `List<AccountReceivableResponse>`

---

### 3. GET /api/finance/receivables/client/{clienteId}/statement — Posição Financeira do Cliente

**Response** (200 OK): `ClientFinancialStatementResponse`
```json
{
  "clienteId": 1,
  "clienteNome": "João Silva",
  "totalFaturado": 5000.00,
  "totalPago": 3500.00,
  "saldoDevedor": 1500.00,
  "possuiInadimplencia": false,
  "titulos": [ ... ]
}
```

---

### 4. GET /api/finance/receivables/{id}/receipt-pdf — Download do Recibo de Quitação em PDF

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="recibo-TIT-2026-0001-01.pdf"`
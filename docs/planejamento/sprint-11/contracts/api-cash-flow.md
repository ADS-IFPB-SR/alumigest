# API Contract: Payment Settlement & Cash Flow REST Endpoints

**Base Path**: `/api/finance`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/finance/receivables/{id}/settle — Realizar Baixa Manual de Título

**Request Body** (`SettlementRequest`):
```json
{
  "metodoPagamento": "DINHEIRO",
  "valorPago": 950.00,
  "descontoConcedido": 50.00,
  "jurosAcrescimo": 0.00,
  "operadorNome": "Financeiro Maria",
  "observacoes": "Desconto de R$ 50 concedido por pagamento à vista em dinheiro"
}
```

**Response** (200 OK): `AccountReceivableResponse`

---

### 2. GET /api/finance/cash-flow/summary — Obter Resumo de Fluxo de Caixa

**Query Parameters**:
- `dataInicio`, `dataFim` (date, optional)

**Response** (200 OK): `CashFlowSummaryResponse`
```json
{
  "totalEntradasRealizadas": 6500.00,
  "totalPrevistoPeriodo": 12000.00,
  "distribuicaoPorMetodo": {
    "PIX": 3000.00,
    "DINHEIRO": 1500.00,
    "CARTAO_CREDITO": 2000.00
  },
  "lancamentosRecentes": [ ... ]
}
```

---

### 3. GET /api/finance/cash-flow/daily-closure-pdf — Download do Fechamento de Caixa Diário

**Query Parameters**:
- `data` (date, default: hoje)

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="fechamento-caixa-2026-08-27.pdf"`
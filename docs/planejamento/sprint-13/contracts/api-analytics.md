# API Contract: Analytics, DRE & Reports REST Endpoints

**Base Path**: `/api/analytics`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/analytics/dashboard — Métricas do Dashboard e KPIs

**Query Parameters**:
- `mes` (int, default: mês atual)
- `ano` (int, default: ano atual)

**Response** (200 OK): `DashboardMetricsResponse`

---

### 2. GET /api/analytics/dre — Demonstrativo do Resultado do Exercício (DRE)

**Query Parameters**:
- `mes` (int)
- `ano` (int)
- `regime` (string, default: "COMPETENCIA", options: "COMPETENCIA", "CAIXA")

**Response** (200 OK): `DreReportResponse`

---

### 3. GET /api/analytics/products/ranking — Ranking dos Produtos Mais Vendidos

**Query Parameters**:
- `mes`, `ano` (int, optional)
- `limit` (int, default: 10)

**Response** (200 OK): `List<ProductRankingItemResponse>`

---

### 4. GET /api/analytics/reports/sales-csv — Exportação de Relatório Analítico em CSV

**Query Parameters**:
- `dataInicio`, `dataFim` (date)

**Response** (200 OK):
- `Content-Type: text/csv; charset=UTF-8`
- `Content-Disposition: attachment; filename="relatorio-vendas-202608.csv"`

---

### 5. GET /api/analytics/reports/dre-pdf — Download do Relatório DRE em PDF

**Query Parameters**:
- `mes`, `ano` (int)
- `regime` (string)

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="dre-2026-08.pdf"`
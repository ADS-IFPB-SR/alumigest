# API Contract: Onboarding, Data Seeding & Help REST Endpoints

**Base Path**: `/api/onboarding`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/onboarding/import-clients-csv — Importar Clientes em Lote via CSV

**Request**: `multipart/form-data` (arquivo `file` CSV)

**Response** (200 OK): `ClientImportSummaryResponse`
```json
{
  "totalLinhas": 50,
  "importadosComSucesso": 48,
  "duplicadosIgnorados": 2,
  "erros": []
}
```

---

### 2. GET /api/onboarding/manuals/{role}/pdf — Download do Manual Operacional em PDF

**Path Variables**:
- `role`: `VENDEDOR`, `PRODUCAO`, `ESTOQUE`, `FINANCEIRO`, `INSTALADOR`

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="manual-operacional-VENDEDOR.pdf"`
# API Contract: Offline Synchronization & Delta REST Endpoints

**Base Path**: `/api/sync`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/sync/field-package — Pacote de Dados Operacionais para Cache Offline

**Query Parameters**:
- `teamId` (long, optional)
- `lastSyncTimestamp` (long, optional)

**Response** (200 OK): `FieldPackageResponse`
```json
{
  "serviceOrders": [ ... ],
  "productionOrders": [ ... ],
  "cutLists": [ ... ],
  "serverTimestamp": 1787845000000
}
```

---

### 2. POST /api/sync/batch — Sincronização em Lote de Fila Offline

**Request Body** (`SyncBatchRequest`):
```json
{
  "items": [
    {
      "localId": 101,
      "url": "/api/installation/service-orders/1/status",
      "method": "PATCH",
      "payload": { "status": "CONCLUIDA", "recebidoPorNome": "Carlos" }
    }
  ]
}
```

**Response** (200 OK): `SyncBatchResponse`
```json
{
  "processedCount": 1,
  "failedCount": 0,
  "results": [
    { "localId": 101, "status": "SUCCESS", "message": "OK" }
  ]
}
```
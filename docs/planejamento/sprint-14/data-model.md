# Data Model: Sprint 14 — PWA, Modo Offline e Performance

**Feature**: `011-pwa-offline-performance`
**Date**: 2026-08-27

## Esquema Local IndexedDB (Dexie.js)

### Tabela: `offline_sync_queue`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INTEGER` (AutoIncrement) | Chave primária local |
| `url` | `STRING` | Endpoint de destino (ex: `/api/installation/service-orders/1/status`) |
| `method` | `STRING` | Método HTTP (`POST`, `PATCH`, `PUT`) |
| `payload` | `JSON / OBJECT` | Dados da requisição |
| `photoBlob` | `BLOB (Opcional)` | Foto comprimida |
| `timestamp` | `NUMBER` | Timestamp da criação |
| `status` | `STRING` | `PENDENTE`, `PROCESSANDO`, `ERRO` |
| `retryCount` | `INTEGER` | Tentativas realizadas |

---

### Tabela: `cached_service_orders`
- Cache das OSs agendadas para o instalador logado.

### Tabela: `cached_production_orders`
- Cache das OPs do dia e listas de corte.
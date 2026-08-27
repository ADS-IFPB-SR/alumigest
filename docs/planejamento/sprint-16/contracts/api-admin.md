# API Contract: System Administration, Audit & Backup REST Endpoints

**Base Path**: `/api/admin`
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/admin/audit-logs — Listar Logs de Auditoria

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `entidade` (string, optional)
- `acao` (string, optional)
- `usuarioNome` (string, optional)
- `dataInicio`, `dataFim` (date, optional)

**Response** (200 OK): `PageResponse<AuditLogResponse>`

---

### 2. POST /api/admin/backups/generate — Disparar Backup Manual

**Response** (201 Created): `SystemBackupResponse`

---

### 3. GET /api/admin/backups — Listar Backups Disponíveis

**Response** (200 OK): `List<SystemBackupResponse>`

---

### 4. GET /api/admin/backups/{id}/download — Download Seguro de Arquivo de Backup

**Response** (200 OK):
- `Content-Type: application/gzip`
- `Content-Disposition: attachment; filename="backup-alumigest-20260827-1500.sql.gz"`
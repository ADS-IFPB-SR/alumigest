# API Contract: Service Orders & Installation REST Endpoints

**Base Path**: `/api/installation`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/installation/service-orders — Agendar Ordem de Serviço (OS)

**Request Body** (`ServiceOrderCreateRequest`):
```json
{
  "orderId": 1,
  "installationTeamId": 1,
  "dataAgendamento": "2026-09-22",
  "turno": "MANHA",
  "enderecoInstalacao": "Av. Epitácio Pessoa, 1000 - Apt 502",
  "observacoes": "Levar escada extensiva de 6m"
}
```

**Response** (201 Created): `ServiceOrderResponse`

---

### 2. GET /api/installation/service-orders/calendar — Obter Compromissos para o Calendário

**Query Parameters**:
- `mes` (int, 1-12)
- `ano` (int, ex: 2026)
- `teamId` (long, optional)

**Response** (200 OK): `List<CalendarEventResponse>`

---

### 3. PATCH /api/installation/service-orders/{id}/status — Atualizar Status da OS em Campo

**Request Body** (`ServiceOrderStatusUpdateRequest`):
```json
{
  "status": "CONCLUIDA",
  "recebidoPorNome": "Dr. Marcos",
  "observacoes": "Instalação finalizada com sucesso e testada"
}
```

**Response** (200 OK): `ServiceOrderResponse`

---

### 4. POST /api/installation/service-orders/{id}/photos — Upload de Foto da Instalação

**Request**: `multipart/form-data` (arquivo `foto` + `tipoFoto`)

**Response** (201 Created): `ServiceOrderPhotoResponse`

---

### 5. GET /api/installation/service-orders/{id}/pdf — Download da OS de Campo em PDF

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="OS-2026-0001.pdf"`
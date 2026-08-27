# API Contract: PIX Payments REST Endpoints

**Base Path**: `/api/payments/pix`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/payments/pix/generate-for-order/{orderId} — Gerar Cobrança PIX

**Request Body** (`PixGenerateRequest`):
```json
{
  "tipoPagamento": "ENTRADA_SINAL",
  "valor": 1000.00,
  "observacoes": "Sinal de 50% do pedido"
}
```

**Response** (201 Created): `PixChargeResponse`
```json
{
  "txid": "ALUMI-2026-0827-ABC1234",
  "orderId": 1,
  "valor": 1000.00,
  "payloadCopiaECola": "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654071000.005802BR5913ALUMIPORTAS6009JOAO PESSOA62070503***6304ABCD",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "AGUARDANDO_PAGAMENTO",
  "dataExpiracao": "2026-08-28T14:30:00"
}
```

---

### 2. GET /api/payments/pix/status/{txid} — Consultar Status da Cobrança PIX (Polling)

**Response** (200 OK): `PixStatusResponse`
```json
{
  "txid": "ALUMI-2026-0827-ABC1234",
  "status": "PAGO",
  "valor": 1000.00,
  "dataLiquidacao": "2026-08-27T14:35:10",
  "e2eid": "E12345678202608271435ABCD"
}
```

---

### 3. POST /api/webhooks/pix — Webhook de Notificação do Gateway PSP

**Request Body**: Payload enviado pelo Gateway (ex: Asaas / EFI)

**Response** (200 OK): `{"received": true}`

---

### 4. POST /api/payments/pix/simulate/{txid} — Simular Pagamento PIX (Ambiente Dev/Test)

**Response** (200 OK): `PixStatusResponse`
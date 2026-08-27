# API Contract: Orders REST Endpoints

**Base Path**: `/api/orders`
**Content-Type**: `application/json`

---

## Endpoints

### 1. POST /api/orders/from-budget/{budgetId} — Converter Orçamento em Pedido

**Request Body** (`OrderConvertRequest`):
```json
{
  "canalAprovacao": "WHATSAPP",
  "dataPrevisaoEntrega": "2026-09-15",
  "observacoes": "Cliente solicitou entrega pela manhã"
}
```

**Response** (201 Created): `OrderResponse`

**Regras de Negócio**:
- Orçamento deve estar em status válido (`RASCUNHO` ou `ENVIADO`).
- Muda o status do orçamento para `APROVADO`.
- Gera código único `PED-YYYY-NNNN`.
- Realiza deep copy dos itens do orçamento para itens do pedido.
- Se já existir pedido ativo para esse orçamento, retorna `400 Bad Request` ("Orçamento já convertido em pedido").

---

### 2. GET /api/orders — Listar Pedidos (Paginado)

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `status` (string, optional): CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO
- `busca` (string, optional): Código ou nome do cliente

**Response** (200 OK): `PageResponse<OrderSummaryResponse>`

---

### 3. GET /api/orders/{id} — Detalhar Pedido

**Response** (200 OK): `OrderResponse` (com lista de `items`)

---

### 4. PATCH /api/orders/{id}/cancel — Cancelar Pedido

**Request Body** (`OrderCancelRequest`):
```json
{
  "justificativa": "Cliente desistiu da obra por motivos financeiros"
}
```

**Response** (200 OK): `OrderResponse`

**Validações**:
- `justificativa` é obrigatória (mínimo 10 caracteres).
- Não permite cancelar pedidos já em `EM_PRODUCAO` ou `CONCLUIDO`.

---

### 5. GET /api/orders/{id}/pdf/comprovante — Download do Comprovante do Pedido

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="PED-2026-0001-comprovante.pdf"`

---

## Response DTOs

### OrderResponse
```json
{
  "id": 1,
  "codigo": "PED-2026-0001",
  "orcamentoId": 1,
  "orcamentoCodigo": "ORC-2026-0001",
  "clienteNome": "João Silva",
  "clienteTelefone": "(83) 99999-0000",
  "clienteEndereco": "Rua das Flores, 123",
  "status": "AGUARDANDO_PRODUCAO",
  "canalAprovacao": "WHATSAPP",
  "canalAprovacaoLabel": "WhatsApp",
  "dataAprovacao": "2026-08-27",
  "dataPrevisaoEntrega": "2026-09-11",
  "dataConclusao": null,
  "valorBruto": 2100.00,
  "valorDesconto": 210.00,
  "taxaInstalacao": 150.00,
  "taxaFrete": 0.00,
  "valorLiquido": 2040.00,
  "condicaoPagamento": "ENTRADA_50_SALDO_ENTREGA",
  "observacoesPagamento": "Entrada via PIX",
  "observacoes": "Cliente solicitou entrega pela manhã",
  "justificativaCancelamento": null,
  "items": [
    {
      "id": 1,
      "descricao": "Janela 2 Folhas Correr",
      "larguraMm": 1200,
      "alturaMm": 1000,
      "quantidade": 2,
      "corAluminio": "Branco",
      "tipoVidro": "Temperado 8mm",
      "orientacaoAbertura": "CORRER",
      "ferragens": "Fecho concha",
      "valorUnitario": 450.00,
      "valorTotal": 900.00,
      "ordem": 0
    }
  ],
  "createdAt": "2026-08-27T14:30:00",
  "updatedAt": "2026-08-27T14:30:00"
}
```
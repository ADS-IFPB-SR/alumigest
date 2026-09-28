# API Contract: Budgets REST Endpoints

**Base Path**: `/api/budgets`
**Content-Type**: `application/json`
**Auth**: Bearer Token (futuro — sem autenticação nesta fase)

---

## Endpoints

### 1. POST /api/budgets — Criar Orçamento (Rascunho)

**Request Body** (`BudgetCreateRequest`):
```json
{
  "clienteNome": "João Silva",
  "clienteTelefone": "(83) 99999-0000",
  "clienteEndereco": "Rua das Flores, 123 - João Pessoa/PB",
  "observacoes": "Medição feita no local"
}
```

**Response** (201 Created): `BudgetResponse`

---

### 2. GET /api/budgets — Listar Orçamentos (Paginado)

**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 20)
- `status` (string, optional): Filtro por status (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO)
- `busca` (string, optional): Busca por código ou nome do cliente

**Response** (200 OK): `PageResponse<BudgetSummaryResponse>`

---

### 3. GET /api/budgets/{id} — Detalhar Orçamento

**Response** (200 OK): `BudgetResponse` (inclui lista de items)

---

### 4. POST /api/budgets/{id}/items — Adicionar Item ao Orçamento

**Request Body** (`BudgetItemCreateRequest`):
```json
{
  "productId": 5,
  "descricao": "Janela 2 Folhas de Correr",
  "larguraMm": 1200,
  "alturaMm": 1000,
  "quantidade": 2,
  "corAluminio": "Branco",
  "tipoVidro": "Temperado 8mm Incolor",
  "orientacaoAbertura": "CORRER",
  "ferragens": "Fecho concha cromado, Roldanas duplas",
  "valorUnitario": 450.00
}
```

**Response** (201 Created): `BudgetItemResponse`

---

### 5. PUT /api/budgets/{id}/discount — Aplicar Desconto

**Request Body** (`DiscountRequest`):
```json
{
  "tipoDesconto": "PERCENTUAL",
  "valor": 10.00,
  "condicaoPagamento": "ENTRADA_50_SALDO_ENTREGA",
  "observacoesPagamento": "Entrada via PIX, saldo em dinheiro na entrega",
  "dataValidade": "2026-09-11"
}
```

**Response** (200 OK): `BudgetResponse` com totais recalculados

**Validações**:
- Se `tipoDesconto = PERCENTUAL`: `valor` entre 0.00 e 100.00
- Se `tipoDesconto = VALOR_FIXO`: `valor` entre 0.00 e `valorBruto`
- `dataValidade` >= data atual

---

### 6. PATCH /api/budgets/{id}/status — Alterar Status

**Request Body** (`StatusChangeRequest`):
```json
{
  "novoStatus": "ENVIADO"
}
```

**Response** (200 OK): `BudgetResponse`

**Transições válidas**: Conforme máquina de estados em `data-model.md`

---

### 7. GET /api/budgets/{id}/pdf/comercial — Download PDF Comercial

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="ORC-2026-0001-comercial.pdf"`

---

### 8. GET /api/budgets/{id}/pdf/tecnico — Download PDF Técnico (Oficina)

**Response** (200 OK):
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="ORC-2026-0001-tecnico.pdf"`

---

### 9. GET /api/budgets/{id}/resumo-whatsapp — Texto para WhatsApp

**Response** (200 OK):
- `Content-Type: text/plain; charset=UTF-8`

**Exemplo de corpo**:
```
📋 *Orçamento ORC-2026-0001*
📅 Emissão: 27/08/2026 | Validade: 11/09/2026
👤 Cliente: João Silva

📦 Itens:
• 2x Janela 2 Folhas Correr (1200x1000mm) - R$ 900,00
• 1x Porta de Abrir (900x2100mm) - R$ 1.200,00

💰 Subtotal: R$ 2.100,00
🏷️ Desconto (10%): -R$ 210,00
🔧 Instalação: R$ 150,00
📦 *TOTAL: R$ 2.040,00*
💳 Pagamento: 50% Entrada + 50% na Entrega

_Alumiportas - Vidraçaria e Esquadrias_
```

---

## Response DTOs

### BudgetResponse
```json
{
  "id": 1,
  "codigo": "ORC-2026-0001",
  "clienteNome": "João Silva",
  "clienteTelefone": "(83) 99999-0000",
  "clienteEndereco": "Rua das Flores, 123",
  "status": "RASCUNHO",
  "valorBruto": 2100.00,
  "tipoDesconto": "PERCENTUAL",
  "percentualDesconto": 10.00,
  "valorDesconto": 210.00,
  "taxaInstalacao": 150.00,
  "taxaFrete": 0.00,
  "valorLiquido": 2040.00,
  "condicaoPagamento": "ENTRADA_50_SALDO_ENTREGA",
  "condicaoPagamentoLabel": "50% Entrada + 50% na Entrega",
  "observacoesPagamento": "Entrada via PIX",
  "dataEmissao": "2026-08-27",
  "dataValidade": "2026-09-11",
  "expirado": false,
  "items": [ ... ],
  "createdAt": "2026-08-27T14:30:00",
  "updatedAt": "2026-08-27T14:30:00"
}
```

### BudgetSummaryResponse
```json
{
  "id": 1,
  "codigo": "ORC-2026-0001",
  "clienteNome": "João Silva",
  "status": "RASCUNHO",
  "valorLiquido": 2040.00,
  "quantidadeItens": 3,
  "dataEmissao": "2026-08-27",
  "dataValidade": "2026-09-11",
  "expirado": false
}
```
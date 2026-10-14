# API Contract: Production & Label REST Endpoints

**Base Path**: `/api/orders`  
**Content-Type**: `application/json` (ou `application/pdf` para endpoints de arquivo)  
**Sprint**: Sprint 07 (13/10/2026 a 27/10/2026)  

---

## Endpoints

### 1. GET /api/orders/{id}/labels-pdf — Download do PDF de Etiquetas Térmicas (100x50mm)

Gera e retorna o arquivo PDF configurado com tamanho de página 100x50 mm contendo uma etiqueta individual por unidade física de peça contratada no pedido.

- **Headers de Resposta**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="etiquetas-PED-YYYY-NNNN.pdf"`

- **Respostas**:
  - `200 OK`: Fluxo binário do PDF térmico gerado via OpenPDF.
  - `404 Not Found`: Pedido com o ID informado não foi encontrado.
  - `422 Unprocessable Entity`: O pedido informado não possui itens de esquadria para etiquetagem.

---

### 2. PATCH /api/orders/{id}/production-status — Atualizar Status de Produção Fabril

Avança o estágio de fabricação do pedido no chão de fábrica e registra automaticamente a data de conclusão quando o status atingir `CONCLUIDO`.

- **Headers de Requisição**:
  - `Content-Type: application/json`

- **Request Body** (`ProductionStatusUpdateRequest`):
```json
{
  "status": "EM_PRODUCAO"
}
```

- **Respostas**:
  - `200 OK`: Retorna o `OrderResponse` atualizado com o novo status e `dataConclusao` preenchida se aplicável.
```json
{
  "id": "c1f7a0b5-7c91-4d3e-9081-3e4b7b209a81",
  "codigo": "PED-2026-0001",
  "clienteNome": "João da Silva",
  "status": "EM_PRODUCAO",
  "dataPrevisaoEntrega": "2026-10-25",
  "dataConclusao": null,
  "updatedAt": "2026-10-14T14:30:00"
}
```
  - `400 Bad Request`: Payload com valor de enum inválido ou corpo nulo.
  - `404 Not Found`: Pedido não encontrado.
  - `422 Unprocessable Entity`: Transição de status inválida (ex: pedido já cancelado, ou tentativa de transição proibida).

---

### 3. GET /api/orders — Listar Pedidos Filtrados por Status Fabris

Permite ao frontend buscar a lista de pedidos distribuídos nos estágios de fabricação para renderização do quadro Kanban.

- **Query Parameters**:
  - `status` (string, optional): Filtro por status (ex: `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`).
  - `busca` (string, optional): Filtro textual por código (`PED-2026-0001`) ou nome do cliente.
  - `page` (int, default: 0)
  - `size` (int, default: 50)

- **Response** (200 OK): `PageResponse<OrderSummaryResponse>`
```json
{
  "content": [
    {
      "id": "c1f7a0b5-7c91-4d3e-9081-3e4b7b209a81",
      "codigo": "PED-2026-0001",
      "clienteNome": "João da Silva",
      "status": "AGUARDANDO_PRODUCAO",
      "dataPrevisaoEntrega": "2026-10-25",
      "dataConclusao": null,
      "totalItens": 2,
      "valorLiquido": 4500.00
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 50,
  "number": 0
}
```

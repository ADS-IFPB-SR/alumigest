# API Contract: Production & Label REST Endpoints

**Base Path**: `/api/v1/orders`  
**Content-Type**: `application/json` (ou `application/pdf` para endpoints de arquivo)  
**Sprint**: Sprint 07 (13/10/2026 a 27/10/2026)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, todos os endpoints, parâmetros, campos de requisição e payloads JSON utilizam **inglês técnico** (`camelCase`), com tradução vernácula para pt-BR realizada na camada de UI do Frontend.

---

## Endpoints

### 1. GET /api/v1/orders/{id}/labels-pdf — Download do PDF de Etiquetas Térmicas (100x50mm)

Gera e retorna o arquivo PDF configurado com tamanho de página 100x50 mm contendo uma etiqueta individual por unidade física de peça contratada na Ordem de Serviço, sem código de barras e com tipografia nítida.

- **Query Parameters (Opcional)**:
  - `itemId` (UUID, optional): Filtra as etiquetas para emissão exclusiva de um item específico da O.S. Se omitido, emite todas as peças físicas da O.S.

- **Headers de Resposta**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="etiquetas-OS-YYYY-NNNN.pdf"`

- **Respostas**:
  - `200 OK`: Fluxo binário do PDF térmico gerado via OpenPDF (100x50 mm).
  - `404 Not Found`: Ordem de Serviço com o ID informado não foi encontrada.
  - `422 Unprocessable Entity`: A ordem informada não possui itens de esquadria para etiquetagem.

---

### 2. PATCH /api/v1/orders/{id}/production-status — Atualizar Status de Produção Fabril

Avança o estágio de fabricação da O.S. no chão de fábrica e registra automaticamente o campo `completionDate` quando o status atingir `COMPLETED`.

- **Headers de Requisição**:
  - `Content-Type: application/json`

- **Request Body** (`OrderProductionStatusRequestDTO`):
```json
{
  "status": "IN_PRODUCTION"
}
```

- **Respostas**:
  - `200 OK`: Retorna o `OrderResponseDTO` atualizado com o novo status e `completionDate` preenchida se aplicável.
```json
{
  "id": "c1f7a0b5-7c91-4d3e-9081-3e4b7b209a81",
  "code": "OS-2026-0002",
  "customerName": "João Silva",
  "status": "IN_PRODUCTION",
  "expectedDeliveryDate": "2026-10-28",
  "completionDate": null,
  "updatedAt": "2026-10-14T14:30:00Z"
}
```
  - `400 Bad Request`: Payload com valor de enum inválido ou corpo nulo.
  - `404 Not Found`: Ordem de Serviço não encontrada.
  - `422 Unprocessable Entity`: Transição de status inválida (ex: ordem já cancelada, ou salto proibido de `WAITING_PRODUCTION` direto para `COMPLETED`).

---

### 3. GET /api/v1/orders — Listar Ordens de Serviço para o Painel Kanban

Permite ao frontend buscar a lista de ordens distribuídas nos estágios de fabricação para renderização das colunas do Kanban.

- **Query Parameters**:
  - `status` (string, optional): Filtro por status (`WAITING_PRODUCTION`, `IN_PRODUCTION`, `COMPLETED`).
  - `search` (string, optional): Filtro textual por código (`OS-2026-0002`), nome do cliente ou item.
  - `page` (int, default: 0)
  - `size` (int, default: 50)

- **Response** (200 OK): `PageResponse<OrderProductionCardResponseDTO>`
```json
{
  "content": [
    {
      "id": "c1f7a0b5-7c91-4d3e-9081-3e4b7b209a81",
      "code": "OS-2026-0002",
      "customerName": "João Silva",
      "status": "WAITING_PRODUCTION",
      "expectedDeliveryDate": "2026-10-28",
      "completionDate": null,
      "totalPieces": 3,
      "daysRemaining": 14,
      "isDelayed": false,
      "netTotal": 4500.00,
      "items": [
        {
          "id": "f8a12345-1234-5678-abcd-123456789abc",
          "description": "Janela de Correr 2 Folhas",
          "quantity": 2,
          "widthMm": 1200,
          "heightMm": 1500,
          "aluminumColor": "Preto Anodizado",
          "glassType": "Incolor 6mm Temperado"
        }
      ]
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 50,
  "number": 0
}
```

# API — Especificação da API REST

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 4.0 (Consolidado com Release v0.8.0 — Sprint 08 + Prévia Sprint 09 Estoque) |
| **Data** | 18/11/2026 |
| **Base URL** | `http://localhost:8080/api` (Swagger UI em `/swagger-ui.html`) |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial — Endpoints da Release 1 (Materiais) | Ítalo Jefferson / Equipe AlumiGest |
| 21/08/2026 | 2.0 | Atualização Sprint 3 — Módulo de Produtos com Templates Paramétricos SVG e Orçamentos | Equipe de Engenharia AlumiGest |
| 23/09/2026 | 2.1 | Atualização Sprint 4 — Descontos Comerciais (US-09), PDF Comercial/WhatsApp (US-10) e PDF Técnico (US-11) | Equipe de Engenharia AlumiGest |
| 12/10/2026 | 3.0 | Atualização Sprint 6 — Módulo de Ordens de Serviço (`/api/v1/orders`, US-13 a US-16) | Equipe de Engenharia AlumiGest |
| 17/10/2026 | 3.1 | Atualização Sprint 7 — Etiquetas Térmicas (US-17) e Kanban Fabril (US-18) | Equipe de Engenharia AlumiGest |
| 18/11/2026 | 4.0 | Sincronização Integral com Código (`release/v0.8.0`): Rotas reais `/api/v1/catalog/*`, `/api/v1/materials`, Venda Avulsa (`/api/v1/part-sales`, US-46), Hub 360° do Cliente (`ClientHubController`, US-47), Ficha Técnica de Produção (`/production-sheet`, US-47.3), BPLB e prévia de Estoque (`/api/v1/stock`, Sprint 09) | Equipe de Engenharia AlumiGest |

---

## 1. Convenções Gerais

### 1.1 Padrões de URL

```
/api/v1/{recurso}              → Coleção canônica (GET lista, POST cria)
/api/v1/{recurso}/{id}         → Elemento (GET detalhe, PUT/PATCH atualiza, DELETE inativa)
/api/v1/{recurso}/{id}/{acao}  → Ação específica (conversão, status, PDF, etc.)
```

> **Nota de Compatibilidade:** Alguns controllers (`BudgetController`, `ClientController`, `ClientHubController`, `MaterialController`, `OrderLegacyController`) mantêm aliases retrocompatíveis sem `/v1` ou em português (ex.: `/api/orcamentos`, `/api/clientes`), mantidos com `@Hidden` no OpenAPI quando aplicável.

### 1.2 Formatos de Resposta

- **Content-Type:** `application/json; charset=UTF-8` (ou `application/pdf` / `application/octet-stream` / `text/plain; charset=UTF-8` em exportações).
- **Datas:** ISO 8601 (`OffsetDateTime` / `LocalDate`, ex.: `2026-11-15T14:30:00Z` ou `2026-11-15`).
- **Monetário:** Decimal com 2 casas (`180.00`).
- **Envelope Padrão:**
  - Módulos de catálogo e saúde utilizam `ApiResponse<T>` (`{ "status", "message", "data" }`).
  - Listagens paginadas utilizam `PageResponse<T>` (`{ "content": [...], "page": { "number", "size", "totalElements", "totalPages" } }`).

### 1.3 Códigos de Status HTTP

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Consulta, cálculo ou atualização bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `204` | No Content | Exclusão lógica ou comando sem payload |
| `400` | Bad Request | Bean Validation falhou ou parâmetro inválido |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito de integridade / unicidade (CPF/CNPJ, conversão duplicada de O.S.) |
| `422` | Unprocessable Entity | Regra de negócio ou limite físico violado (`BusinessException`) |
| `500` | Internal Server Error | Erro inesperado |

---

## 2. Infraestrutura, Saúde e Autenticação

### 2.1 Health Check (`HealthController` — `/api/v1/health`)

#### GET `/api/v1/health`
Retorna o status operacional da API, versão da aplicação e timestamp UTC.
* **Response 200 OK:** `ApiResponse<Map<String, Object>>` com `status: "UP"`, `application: "AlumiGest Backend"`, `version`, `timestamp`, `partner: "Alumiportas"`.

### 2.2 Suporte a Testes E2E (`TestCleanupController` — `/api/v1/test-support`)
* `DELETE /api/v1/test-support/cleanup` *(alias `/api/test-support/cleanup`)* — Limpeza controlada de massa gerada em execuções E2E (ex.: parâmetro `partSaleCode`), protegida por perfil/ambiente de testes.

### 2.3 Módulo de Autenticação (`br.edu.ifpb.alumigest.auth`)
> **Status Atual:** O pacote `auth` possui apenas `package-info.java` reservado para evolução futura; nenhum `AuthController` (`/api/auth/*`) encontra-se ativo no código da `release/v0.8.0`.

---

## 3. Módulo de Clientes e Hub 360°

### 3.1 CRUD de Clientes (`ClientController` — `/api/v1/clients`, alias `/api/clientes`)

> **Perfis Autorizados:** `ADMINISTRADOR`, `VENDEDOR`

* **`GET /api/v1/clients`**: Lista clientes paginados com busca textual e filtros.
  * **Query Params:** `?busca=silva&personType=FISICA&ativo=true&page=0&size=20`
  * **Response 200 OK:** `PageResponse<ClientSummaryDTO>`.
* **`GET /api/v1/clients/{id}`**: Retorna o detalhe completo do cliente (`ClientResponseDTO`).
* **`POST /api/v1/clients`**: Cadastra novo cliente PF ou PJ (`ClientRequestDTO`), retornando `201 Created` (`409 Conflict` se CPF/CNPJ já existir).
* **`PUT /api/v1/clients/{id}`**: Atualiza os dados cadastrais do cliente (`ClientRequestDTO`).
* **`PATCH /api/v1/clients/{id}/status`**: Alterna status ativo/inativo do cliente (*soft delete*).

### 3.2 Hub 360° do Cliente (`ClientHubController` — US-47)

> **Base Paths:** `/api/v1/clients`, `/api/v1/clientes`, `/api/clientes`, `/api/v1/customers`  
> **Perfis Autorizados:** `ADMINISTRADOR`, `VENDEDOR`, `OPERADOR`

#### GET `/api/v1/clients/{id}/dashboard` *(US-47.1)*
Retorna a projeção consolidada (CQRS) com dados de contato do cliente e KPIs comerciais calculados no backend.

* **Path Variables:** `{id}` (UUID do cliente).
* **Response 200 OK (`ClientDashboardDto`):**
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "nomeCompleto": "Antônio Alfredo Figueiredo",
  "personType": "FISICA",
  "documento": "04289144409",
  "telefone": "83988452100",
  "email": "antonio@email.com",
  "bairro": "Torre",
  "cidade": "João Pessoa",
  "uf": "PB",
  "totalContratado": 4500.00,
  "quantidadeOrdensServico": 2,
  "quantidadeOrcamentos": 2
}
```
* **Erros:** `404 Not Found` caso o cliente não exista.

#### GET `/api/v1/clients/{id}/budgets` *(US-47.1)*
Lista as propostas comerciais vinculadas ao cliente (`List<ClientBudgetSummaryDto>`).
* **Campos retornados:** `id`, `codigo`, `dataCriacao`, `dataValidade`, `valorTotal`, `status`, `statusDescricao`.

#### GET `/api/v1/clients/{id}/orders` *(US-47.2)*
Lista as Ordens de Serviço vinculadas ao cliente com o detalhamento das esquadrias físicas em milímetros (`List<ClientOrderSummaryDto>`).
* **Campos retornados:** `id`, `codigo`, `data`, `status`, `statusDescricao`, `valorTotal`, `totalEsquadrias`, `items` (`List<ClientOrderItemDto>`: `id`, `descricao`, `larguraMm`, `alturaMm`, `quantidade`, `corAluminio`, `tipoVidro`, `valorTotal`).

---

## 4. Módulo de Catálogo de Materiais e Templates

### 4.1 Busca Unificada de Materiais (`MaterialController` — `/api/v1/materials`, alias `/api/v1/catalog/materials`)

* **`GET /api/v1/materials?category={category}`**: Lista materiais ativos, opcionalmente filtrados por categoria (`GLASS`, `PROFILE`, `ALUMINUM`, `FILM`, `HARDWARE`). Retorna `ApiResponse<List<MaterialSummaryDTO>>` com consulta otimizada (`JOIN FETCH`) sem queries N+1.
* **`GET /api/v1/materials/families?groupCode={groupCode}`**: Lista códigos únicos de família (`familyCode`) cadastrados, opcionalmente filtrados por grupo (`VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`). Retorna `ApiResponse<List<String>>`.

### 4.2 Vidros (`GlassController` — `/api/v1/catalog/glasses`)
* `GET /api/v1/catalog/glasses?thickness=&color=` — Lista vidros (`PageResponse` / `ApiResponse`).
* `POST /api/v1/catalog/glasses` — Cadastra novo vidro (`GlassCreateDTO`).
* `PUT /api/v1/catalog/glasses/{id}` — Atualiza vidro (`GlassUpdateDTO`).
* `DELETE /api/v1/catalog/glasses/{id}` — Inativa vidro (*soft delete*, `204 No Content`).

### 4.3 Perfis de Alumínio (`AluminumProfileController` — `/api/v1/catalog/aluminum-profiles`)
* `GET /api/v1/catalog/aluminum-profiles?colorFinish=&name=` — Lista perfis paginados.
* `GET /api/v1/catalog/aluminum-profiles/{id}` — Detalha um perfil.
* `POST /api/v1/catalog/aluminum-profiles` — Cadastra perfil (`AluminumProfileRequestDTO`).
* `PUT /api/v1/catalog/aluminum-profiles/{id}` — Atualiza perfil (`AluminumProfileUpdateDTO`).
* `DELETE /api/v1/catalog/aluminum-profiles/{id}` — Inativa perfil (`204 No Content`).

### 4.4 Ferragens (`HardwareController` — `/api/v1/catalog/hardware`)
* `GET /api/v1/catalog/hardware?unitMeasure=&unit=&name=` — Lista ferragens, puxadores e acessórios.
* `GET /api/v1/catalog/hardware/{id}` — Detalha uma ferragem.
* `POST /api/v1/catalog/hardware` — Cadastra ferragem (`HardwareRequestDTO`).
* `PUT /api/v1/catalog/hardware/{id}` — Atualiza ferragem (`HardwareUpdatePriceDTO`).
* `DELETE /api/v1/catalog/hardware/{id}` — Inativa ferragem (`204 No Content`).

### 4.5 Películas (`FilmController` — `/api/v1/catalog/films`)
* `GET /api/v1/catalog/films` — Lista películas decorativas e solares.
* `POST /api/v1/catalog/films` — Cadastra película (`FilmRequestDTO`).
* `PUT /api/v1/catalog/films/{id}` — Atualiza película (`FilmUpdatePriceDTO`).
* `DELETE /api/v1/catalog/films/{id}` — Inativa película (`204 No Content`).

### 4.6 Produtos e Templates Paramétricos (`ProductController` — `/api/v1/catalog/products`)
> **Nota:** A antiga rota `/api/product-categories` foi extinta na migração Flyway `V12`. A categoria deriva dinamicamente do `DoorTemplateType`.

* `GET /api/v1/catalog/products?activeOnly=true` — Lista templates paramétricos paginados.
* `GET /api/v1/catalog/products/{id}` — Detalha o template (`templateConfig`, `categoryRequirements`).
* `POST /api/v1/catalog/products` — Cria novo template (`ProductRequestDTO`).
* `PUT /api/v1/catalog/products/{id}` — Atualiza template (`ProductRequestDTO`).
* `DELETE /api/v1/catalog/products/{id}` — Inativa template (`204 No Content`).

---

## 5. Módulo de Orçamentos (`BudgetController`)

> **Base Paths:** `/api/v1/budgets`, `/api/orcamentos`, `/api/budgets`  
> **Perfis Autorizados:** `ADMINISTRADOR`, `VENDEDOR`

* **`GET /api/v1/budgets?page=0&size=20&status=DRAFT&busca=joao`**: Lista orçamentos paginados (`PageResponse<BudgetSummaryResponseDTO>`).
* **`GET /api/v1/budgets/{id}`**: Retorna detalhe completo do orçamento, itens e opções de insumos (`BudgetResponseDTO`).
* **`POST /api/v1/budgets`**: Cria orçamento completo (`BudgetCreateRequest`) e calcula quantidades e totais.
* **`PUT /api/v1/budgets/{id}`**: Atualiza orçamento em rascunho (`DRAFT`).
* **`PATCH /api/v1/budgets/{id}/status`**: Altera status (`DRAFT` ➔ `SENT` ➔ `APPROVED` / `REJECTED` / `CANCELLED`).
* **`PUT /api/v1/budgets/{id}/discount`** *(alias `/desconto`)*: Aplica desconto (`PERCENTUAL` ou `VALOR_FIXO`), taxas e condições comerciais (`DiscountRequest`).
* **`POST /api/v1/budgets/{id}/items`** *(alias `/itens`)*: Adiciona item ao orçamento em rascunho.
* **`POST /api/v1/budgets/{id}/recalcular`**: Força recálculo de quantidades e preços de um orçamento `DRAFT`.
* **`POST /api/v1/budgets/{id}/reopen`** *(alias `/reabrir` — US-15.2)*: Reabre orçamento `APPROVED` de volta para `DRAFT` quando a O.S. vinculada estiver `CANCELLED` (`409 Conflict` se houver O.S. ativa).
* **`POST /api/v1/budgets/items/preview-calculation`**: Pré-calcula sugestões de consumo de vidro/perfil/película e emite alertas de consistência física (`BudgetItemCalculationRequestDTO` ➔ `BudgetItemCalculationResponseDTO`).
* **`DELETE /api/v1/budgets/{id}`**: Cancela o orçamento (`CANCELLED`, `204 No Content`).
* **`GET /api/v1/budgets/{id}/pdf/comercial`** *(alias `/pdf`)*: Emite Proposta Comercial PDF A4.
* **`GET /api/v1/budgets/{id}/pdf/tecnico`** *(alias `/technical-pdf`)*: Emite Via Técnica de Oficina em PDF A4 sob sigilo comercial (zero menções monetárias).
* **`GET /api/v1/budgets/{id}/resumo-whatsapp`**: Retorna `text/plain;charset=UTF-8` formatado para envio no WhatsApp.

---

## 6. Módulo de Ordens de Serviço e Produção (`OrderController` — `/api/v1/orders`)

> **Contrato Canônico:** `/api/v1/orders` (`OrderController`). Aliases legados (`/api/v1/ordens-servico`, `/api/orders`, `/api/ordens-servico`, `/api/pedidos`) residem no `OrderLegacyController`.

### 6.1 Gestão e Ciclo de Vida

* **`GET /api/v1/orders?status=&channel=&search=&page=0&size=10`**: Lista O.S. paginadas (`PageResponse<OrderSummaryResponse>`).
* **`POST /api/v1/orders/convert/{budgetId}`** *(alias `/from-budget/{budgetId}`)*: Converte orçamento elegível em O.S. `OS-YYYY-NNNN` com *deep copy* imutável e lock de preços (`OrderConvertRequest` ➔ `201 Created` `OrderResponse`). Retorna `409` se já houver O.S. ativa.
* **`GET /api/v1/orders/{id}`**: Retorna detalhes completos e itens congelados (`OrderResponse`).
* **`GET /api/v1/orders/by-budget/{budgetId}`**: Recupera a O.S. mais recente vinculada a um orçamento (`OrderSummaryResponse` ou `404`).
* **`PATCH /api/v1/orders/{id}/production-status`** *(alias `/status`)*: Avança o status na esteira Kanban (`CREATED` / `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`), preenchendo `dataConclusao` no fuso `America/Sao_Paulo`. Aceita body `OrderStatusUpdateRequest` ou query `?status=`.
* **`PATCH /api/v1/orders/{id}/cancel`**: Cancela O.S. (`CREATED` ou `WAITING_PRODUCTION`) mediante `OrderCancelRequest` (`justificativa` com 10 a 1000 caracteres). Bloqueia `IN_PRODUCTION`/`COMPLETED` com `422`.

### 6.2 Documentos e Etiquetas

* **`GET /api/v1/orders/{id}/pdf/comprovante`** *(US-16)*: Emite o Comprovante Oficial do Pedido em PDF A4 utilizando valores congelados.
* **`GET /api/v1/orders/{id}/labels-pdf?itemId=`** *(alias `/etiquetas-pdf` — US-17)*: Emite etiquetas térmicas 100×60mm em PDF.
* **`POST /api/v1/orders/{id}/labels-pdf?itemId=`** *(alias `/etiquetas-pdf`)*: Emite etiquetas PDF aceitando no body `Map<UUID, Integer>` com contagem customizada de folhas por item.
* **`GET /api/v1/orders/{id}/labels-bplb?itemId=`**: Gera script nativo de comandos térmicos BPLB (`.prn`) para impressora Elgin L42.
* **`POST /api/v1/orders/{id}/labels-bplb?itemId=`**: Gera script BPLB (`.prn`) com mapa opcional de folhas customizadas (`Map<UUID, Integer>`).

### 6.3 Ficha Técnica de Produção e Plano de Corte *(US-47.3 / US-20)*

#### GET `/api/v1/orders/{id}/production-sheet`
Calcula e retorna os dados paramétricos da ficha técnica de corte (perfis com ângulos $45^\circ/90^\circ$, vidros com folgas deduzidas e acessórios).

* **Response 200 OK (`ProductionSheetResponse`):**
```json
{
  "orderCode": "OS-2026-0042",
  "clientName": "Antônio Alfredo Figueiredo",
  "aluminumCuts": [
    { "profileCode": "SU-001", "description": "Marco Lateral", "lengthMm": 1200, "cutAngle": "90°", "quantity": 2 }
  ],
  "glassCuts": [
    { "glassType": "Incolor Temperado 8mm", "widthMm": 603, "heightMm": 1146, "quantity": 2 }
  ],
  "accessories": [
    { "code": "ROL-112", "description": "Roldana Dupla Suprema", "quantity": 4, "unit": "UN" }
  ]
}
```

#### GET `/api/v1/orders/{id}/production-sheet/pdf`
Renderiza e exporta a Ficha Técnica A4 de Produção Fabril em PDF (`Content-Type: application/pdf`, `attachment; filename="Ficha_Tecnica_OS-YYYY-NNNN.pdf"`).

---

## 7. Módulo de Venda Avulsa de Partes (`PartSaleController` — `/api/v1/part-sales` — US-46)

> **Perfis Autorizados:** `ADMINISTRADOR`, `VENDEDOR`

### POST `/api/v1/part-sales/calculate-item`
Pré-calcula metragem/área faturável e valor total do item avulso sem persistência, aplicando piso mínimo de vidro ($0,25\text{ m}^2$), fator de perda e validação de limites físicos do material (`maxWidthMm`, `maxHeightMm`).

* **Request Body (`CalculatePartItemRequest`):**
```json
{
  "category": "GLASS",
  "widthMm": 300,
  "heightMm": 400,
  "quantity": 2,
  "unitPrice": 180.00,
  "lossFactor": 0.00,
  "materialId": "c8d234a1-7e89-4a0b-bc11-d92ef5638102"
}
```
* **Response 200 OK (`CalculatePartItemResponse`):**
```json
{
  "calculatedUnitMeasure": 0.5000,
  "unitPrice": 180.00,
  "totalPrice": 90.00,
  "minimumAreaApplied": true
}
```

### POST `/api/v1/part-sales`
Persiste uma nova venda avulsa de partes (`VP-YYYY-NNNN`) com status `DRAFT` ou `APPROVED`. Se `clientId` apontar para o `Cliente Balcão` padrão (`00000000-0000-0000-0000-000000000001`), vincula o consumidor final da migração `V24`.

* **Request Body (`CreatePartSaleRequest`):**
```json
{
  "clientId": "00000000-0000-0000-0000-000000000001",
  "status": "APPROVED",
  "discountAmount": 10.00,
  "items": [
    {
      "materialType": "PROFILE",
      "referenceId": "d1a2b3c4-1111-2222-3333-444455556666",
      "quantity": 2,
      "widthMm": null,
      "heightMm": 2500,
      "unitPrice": 45.00,
      "lossFactor": 0.05
    }
  ]
}
```
* **Response 201 Created (`PartSaleResponse`):** Retorna `id`, `code`, `clientId`, `clientName`, `status`, `subtotalAmount`, `discountAmount`, `totalAmount`, `items` (`List<PartSaleItemResponse>`), `createdAt`, `updatedAt`.

### GET `/api/v1/part-sales`
Lista vendas avulsas paginadas (`PageableDefault` ordenado por data decrescente) com filtros opcionais `?status=DRAFT|APPROVED|CANCELLED&search=VP-2026`.

### GET `/api/v1/part-sales/{id}`
Retorna os detalhes completos da venda avulsa (`PartSaleResponse`).

### PATCH `/api/v1/part-sales/{id}/status`
Atualiza o status comercial (`PartSaleStatusUpdateRequest`: `DRAFT` ➔ `APPROVED` | `CANCELLED`; `APPROVED` ➔ `CANCELLED`; `CANCELLED` terminal).

### GET `/api/v1/part-sales/{id}/pdf`
Gera e exporta o orçamento/venda avulsa em PDF A4 agrupado por seções temáticas (`VIDROS`, `ALUMÍNIOS`, `FERRAGENS`, `PELÍCULAS`).

### POST `/api/v1/part-sales/export-pdf`
Gera PDF prévio (`orcamento-partes-rascunho.pdf`) diretamente a partir de um `CreatePartSaleRequest` sem necessidade de persistência prévia.

---

## 8. Módulo de Estoque e Kardex (`StockController` — `/api/v1/stock` — Sprint 09 em Desenvolvimento)

> **Escopo em Desenvolvimento (Branches `feat/us-21*` e `feat/us-22*`):** Contrato implementado nas branches ativas da Sprint 09 (ainda não integrado em `develop`).

* **`GET /api/v1/stock`**: Lista saldos consolidados (`List<StockItemResponseDTO>`) com filtros `?category=`, `?alertStatus=`, `?search=`, `?needsPurchase=`, `?belowMinStock=` e `?sort=NAME|AVAILABLE|CRITICALITY`.
* **`GET /api/v1/stock/materials/{materialId}`**: Consulta o saldo consolidado de um material específico (`StockItemResponseDTO`).
* **`GET /api/v1/stock/movements?materialId=`**: Lista trilha cronológica Kardex (`List<StockMovementResponseDTO>`).
* **`POST /api/v1/stock/movements`**: Registra movimentação manual (`StockMovementRequestDTO` — entrada de compras com `unitCost` e `referenceDocument` livre, ajuste manual ou perda/sucata; retorna `201 Created` ou `422` se saldo físico ficar negativo).
* **`POST /api/v1/stock/reserve-for-order/{orderId}`**: Reserva insumos da O.S. no modelo Make-to-Order sem bloqueio por falta de estoque (`204 No Content`).
* **`POST /api/v1/stock/consume-for-order/{orderId}`**: Efetiva baixa física e libera reserva na conclusão da produção (`204 No Content`).
* **`POST /api/v1/stock/cancel-reservations/{orderId}`**: Estorna reservas de O.S. cancelada (`204 No Content`).
* **`GET /api/v1/stock/orders/{orderId}/alert`** *(branch `feat/us-21.4`)*: Retorna o status agregado de alerta Make-to-Order da O.S. (`OrderStockAlertResponseDTO` com `alertStatus` e `missingMaterials`).

---

## 9. Resumo Geral de Rotas da API

| Método | Rota Canônica | Descrição | Módulo | Status / Sprint |
|---|---|---|---|:---:|
| `GET` | `/api/v1/health` | Status operacional e versão da API | `common` | R1 / S01 |
| `DELETE` | `/api/v1/test-support/cleanup` | Limpeza controlada de massa E2E | `common` | R2 / S08 |
| `GET` | `/api/v1/clients` | Listar clientes paginados com busca e filtros | `clients` | R1 / S03 |
| `GET` | `/api/v1/clients/{id}` | Detalhes do cliente | `clients` | R1 / S03 |
| `POST` | `/api/v1/clients` | Criar cliente PF ou PJ | `clients` | R1 / S03 |
| `PUT` | `/api/v1/clients/{id}` | Atualizar dados cadastrais do cliente | `clients` | R1 / S03 |
| `PATCH` | `/api/v1/clients/{id}/status` | Ativar/inativar cliente | `clients` | R1 / S03 |
| `GET` | `/api/v1/clients/{id}/dashboard` | Dados cadastrais e KPIs agregados (Hub 360°) | `clients` | R2 / S08 (`US-47.1`) |
| `GET` | `/api/v1/clients/{id}/budgets` | Histórico de orçamentos do cliente (Hub 360°) | `clients` | R2 / S08 (`US-47.1`) |
| `GET` | `/api/v1/clients/{id}/orders` | Ordens de Serviço e esquadrias do cliente | `clients` | R2 / S08 (`US-47.2`) |
| `GET` | `/api/v1/materials` | Busca unificada de materiais ativos por categoria | `catalog` | R2 / S08 (`US-46.5`) |
| `GET` | `/api/v1/materials/families` | Listar famílias de materiais cadastradas | `catalog` | R2 / S08 |
| `GET/POST/PUT/DELETE` | `/api/v1/catalog/glasses` | CRUD de Vidros | `catalog` | R1 / S02 |
| `GET/POST/PUT/DELETE` | `/api/v1/catalog/aluminum-profiles` | CRUD de Perfis de Alumínio | `catalog` | R1 / S02 |
| `GET/POST/PUT/DELETE` | `/api/v1/catalog/hardware` | CRUD de Ferragens | `catalog` | R1 / S02 |
| `GET/POST/PUT/DELETE` | `/api/v1/catalog/films` | CRUD de Películas | `catalog` | R1 / S02 |
| `GET/POST/PUT/DELETE` | `/api/v1/catalog/products` | CRUD de Templates Paramétricos de Esquadrias | `catalog` | R1 / S03 |
| `GET` | `/api/v1/budgets` | Listar orçamentos paginados com filtros | `budgets` | R1 / S03 |
| `GET` | `/api/v1/budgets/{id}` | Detalhar orçamento e romaneio | `budgets` | R1 / S03 |
| `POST` | `/api/v1/budgets` | Criar orçamento com cálculo paramétrico | `budgets` | R1 / S03 |
| `PUT` | `/api/v1/budgets/{id}` | Atualizar orçamento em rascunho | `budgets` | R1 / S03 |
| `PATCH` | `/api/v1/budgets/{id}/status` | Alterar status do orçamento | `budgets` | R1 / S03 |
| `PUT` | `/api/v1/budgets/{id}/discount` | Aplicar descontos, taxas e condições comerciais | `budgets` | R1 / S04 (`US-09`) |
| `POST` | `/api/v1/budgets/{id}/items` | Adicionar item ao orçamento | `budgets` | R1 / S04 |
| `POST` | `/api/v1/budgets/{id}/recalcular` | Forçar recálculo do orçamento `DRAFT` | `budgets` | R1 / S04 |
| `POST` | `/api/v1/budgets/{id}/reopen` | Reabrir orçamento após cancelamento de O.S. | `budgets` | R2 / S06 (`US-15.2`) |
| `POST` | `/api/v1/budgets/items/preview-calculation` | Pré-cálculo de insumos e alerta físico | `budgets` | R1 / S04 |
| `DELETE` | `/api/v1/budgets/{id}` | Cancelar orçamento | `budgets` | R1 / S03 |
| `GET` | `/api/v1/budgets/{id}/pdf/comercial` | Emitir Proposta Comercial PDF A4 | `budgets` | R1 / S05 (`US-10`) |
| `GET` | `/api/v1/budgets/{id}/resumo-whatsapp` | Obter resumo formatado para WhatsApp | `budgets` | R1 / S05 (`US-10`) |
| `GET` | `/api/v1/budgets/{id}/pdf/tecnico` | Emitir Via Técnica de Oficina PDF A4 | `budgets` | R1 / S05 (`US-11`) |
| `GET` | `/api/v1/orders` | Listar O.S. paginadas com filtros | `orders` | R2 / S06 (`US-13.4`) |
| `POST` | `/api/v1/orders/convert/{budgetId}` | Converter orçamento em O.S. com lock de preços | `orders` | R2 / S06 (`US-13`) |
| `GET` | `/api/v1/orders/{id}` | Detalhar O.S. e snapshot imutável | `orders` | R2 / S06 (`US-14`) |
| `GET` | `/api/v1/orders/by-budget/{budgetId}` | Buscar O.S. mais recente de um orçamento | `orders` | R2 / S08 |
| `PATCH` | `/api/v1/orders/{id}/production-status` | Atualizar etapa fabril no Kanban | `orders` | R2 / S07 (`US-18`) |
| `PATCH` | `/api/v1/orders/{id}/cancel` | Cancelar O.S. com justificativa obrigatória | `orders` | R2 / S06 (`US-15`) |
| `GET` | `/api/v1/orders/{id}/pdf/comprovante` | Emitir Comprovante PDF A4 da O.S. | `orders` | R2 / S06 (`US-16`) |
| `GET/POST` | `/api/v1/orders/{id}/labels-pdf` | Emitir Etiquetas Térmicas PDF (100×60mm) | `orders` | R2 / S07 (`US-17`) |
| `GET/POST` | `/api/v1/orders/{id}/labels-bplb` | Gerar script nativo térmico BPLB (Elgin L42) | `orders` | R2 / S07 (`US-17`) |
| `GET` | `/api/v1/orders/{id}/production-sheet` | Dados paramétricos da Ficha Técnica de Corte | `orders` | R2 / S08 (`US-47.3`) |
| `GET` | `/api/v1/orders/{id}/production-sheet/pdf` | Exportar Ficha Técnica A4 de Produção em PDF | `orders` | R2 / S08 (`US-47.3`) |
| `POST` | `/api/v1/part-sales/calculate-item` | Pré-cálculo de item avulso por categoria | `partsale` | R2 / S08 (`US-46`) |
| `POST` | `/api/v1/part-sales` | Criar venda avulsa de partes (`VP-YYYY-NNNN`) | `partsale` | R2 / S08 (`US-46`) |
| `GET` | `/api/v1/part-sales` | Listar vendas avulsas paginadas com filtros | `partsale` | R2 / S08 (`US-46`) |
| `GET` | `/api/v1/part-sales/{id}` | Detalhar venda avulsa de partes | `partsale` | R2 / S08 (`US-46`) |
| `PATCH` | `/api/v1/part-sales/{id}/status` | Atualizar status comercial da venda avulsa | `partsale` | R2 / S08 (`US-46`) |
| `GET` | `/api/v1/part-sales/{id}/pdf` | Exportar PDF A4 agrupado da venda avulsa | `partsale` | R2 / S08 (`US-46.4`) |
| `POST` | `/api/v1/part-sales/export-pdf` | Gerar PDF prévio de rascunho avulso | `partsale` | R2 / S08 (`US-46.4`) |
| `GET` | `/api/v1/stock` | Listar saldos consolidados de estoque | `stock` | S09 (`US-22.1`, em branch) |
| `GET` | `/api/v1/stock/materials/{materialId}` | Consultar saldo de um material | `stock` | S09 (`US-21/22`, em branch) |
| `GET` | `/api/v1/stock/movements` | Consultar trilha Kardex | `stock` | S09 (`US-22.2`, em branch) |
| `POST` | `/api/v1/stock/movements` | Registrar entrada/ajuste/perda manual | `stock` | S09 (`US-21.7`, em branch) |
| `POST` | `/api/v1/stock/reserve-for-order/{orderId}` | Reservar insumos para O.S. (Make-to-Order) | `stock` | S09 (`US-21.3`, em branch) |
| `POST` | `/api/v1/stock/consume-for-order/{orderId}` | Baixa física definitiva na conclusão da O.S. | `stock` | S09 (`US-21.5`, em branch) |
| `POST` | `/api/v1/stock/cancel-reservations/{orderId}` | Estornar reservas de O.S. cancelada | `stock` | S09 (`US-21.6`, em branch) |
| `GET` | `/api/v1/stock/orders/{orderId}/alert` | Alerta Make-to-Order da O.S. para o Kanban | `stock` | S09 (`US-21.4`, em branch) |

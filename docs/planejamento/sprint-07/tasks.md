# 📋 Lista de Tarefas (Tasks) — Sprint 07 — Lista de Corte, Fichas de Montagem e Romaneio

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-19: Consolidar Lista Linear e Plana de Corte do Pedido

> **Descrição**: Agrupar e consolidar o plano de corte de perfis de alumínio e chapas de vidro de todas as peças de um pedido para minimizar o desperdício de matéria-prima.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-19.1** | [US-19.1](issues/US-19.1-criar-record-cuttingitemdto-orderitemid-numer/issue.md) Criar record `CuttingItemDTO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java` | 🔲 Pendente |
| **US-19.2** | [US-19.2](issues/US-19.2-criar-record-cuttinglistresponse-orderid-orde/issue.md) Criar record `CuttingListResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java` | 🔲 Pendente |
| **US-19.3** | [US-19.3](issues/US-19.3-criar-record-assemblysheetresponse-em-backend/issue.md) Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java` | 🔲 Pendente |
| **US-19.4** | [US-19.4](issues/US-19.4-implementar-servico-cuttinglistservice-gerarr/issue.md) Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java` | 🔲 Pendente |
| **US-19.5** | [US-19.5](issues/US-19.5-criar-endpoint-get-api-production-orders-orde/issue.md) Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` | 🔲 Pendente |
| **US-19.6** | [US-19.6](issues/US-19.6-criar-testes-unitarios-do-cuttinglistservice-/issue.md) Criar testes unitários do `CuttingListService` | 🔲 Pendente |
| **US-19.7** | [US-19.7](issues/US-19.7-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) Criar modal `CuttingListModal` no frontend | 🔲 Pendente |
| **US-19.8** | [US-19.8](issues/US-19.8-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-19.1**: Criar record `CuttingItemDTO`
- [ ] **US-19.2**: Criar record `CuttingListResponse`
- [ ] **US-19.3**: Criar record `AssemblySheetResponse`
- [ ] **US-19.4**: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)`
- [ ] **US-19.5**: Criar endpoint GET /api/production/orders/{orderId}/cutting-list
- [ ] **US-19.6**: Criar testes unitários do `CuttingListService`
- [ ] **US-19.7**: Criar modal `CuttingListModal` no frontend
- [ ] **US-19.8**: Adicionar botão "Lista de Corte" na tela de detalhes do pedido

---

## 📦 US-20: Gerar Ficha Técnica de Montagem por Item do Pedido

> **Descrição**: Disponibilizar a ficha técnica de montagem passo a passo com orientações, perfis, vidros e componentes de cada modelo de esquadria.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-20.1** | [US-20.1](issues/US-20.1-implementar-metodo-gerarfichamontagem-long-or/issue.md) Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService` | 🔲 Pendente |
| **US-20.2** | [US-20.2](issues/US-20.2-adicionar-endpoint-get-api-order-i/issue.md) Adicionar endpoint GET /api/production/order-items/{id}/assembly-sheet | 🔲 Pendente |
| **US-20.3** | [US-20.3](issues/US-20.3-criar-componente-assemblysheetview-no-fronten/issue.md) Criar componente `AssemblySheetView` no frontend | 🔲 Pendente |
| **US-20.4** | [US-20.4](issues/US-20.4-integrar-a-visualizacao-da-ficha-tecnica-na-t/issue.md) Integrar a visualização da Ficha Técnica na tela de detalhes do pedido (`OrderDetailPage.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-20.1**: Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService`
- [ ] **US-20.2**: Adicionar endpoint GET /api/production/order-items/{id}/assembly-sheet
- [ ] **US-20.3**: Criar componente `AssemblySheetView` no frontend
- [ ] **US-20.4**: Integrar a visualização da Ficha Técnica na tela de detalhes do pedido

---

---

## 🚫 Tarefas Descartadas (Decisão de Escopo)
- As sub-tarefas de romaneio em PDF da antiga US-23 foram arquivadas em [descartadas/](issues/descartadas/).

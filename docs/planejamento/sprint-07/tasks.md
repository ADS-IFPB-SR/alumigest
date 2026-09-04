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

## 📦 US-21: Emitir Romaneio de Oficina em PDF com Checklist de Conferência

> **Descrição**: Emitir romaneio de expedição e conferência de oficina em PDF com caixas de checagem (checklists) para controle de saída de esquadrias e ferragens avulsas.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-21.1** | [US-21.1](issues/US-21.1-criar-servico-workshoppdfservice-gerando-pdf-/issue.md) Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte | 🔲 Pendente |
| **US-21.2** | [US-21.2](issues/US-21.2-adicionar-metodo-para-gerar-pdf-individual-da/issue.md) Adicionar método para gerar PDF da Ficha Técnica do item no `WorkshopPdfService` | 🔲 Pendente |
| **US-21.3** | [US-21.3](issues/US-21.3-adicionar-endpoints-get-api-production-orders/issue.md) Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/order-items/{id}/assembly-sheet-pdf | 🔲 Pendente |
| **US-21.4** | [US-21.4](issues/US-21.4-criar-teste-unitario-do-workshoppdfservicetes/issue.md) Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios | 🔲 Pendente |
| **US-21.5** | [US-21.5](issues/US-21.5-adicionar-botoes-de-download-do-pdf-na-interf/issue.md) Adicionar botões de download do PDF na interface do frontend | 🔲 Pendente |
| **US-21.6** | [US-21.6](issues/US-21.6-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-21.7** | [US-21.7](issues/US-21.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 7 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-21.1**: Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico
- [ ] **US-21.2**: Adicionar método para gerar PDF da Ficha Técnica do item no `WorkshopPdfService`
- [ ] **US-21.3**: Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/order-items/{id}/assembly-sheet-pdf
- [ ] **US-21.4**: Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios
- [ ] **US-21.5**: Adicionar botões de download do PDF na interface do frontend
- [ ] **US-21.6**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-21.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 7

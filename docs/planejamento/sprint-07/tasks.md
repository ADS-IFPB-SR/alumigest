# 📋 Lista de Tarefas (Tasks) — Sprint 07 — Otimização de Corte, Fichas Técnicas de Montagem e Romaneio

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-21: Consolidar Lista Linear e Plana de Corte do Pedido

> **Descrição**: Agrupar e consolidar o plano de corte de perfis de alumínio e chapas de vidro de todas as peças de um pedido para minimizar o desperdício de matéria-prima.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-21.1** | [US-21.1](issues/US-21.1-criar-record-cuttingitemdto-codigoop-numerope/issue.md) Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java` | 🔲 Pendente |
| **US-21.2** | [US-21.2](issues/US-21.2-criar-record-cuttinglistresponse-orderid-orde/issue.md) Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java` | 🔲 Pendente |
| **US-21.3** | [US-21.3](issues/US-21.3-criar-record-assemblysheetresponse-em-backend/issue.md) Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java` | 🔲 Pendente |
| **US-21.4** | [US-21.4](issues/US-21.4-implementar-servico-cuttinglistservice-gerarr/issue.md) Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java` | 🔲 Pendente |
| **US-21.5** | [US-21.5](issues/US-21.5-criar-endpoint-get-api-production-orders-orde/issue.md) Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java` | 🔲 Pendente |
| **US-21.6** | [US-21.6](issues/US-21.6-criar-testes-unitarios-do-cuttinglistservice-/issue.md) Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java` | 🔲 Pendente |
| **US-21.7** | [US-21.7](issues/US-21.7-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx` | 🔲 Pendente |
| **US-21.8** | [US-21.8](issues/US-21.8-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-21.1**: Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`
- [ ] **US-21.2**: Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`
- [ ] **US-21.3**: Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`
- [ ] **US-21.4**: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- [ ] **US-21.5**: Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`
- [ ] **US-21.6**: Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`
- [ ] **US-21.7**: Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`
- [ ] **US-21.8**: Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)

---

## 📦 US-22: Gerar Ficha Técnica de Montagem por Ordem de Produção

> **Descrição**: Disponibilizar a ficha técnica de montagem passo a passo com esquemas de furação, gaxetas, roldanas e guarnições específicas para cada modelo de esquadria.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-22.1** | [US-22.1](issues/US-22.1-implementar-metodo-gerarfichamontagem-long-pr/issue.md) Implementar método `gerarFichaMontagem(Long productionOrderId)` no `CuttingListService` | 🔲 Pendente |
| **US-22.2** | [US-22.2](issues/US-22.2-adicionar-endpoint-get-api-production-product/issue.md) Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController` | 🔲 Pendente |
| **US-22.3** | [US-22.3](issues/US-22.3-criar-componente-assemblysheetview-no-fronten/issue.md) Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx` | 🔲 Pendente |
| **US-22.4** | [US-22.4](issues/US-22.4-integrar-a-visualizacao-da-ficha-tecnica-na-p/issue.md) Integrar a visualização da Ficha Técnica na página de detalhes da OP (`ProductionOrderDetailPage.tsx`) e após leitura no scanner | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-22.1**: Implementar método `gerarFichaMontagem(Long productionOrderId)` no `CuttingListService`
- [ ] **US-22.2**: Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController`
- [ ] **US-22.3**: Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`
- [ ] **US-22.4**: Integrar a visualização da Ficha Técnica na página de detalhes da OP (`ProductionOrderDetailPage.tsx`) e após leitura no scanner

---

## 📦 US-23: Emitir Romaneio de Oficina em PDF com Checklist de Conferência

> **Descrição**: Emitir romaneio de expedição e conferência de oficina em PDF com caixas de checagem (checklists) para controle de saída de esquadrias e ferragens avulsas.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-23.1** | [US-23.1](issues/US-23.1-criar-servico-workshoppdfservice-gerando-pdf-/issue.md) Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java` | 🔲 Pendente |
| **US-23.2** | [US-23.2](issues/US-23.2-adicionar-metodo-para-gerar-pdf-individual-da/issue.md) Adicionar método para gerar PDF individual da Ficha Técnica da OP no `WorkshopPdfService` | 🔲 Pendente |
| **US-23.3** | [US-23.3](issues/US-23.3-adicionar-endpoints-get-api-production-orders/issue.md) Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController` | 🔲 Pendente |
| **US-23.4** | [US-23.4](issues/US-23.4-criar-teste-unitario-do-workshoppdfservicetes/issue.md) Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios | 🔲 Pendente |
| **US-23.5** | [US-23.5](issues/US-23.5-adicionar-botoes-de-download-do-pdf-na-interf/issue.md) Adicionar botões de download do PDF na interface do frontend | 🔲 Pendente |
| **US-23.6** | [US-23.6](issues/US-23.6-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-23.7** | [US-23.7](issues/US-23.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 7 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-23.1**: Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java`
- [ ] **US-23.2**: Adicionar método para gerar PDF individual da Ficha Técnica da OP no `WorkshopPdfService`
- [ ] **US-23.3**: Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`
- [ ] **US-23.4**: Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios
- [ ] **US-23.5**: Adicionar botões de download do PDF na interface do frontend
- [ ] **US-23.6**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-23.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 7


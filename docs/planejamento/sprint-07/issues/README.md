# 📋 Issues da Sprint 7 — Lista de Corte e Ficha Técnica de Montagem

Este diretório contém todas as **19 issues** detalhadas da Sprint 7 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`](T001-criar-record-cuttingitemdto-codigoop-numerope/issue.md) `[P]`
- [T002: Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`](T002-criar-record-cuttinglistresponse-orderid-orde/issue.md) `[P]`
- [T003: Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`](T003-criar-record-assemblysheetresponse-em-backend/issue.md) `[P]`

### Phase 2: User Story 1 - Lista Consolidada de Corte do Pedido (Priority: P1) 🎯 MVP

- [T004: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`](T004-implementar-servico-cuttinglistservice-gerarr/issue.md) `[US1]`
- [T005: Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`](T005-criar-endpoint-get-api-production-orders-orde/issue.md) `[US1]`
- [T006: Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`](T006-criar-testes-unitarios-do-cuttinglistservice-/issue.md) `[P]` `[US1]`
- [T007: Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`](T007-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) `[US1]`
- [T008: Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)](T008-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) `[US1]`

### Phase 3: User Story 2 - Ficha Técnica de Montagem por OP (Priority: P1) 🎯 MVP

- [T009: Implementar método `gerarFichaMontagem(Long productionOrderId)` no `CuttingListService`](T009-implementar-metodo-gerarfichamontagem-long-pr/issue.md) `[US2]`
- [T010: Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController`](T010-adicionar-endpoint-get-api-production-product/issue.md) `[US2]`
- [T011: Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`](T011-criar-componente-assemblysheetview-no-fronten/issue.md) `[US2]`
- [T012: Integrar a visualização da Ficha Técnica na página de detalhes da OP (`ProductionOrderDetailPage.tsx`) e após leitura no scanner](T012-integrar-a-visualizacao-da-ficha-tecnica-na-p/issue.md) `[US2]`

### Phase 4: User Story 3 - Emissão de Romaneio de Oficina em PDF com Checkboxes (Priority: P2)

- [T013: Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java`](T013-criar-servico-workshoppdfservice-gerando-pdf-/issue.md) `[US3]`
- [T014: Adicionar método para gerar PDF individual da Ficha Técnica da OP no `WorkshopPdfService`](T014-adicionar-metodo-para-gerar-pdf-individual-da/issue.md) `[US3]`
- [T015: Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`](T015-adicionar-endpoints-get-api-production-orders/issue.md) `[US3]`
- [T016: Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios](T016-criar-teste-unitario-do-workshoppdfservicetes/issue.md) `[P]` `[US3]`
- [T017: Adicionar botões de download do PDF na interface do frontend](T017-adicionar-botoes-de-download-do-pdf-na-interf/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T018: Documentar endpoints no OpenAPI/Swagger](T018-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T019: Executar validação dos cenários de teste do `quickstart.md` da Sprint 7](T019-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

# 📋 Issues da Sprint 6 — Ordens de Produção (OP) e Etiquetas QR Code

Este diretório contém todas as **36 issues** detalhadas da Sprint 6 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup (Shared Infrastructure)

- [T001: Adicionar dependências `com.google.zxing:core:3.5.3` e `com.google.zxing:javase:3.5.3` no `backend/pom.xml`](T001-adicionar-dependencias-com-google-zxing-core-/issue.md)
- [T002: Adicionar dependência `html5-qrcode` no `frontend/package.json`](T002-adicionar-dependencia-html5-qrcode-no-fronten/issue.md) `[P]`

### Phase 2: Foundational (Blocking Prerequisites)

- [T003: Criar migration Flyway `backend/src/main/resources/db/migration/V10__create_production_orders_schema.sql` com tabelas `production_orders` e `production_order_histories`](T003-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T004: Criar enum `ProductionOrderStatus` (AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO) em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderStatus.java`](T004-criar-enum-productionorderstatus-aguardando-c/issue.md) `[P]`
- [T005: Criar entidade JPA `ProductionOrder` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrder.java`](T005-criar-entidade-jpa-productionorder-em-backend/issue.md)
- [T006: Criar entidade JPA `ProductionOrderHistory` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderHistory.java`](T006-criar-entidade-jpa-productionorderhistory-em-/issue.md)
- [T007: Criar repositório `ProductionOrderRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderRepository.java`](T007-criar-repositorio-productionorderrepository-e/issue.md) `[P]`
- [T008: Criar repositório `ProductionOrderHistoryRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderHistoryRepository.java`](T008-criar-repositorio-productionorderhistoryrepos/issue.md) `[P]`
- [T009: Criar serviço gerador de imagens QR Code `QrCodeGeneratorService` usando ZXing em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/QrCodeGeneratorService.java`](T009-criar-servico-gerador-de-imagens-qr-code-qrco/issue.md)

### Phase 3: User Story 1 - Geração de OPs Individuais por Peça (Priority: P1) 🎯 MVP

- [T010: Criar record `ProductionOrderResponse` com todos os dados da peça, cliente, status e datas em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderResponse.java`](T010-criar-record-productionorderresponse-com-todo/issue.md) `[P]` `[US1]`
- [T011: Criar record `ProductionOrderHistoryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderHistoryResponse.java`](T011-criar-record-productionorderhistoryresponse-e/issue.md) `[P]` `[US1]`
- [T012: Criar mapper MapStruct `ProductionOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/production/mapper/ProductionOrderMapper.java`](T012-criar-mapper-mapstruct-productionordermapper-/issue.md) `[US1]`
- [T013: Implementar método `gerarOrdensDeProducao(Long orderId)` no `ProductionOrderService` decompondo cada item em $N$ OPs físicas e atualizando o status do Pedido para `EM_PRODUCAO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/ProductionOrderService.java`](T013-implementar-metodo-gerarordensdeproducao-long/issue.md) `[US1]`
- [T014: Implementar métodos `buscarPorCodigo(String codigo)` e `listar(Pageable, status, orderId, busca)` no `ProductionOrderService`](T014-implementar-metodos-buscarporcodigo-string-co/issue.md) `[US1]`
- [T015: Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`](T015-criar-productionordercontroller-com-endpoints/issue.md) `[US1]`
- [T016: Criar testes unitários do `ProductionOrderService` para decomposição de itens em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/ProductionOrderServiceTest.java`](T016-criar-testes-unitarios-do-productionorderserv/issue.md) `[P]` `[US1]`

### Phase 4: User Story 2 - Emissão de Etiquetas com QR Code 100x50mm (Priority: P1) 🎯 MVP

- [T017: Criar serviço `LabelPdfService` usando OpenPDF com tamanho de página 100x50mm, embutindo imagem gerada pelo `QrCodeGeneratorService`, logo, código da OP, cliente, descrição e medidas em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`](T017-criar-servico-labelpdfservice-usando-openpdf-/issue.md) `[US2]`
- [T018: Adicionar endpoint GET /api/production-orders/order/{orderId}/labels-pdf no `ProductionOrderController` (retorna application/pdf)](T018-adicionar-endpoint-get-api-production-orders-/issue.md) `[US2]`
- [T019: Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`](T019-criar-teste-unitario-do-labelpdfservice-valid/issue.md) `[P]` `[US2]`
- [T020: Adicionar botão "Imprimir Etiquetas com QR Code" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`)](T020-adicionar-botao-imprimir-etiquetas-com-qr-cod/issue.md) `[US2]`

### Phase 5: User Story 3 - Scanner de QR Code e Atualização de Status (Priority: P1) 🎯 MVP

- [T021: Criar record `ProductionOrderTransitionRequest` (novoStatus, operadorNome, observacao) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderTransitionRequest.java`](T021-criar-record-productionordertransitionrequest/issue.md) `[P]` `[US3]`
- [T022: Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido](T022-implementar-metodo-transicionarstatus-long-id/issue.md) `[US3]`
- [T023: Adicionar endpoint PATCH /api/production-orders/{id}/transition no `ProductionOrderController`](T023-adicionar-endpoint-patch-api-production-order/issue.md) `[US3]`
- [T024: Criar interfaces TypeScript e serviço de API Axios (`productionApi.ts`) em `frontend/src/features/production/services/productionApi.ts`](T024-criar-interfaces-typescript-e-servico-de-api-/issue.md) `[P]` `[US3]`
- [T025: Criar hooks React Query (`useProductionOrders.ts`) em `frontend/src/features/production/hooks/useProductionOrders.ts`](T025-criar-hooks-react-query-useproductionorders-t/issue.md) `[US3]`
- [T026: Criar componente `QrScannerModal` com `html5-qrcode` para leitura via câmera traseira do dispositivo em `frontend/src/features/production/components/QrScannerModal.tsx`](T026-criar-componente-qrscannermodal-com-html5-qrc/issue.md) `[US3]`
- [T027: Criar página `ProductionScannerPage` para operação rápida de chão de fábrica com bipagem e seleção de operador em `frontend/src/pages/ProductionScannerPage.tsx`](T027-criar-pagina-productionscannerpage-para-opera/issue.md) `[US3]`
- [T028: Criar página `ProductionOrderDetailPage` com ficha técnica completa da peça e histórico de etapas em `frontend/src/pages/ProductionOrderDetailPage.tsx`](T028-criar-pagina-productionorderdetailpage-com-fi/issue.md) `[US3]`

### Phase 6: User Story 4 - Quadro Kanban de Acompanhamento da Fábrica (Priority: P2)

- [T029: Criar componente `ProductionStatusBadge` em `frontend/src/features/production/components/ProductionStatusBadge.tsx`](T029-criar-componente-productionstatusbadge-em-fro/issue.md) `[US4]`
- [T030: Criar componente `ProductionOrderCard` em `frontend/src/features/production/components/ProductionOrderCard.tsx`](T030-criar-componente-productionordercard-em-front/issue.md) `[US4]`
- [T031: Criar componente `ProductionKanbanBoard` com colunas (Aguardando Corte, Corte, Montagem, CQ, Pronto) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`](T031-criar-componente-productionkanbanboard-com-co/issue.md) `[US4]`
- [T032: Criar página `ProductionKanbanPage` com filtros de busca e botão de atalho para o Scanner em `frontend/src/pages/ProductionKanbanPage.tsx`](T032-criar-pagina-productionkanbanpage-com-filtros/issue.md) `[US4]`
- [T033: Configurar rotas `/producao`, `/producao/scanner`, `/producao/op/:codigo` no React Router em `frontend/src/App.tsx`](T033-configurar-rotas-producao-producao-scanner-pr/issue.md) `[US4]`

### Phase 7: Polish & Cross-Cutting Concerns

- [T034: Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger](T034-documentar-endpoints-do-productionordercontro/issue.md) `[P]`
- [T035: Adicionar atalhos de "Chão de Fábrica" e "Scanner QR" no menu lateral do frontend](T035-adicionar-atalhos-de-chao-de-fabrica-e-scanne/issue.md) `[P]`
- [T036: Executar validação dos cenários de teste do `quickstart.md` da Sprint 6](T036-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

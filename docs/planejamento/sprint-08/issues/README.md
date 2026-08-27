# 📋 Issues da Sprint 8 — Estoque, Perdas e Homologação R2

Este diretório contém todas as **36 issues** detalhadas da Sprint 8 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`](T001-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md)
- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements` e `scrap_records`](T002-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T003: Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`](T003-criar-enum-stockmovementtype-entrada-compra-r/issue.md) `[P]`
- [T004: Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java`](T004-criar-enum-scrapreason-quebra-manuseio-erro-m/issue.md) `[P]`
- [T005: Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`](T005-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md)
- [T006: Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`](T006-criar-entidade-jpa-stockmovement-em-backend-s/issue.md)
- [T007: Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java`](T007-criar-entidade-jpa-scraprecord-em-backend-src/issue.md)
- [T008: Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`](T008-criar-repositorio-stockitemrepository-em-back/issue.md) `[P]`
- [T009: Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`](T009-criar-repositorio-stockmovementrepository-em-/issue.md) `[P]`
- [T010: Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java`](T010-criar-repositorio-scraprecordrepository-em-ba/issue.md) `[P]`

### Phase 2: User Story 1 - Reserva e Baixa Automática de Estoque (Priority: P1) 🎯 MVP

- [T011: Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`](T011-criar-record-stockitemresponse-saldos-fisico-/issue.md) `[P]` `[US1]`
- [T012: Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`](T012-criar-record-stockmovementrequest-e-stockmove/issue.md) `[P]` `[US1]`
- [T013: Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`](T013-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) `[US1]`
- [T014: Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`](T014-implementar-metodo-reservarmateriais-long-ord/issue.md) `[US1]`
- [T015: Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física](T015-implementar-metodo-baixarmateriais-long-produ/issue.md) `[US1]`
- [T016: Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`](T016-implementar-metodo-registrarmovimentacaomanua/issue.md) `[US1]`
- [T017: Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`](T017-criar-stockcontroller-com-endpoints-get-api-s/issue.md) `[US1]`
- [T018: Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`](T018-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) `[P]` `[US1]`

### Phase 3: User Story 2 - Apontamento de Perdas & Sucata (Priority: P1) 🎯 MVP

- [T019: Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`](T019-criar-record-scraprecordrequest-e-scraprecord/issue.md) `[P]` `[US2]`
- [T020: Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java`](T020-implementar-metodo-registrarperda-scraprecord/issue.md) `[US2]`
- [T021: Adicionar endpoint POST /api/stock/scrap no `StockController`](T021-adicionar-endpoint-post-api-stock-scrap-no-st/issue.md) `[US2]`
- [T022: Criar teste unitário do `ScrapServiceTest`](T022-criar-teste-unitario-do-scrapservicetest/issue.md) `[P]` `[US2]`

### Phase 4: User Story 3 - Painel de Posição de Estoque no Frontend (Priority: P2)

- [T023: Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`](T023-criar-interfaces-typescript-e-schemas-zod-em-/issue.md) `[P]` `[US3]`
- [T024: Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)](T024-criar-servico-de-api-axios-stockapi-ts-e-hook/issue.md) `[US3]`
- [T025: Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`](T025-criar-componente-stocktable-com-badges-de-ale/issue.md) `[US3]`
- [T026: Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`](T026-criar-modal-stockmovementmodal-para-entrada-d/issue.md) `[US3]`
- [T027: Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx`](T027-criar-modal-scraprecordmodal-para-registro-de/issue.md) `[US3]`
- [T028: Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`](T028-criar-componente-kardexdrawer-com-historico-d/issue.md) `[US3]`
- [T029: Criar página `StockPage` e registrar rota `/estoque` no React Router](T029-criar-pagina-stockpage-e-registrar-rota-estoq/issue.md) `[US3]`

### Phase 5: User Story 4 - Homologação Integrada da Release 2 (Priority: P2)

- [T030: Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2](T030-executar-mvn-clean-verify-no-backend-e-corrig/issue.md) `[US4]`
- [T031: Executar `npm run build` no frontend e validar tipagem estrita](T031-executar-npm-run-build-no-frontend-e-validar-/issue.md) `[US4]`
- [T032: Validar os cenários E2E da Release 2 no ambiente local](T032-validar-os-cenarios-e2e-da-release-2-no-ambie/issue.md) `[US4]`
- [T033: Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`](T033-documentar-relatorio-de-testes-de-aceitacao-d/issue.md) `[US4]`

### Phase 6: Polish & Cross-Cutting Concerns

- [T034: Documentação OpenAPI/Swagger nos endpoints de estoque](T034-documentacao-openapi-swagger-nos-endpoints-de/issue.md) `[P]`
- [T035: Adicionar atalho "Estoque & Materiais" no menu do frontend](T035-adicionar-atalho-estoque-materiais-no-menu-do/issue.md) `[P]`
- [T036: Validação final do `quickstart.md` da Sprint 8](T036-validacao-final-do-quickstart-md-da-sprint-8/issue.md)

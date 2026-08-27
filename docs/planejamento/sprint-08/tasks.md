# Tasks: Sprint 8 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-stock.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V11, Entidades JPA, Repositories e Enums

- [ ] T001 Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`
- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements` e `scrap_records`
- [ ] T003 [P] Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`
- [ ] T004 [P] Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java`
- [ ] T005 Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`
- [ ] T006 Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`
- [ ] T007 Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java`
- [ ] T008 [P] Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`
- [ ] T009 [P] Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`
- [ ] T010 [P] Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java`

---

## Phase 2: User Story 1 - Reserva e Baixa Automática de Estoque (Priority: P1) 🎯 MVP

**Goal**: Reservar materiais na liberação da produção e baixar fisicamente no corte da esquadria.

**Independent Test**: Liberar pedido para produção, verificar reserva nos itens de estoque e confirmar baixa após corte.

- [ ] T011 [P] [US1] Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`
- [ ] T012 [P] [US1] Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- [ ] T013 [US1] Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`
- [ ] T014 [US1] Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`
- [ ] T015 [US1] Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física
- [ ] T016 [US1] Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`
- [ ] T017 [US1] Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`
- [ ] T018 [P] [US1] Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`

---

## Phase 3: User Story 2 - Apontamento de Perdas & Sucata (Priority: P1) 🎯 MVP

**Goal**: Registrar perdas de materiais com motivo e debitar do saldo físico.

**Independent Test**: Registrar perda de vidro informando motivo e constatar débito no estoque e gravação de sucata.

- [ ] T019 [P] [US2] Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`
- [ ] T020 [US2] Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java`
- [ ] T021 [US2] Adicionar endpoint POST /api/stock/scrap no `StockController`
- [ ] T022 [P] [US2] Criar teste unitário do `ScrapServiceTest`

---

## Phase 4: User Story 3 - Painel de Posição de Estoque no Frontend (Priority: P2)

**Goal**: Tela com tabela de saldos, alertas visuais, modal de entrada de mercadoria e modal de perda.

**Independent Test**: Visualizar alertas de estoque mínimo e abrir gaveta de extrato Kardex.

- [ ] T023 [P] [US3] Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`
- [ ] T024 [US3] Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)
- [ ] T025 [US3] Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`
- [ ] T026 [US3] Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`
- [ ] T027 [US3] Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx`
- [ ] T028 [US3] Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`
- [ ] T029 [US3] Criar página `StockPage` e registrar rota `/estoque` no React Router

---

## Phase 5: User Story 4 - Homologação Integrada da Release 2 (Priority: P2)

**Goal**: Validar o ciclo completo da Release 2: Pedido Lock → OPs e QR Code → Romaneio de Corte → Baixa de Estoque e Perdas.

**Independent Test**: Executar `mvn clean verify` e `npm run build` com SonarQube Quality Gate aprovado.

- [ ] T030 [US4] Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2
- [ ] T031 [US4] Executar `npm run build` no frontend e validar tipagem estrita
- [ ] T032 [US4] Validar os cenários E2E da Release 2 no ambiente local
- [ ] T033 [US4] Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T034 [P] Documentação OpenAPI/Swagger nos endpoints de estoque
- [ ] T035 [P] Adicionar atalho "Estoque & Materiais" no menu do frontend
- [ ] T036 Validação final do `quickstart.md` da Sprint 8
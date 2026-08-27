# Tasks: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-cash-flow.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V14, Entidade JPA CashFlow e Repository

- [ ] T001 Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- [ ] T002 Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- [ ] T003 [P] Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`

---

## Phase 2: User Story 1 - Baixa Manual de Títulos (Priority: P1) 🎯 MVP

**Goal**: Liquidar total ou parcialmente títulos informando método de pagamento e descontos/juros com transação atômica.

**Independent Test**: Realizar baixa de título com desconto em dinheiro e constatar atualização de saldo em caixa e quitação do título.

- [ ] T004 [P] [US1] Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java`
- [ ] T005 [US1] Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java`
- [ ] T006 [US1] Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java`
- [ ] T007 [P] [US1] Criar testes unitários do `SettlementServiceTest`
- [ ] T008 [US1] Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx`
- [ ] T009 [US1] Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`)

---

## Phase 3: User Story 2 - Painel de Fluxo de Caixa (Priority: P1) 🎯 MVP

**Goal**: Painel consolidado com total de entradas do dia por método e projeção de recebimentos futuros.

**Independent Test**: Consultar resumo de fluxo de caixa e verificar curva de recebimentos projetada para os próximos 30 dias.

- [ ] T010 [P] [US2] Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java`
- [ ] T011 [US2] Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- [ ] T012 [US2] Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`
- [ ] T013 [US2] Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/`
- [ ] T014 [US2] Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router

---

## Phase 4: User Story 3 - Relatório de Fechamento de Caixa em PDF (Priority: P2)

**Goal**: Gerar relatório de fechamento de caixa diário consolidado da empresa em PDF via OpenPDF.

**Independent Test**: Emitir relatório de fechamento do dia e validar totais agrupados por dinheiro, PIX e cartão.

- [ ] T015 [US3] Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java`
- [ ] T016 [US3] Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController`
- [ ] T017 [P] [US3] Criar teste unitário do `DailyClosurePdfServiceTest`
- [ ] T018 [US3] Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T019 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T020 [P] Adicionar atalho "Fluxo de Caixa" no menu do frontend
- [ ] T021 Executar validação dos cenários de teste do `quickstart.md` da Sprint 11
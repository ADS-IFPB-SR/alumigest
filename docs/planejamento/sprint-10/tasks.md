# Tasks: Sprint 10 — Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-receivables.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V13, Entidades JPA, Repositories e Enums

- [ ] T001 Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables`
- [ ] T002 [P] Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- [ ] T003 Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java`
- [ ] T004 [P] Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java`
- [ ] T005 Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java`

---

## Phase 2: User Story 1 - Desdobramento Automático e Edição de Parcelas (Priority: P1) 🎯 MVP

**Goal**: Gerar automaticamente os títulos do pedido e permitir customização manual de datas e valores.

**Independent Test**: Gerar parcelas para pedido com valor ímpar e constatar atribuição do resto na 1ª parcela.

- [ ] T006 [P] [US1] Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java`
- [ ] T007 [P] [US1] Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java`
- [ ] T008 [US1] Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java`
- [ ] T009 [US1] Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java`
- [ ] T010 [US1] Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java`
- [ ] T011 [P] [US1] Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest`

---

## Phase 3: User Story 2 - Painel de Contas a Receber e Inadimplência (Priority: P1) 🎯 MVP

**Goal**: Listar títulos paginados com filtros de status, período e destaque visual de parcelas vencidas em atraso.

**Independent Test**: Consultar títulos e verificar cálculo dinâmico de dias em atraso para parcelas vencidas.

- [ ] T012 [US2] Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO`
- [ ] T013 [US2] Criar endpoint GET /api/finance/receivables no `AccountReceivableController`
- [ ] T014 [P] [US2] Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`
- [ ] T015 [US2] Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx`
- [ ] T016 [US2] Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router

---

## Phase 4: User Story 3 - Extrato do Cliente e Recibo de Quitação em PDF (Priority: P2)

**Goal**: Consultar posição financeira do cliente e emitir recibo oficial de parcela em PDF via OpenPDF.

**Independent Test**: Baixar recibo de quitação em PDF e verificar presença de dados da Alumiportas e valor por extenso.

- [ ] T017 [P] [US3] Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java`
- [ ] T018 [US3] Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService`
- [ ] T019 [US3] Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java`
- [ ] T020 [US3] Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController`
- [ ] T021 [P] [US3] Criar teste unitário do `ReceiptPdfServiceTest`
- [ ] T022 [US3] Criar componente `ClientFinancialStatementCard` no frontend

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI, atalhos de menu e validação final

- [ ] T023 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T024 [P] Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend
- [ ] T025 Executar validação dos cenários de teste do `quickstart.md` da Sprint 10
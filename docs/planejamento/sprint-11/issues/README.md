# 📋 Issues da Sprint 11 — Baixa de Pagamentos e Fluxo de Caixa

Este diretório contém todas as **21 issues** detalhadas da Sprint 11 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`](T001-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T002: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`](T002-criar-entidade-jpa-cashflow-em-backend-src-ma/issue.md)
- [T003: Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`](T003-criar-repositorio-cashflowrepository-com-quer/issue.md) `[P]`

### Phase 2: User Story 1 - Baixa Manual de Títulos (Priority: P1) 🎯 MVP

- [T004: Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java`](T004-criar-record-settlementrequest-metodopagament/issue.md) `[P]` `[US1]`
- [T005: Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java`](T005-implementar-servico-settlementservice-liquida/issue.md) `[US1]`
- [T006: Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java`](T006-criar-endpoint-post-api-finance-receivables-i/issue.md) `[US1]`
- [T007: Criar testes unitários do `SettlementServiceTest`](T007-criar-testes-unitarios-do-settlementservicete/issue.md) `[P]` `[US1]`
- [T008: Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx`](T008-criar-modal-settlementmodal-no-frontend-com-c/issue.md) `[US1]`
- [T009: Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`)](T009-adicionar-botao-dar-baixa-na-tabela-de-contas/issue.md) `[US1]`

### Phase 3: User Story 2 - Painel de Fluxo de Caixa (Priority: P1) 🎯 MVP

- [T010: Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java`](T010-criar-record-cashflowsummaryresponse-em-backe/issue.md) `[P]` `[US2]`
- [T011: Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`](T011-implementar-servico-cashflowservice-obterresu/issue.md) `[US2]`
- [T012: Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`](T012-criar-endpoint-get-api-finance-cash-flow-summ/issue.md) `[US2]`
- [T013: Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/`](T013-criar-componente-cashflowsummarycards-e-cashf/issue.md) `[US2]`
- [T014: Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router](T014-criar-pagina-cashflowpage-e-registrar-rota-fi/issue.md) `[US2]`

### Phase 4: User Story 3 - Relatório de Fechamento de Caixa em PDF (Priority: P2)

- [T015: Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java`](T015-criar-servico-dailyclosurepdfservice-gerando-/issue.md) `[US3]`
- [T016: Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController`](T016-adicionar-endpoint-get-api-finance-cash-flow-/issue.md) `[US3]`
- [T017: Criar teste unitário do `DailyClosurePdfServiceTest`](T017-criar-teste-unitario-do-dailyclosurepdfservic/issue.md) `[P]` `[US3]`
- [T018: Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa](T018-adicionar-botao-emitir-fechamento-de-caixa-na/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T019: Documentar endpoints no OpenAPI/Swagger](T019-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T020: Adicionar atalho "Fluxo de Caixa" no menu do frontend](T020-adicionar-atalho-fluxo-de-caixa-no-menu-do-fr/issue.md) `[P]`
- [T021: Executar validação dos cenários de teste do `quickstart.md` da Sprint 11](T021-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

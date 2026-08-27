# 📋 Issues da Sprint 10 — Contas a Receber e Parcelamento

Este diretório contém todas as **25 issues** detalhadas da Sprint 10 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables`](T001-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T002: Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`](T002-criar-enums-receivablestatus-a-vencer-vencido/issue.md) `[P]`
- [T003: Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java`](T003-criar-entidade-jpa-accountreceivable-em-backe/issue.md)
- [T004: Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java`](T004-criar-repositorio-accountreceivablerepository/issue.md) `[P]`
- [T005: Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java`](T005-criar-servico-utilitario-installmentcalculato/issue.md)

### Phase 2: User Story 1 - Desdobramento Automático e Edição de Parcelas (Priority: P1) 🎯 MVP

- [T006: Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java`](T006-criar-record-accountreceivableresponse-em-bac/issue.md) `[P]` `[US1]`
- [T007: Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java`](T007-criar-record-installmentplancustomrequest-em-/issue.md) `[P]` `[US1]`
- [T008: Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java`](T008-criar-mapper-mapstruct-accountreceivablemappe/issue.md) `[US1]`
- [T009: Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java`](T009-implementar-servico-accountreceivableservice-/issue.md) `[US1]`
- [T010: Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java`](T010-criar-endpoint-post-api-finance-receivables-o/issue.md) `[US1]`
- [T011: Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest`](T011-criar-testes-unitarios-do-installmentcalculat/issue.md) `[P]` `[US1]`

### Phase 3: User Story 2 - Painel de Contas a Receber e Inadimplência (Priority: P1) 🎯 MVP

- [T012: Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO`](T012-implementar-metodo-listar-pageable-status-cli/issue.md) `[US2]`
- [T013: Criar endpoint GET /api/finance/receivables no `AccountReceivableController`](T013-criar-endpoint-get-api-finance-receivables-no/issue.md) `[US2]`
- [T014: Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`](T014-criar-interfaces-typescript-e-servico-axios-r/issue.md) `[P]` `[US2]`
- [T015: Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx`](T015-criar-componente-receivablestable-com-badges-/issue.md) `[US2]`
- [T016: Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router](T016-criar-pagina-receivablespage-e-registrar-rota/issue.md) `[US2]`

### Phase 4: User Story 3 - Extrato do Cliente e Recibo de Quitação em PDF (Priority: P2)

- [T017: Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java`](T017-criar-record-clientfinancialstatementresponse/issue.md) `[P]` `[US3]`
- [T018: Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService`](T018-implementar-metodo-obterextratocliente-long-c/issue.md) `[US3]`
- [T019: Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java`](T019-criar-servico-receiptpdfservice-gerando-recib/issue.md) `[US3]`
- [T020: Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController`](T020-adicionar-endpoints-get-api-finance-receivabl/issue.md) `[US3]`
- [T021: Criar teste unitário do `ReceiptPdfServiceTest`](T021-criar-teste-unitario-do-receiptpdfservicetest/issue.md) `[P]` `[US3]`
- [T022: Criar componente `ClientFinancialStatementCard` no frontend](T022-criar-componente-clientfinancialstatementcard/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T023: Documentar endpoints no OpenAPI/Swagger](T023-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T024: Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend](T024-adicionar-atalho-contas-a-receber-no-submenu-/issue.md) `[P]`
- [T025: Executar validação dos cenários de teste do `quickstart.md` da Sprint 10](T025-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

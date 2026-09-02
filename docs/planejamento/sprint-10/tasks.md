# 📋 Lista de Tarefas (Tasks) — Sprint 10 — Contas a Receber, Parcelamento e Controle de Inadimplência

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-31: Desdobrar e Gerenciar Parcelamento de Pedidos

> **Descrição**: Gerar automaticamente os títulos a receber com base na condição de pagamento (Entrada + Saldo, Cartão em N vezes, etc.) com datas de vencimento configuráveis.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-31.1** | [US-31.1](issues/US-31.1-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables` | 🔲 Pendente |
| **US-31.2** | [US-31.2](issues/US-31.2-criar-enums-receivablestatus-a-vencer-vencido/issue.md) Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | 🔲 Pendente |
| **US-31.3** | [US-31.3](issues/US-31.3-criar-entidade-jpa-accountreceivable-em-backe/issue.md) Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java` | 🔲 Pendente |
| **US-31.4** | [US-31.4](issues/US-31.4-criar-repositorio-accountreceivablerepository/issue.md) Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java` | 🔲 Pendente |
| **US-31.5** | [US-31.5](issues/US-31.5-criar-servico-utilitario-installmentcalculato/issue.md) Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java` | 🔲 Pendente |
| **US-31.6** | [US-31.6](issues/US-31.6-criar-record-accountreceivableresponse-em-bac/issue.md) Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java` | 🔲 Pendente |
| **US-31.7** | [US-31.7](issues/US-31.7-criar-record-installmentplancustomrequest-em-/issue.md) Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java` | 🔲 Pendente |
| **US-31.8** | [US-31.8](issues/US-31.8-criar-mapper-mapstruct-accountreceivablemappe/issue.md) Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java` | 🔲 Pendente |
| **US-31.9** | [US-31.9](issues/US-31.9-implementar-servico-accountreceivableservice-/issue.md) Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java` | 🔲 Pendente |
| **US-31.10** | [US-31.10](issues/US-31.10-criar-endpoint-post-api-finance-receivables-o/issue.md) Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java` | 🔲 Pendente |
| **US-31.11** | [US-31.11](issues/US-31.11-criar-testes-unitarios-do-installmentcalculat/issue.md) Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-31.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables`
- [ ] **US-31.2**: Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- [ ] **US-31.3**: Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java`
- [ ] **US-31.4**: Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java`
- [ ] **US-31.5**: Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java`
- [ ] **US-31.6**: Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java`
- [ ] **US-31.7**: Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java`
- [ ] **US-31.8**: Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java`
- [ ] **US-31.9**: Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java`
- [ ] **US-31.10**: Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java`
- [ ] **US-31.11**: Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest`

---

## 📦 US-32: Controlar Contas a Receber, Vencimentos e Inadimplência

> **Descrição**: Painel gerencial de contas a receber com visão de títulos a vencer, vencidos, taxas de inadimplência e alertas visuais.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-32.1** | [US-32.1](issues/US-32.1-implementar-metodo-listar-pageable-status-cli/issue.md) Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO` | 🔲 Pendente |
| **US-32.2** | [US-32.2](issues/US-32.2-criar-endpoint-get-api-finance-receivables-no/issue.md) Criar endpoint GET /api/finance/receivables no `AccountReceivableController` | 🔲 Pendente |
| **US-32.3** | [US-32.3](issues/US-32.3-criar-interfaces-typescript-e-servico-axios-r/issue.md) Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts` | 🔲 Pendente |
| **US-32.4** | [US-32.4](issues/US-32.4-criar-componente-receivablestable-com-badges-/issue.md) Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx` | 🔲 Pendente |
| **US-32.5** | [US-32.5](issues/US-32.5-criar-pagina-receivablespage-e-registrar-rota/issue.md) Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-32.1**: Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO`
- [ ] **US-32.2**: Criar endpoint GET /api/finance/receivables no `AccountReceivableController`
- [ ] **US-32.3**: Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`
- [ ] **US-32.4**: Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx`
- [ ] **US-32.5**: Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router

---

## 📦 US-33: Emitir Extrato Financeiro do Cliente e Recibo de Quitação

> **Descrição**: Gerar extrato financeiro detalhado por cliente e emitir recibos oficiais de quitação total ou parcial em PDF.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-33.1** | [US-33.1](issues/US-33.1-criar-record-clientfinancialstatementresponse/issue.md) Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java` | 🔲 Pendente |
| **US-33.2** | [US-33.2](issues/US-33.2-implementar-metodo-obterextratocliente-long-c/issue.md) Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService` | 🔲 Pendente |
| **US-33.3** | [US-33.3](issues/US-33.3-criar-servico-receiptpdfservice-gerando-recib/issue.md) Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java` | 🔲 Pendente |
| **US-33.4** | [US-33.4](issues/US-33.4-adicionar-endpoints-get-api-finance-receivabl/issue.md) Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController` | 🔲 Pendente |
| **US-33.5** | [US-33.5](issues/US-33.5-criar-teste-unitario-do-receiptpdfservicetest/issue.md) Criar teste unitário do `ReceiptPdfServiceTest` | 🔲 Pendente |
| **US-33.6** | [US-33.6](issues/US-33.6-criar-componente-clientfinancialstatementcard/issue.md) Criar componente `ClientFinancialStatementCard` no frontend | 🔲 Pendente |
| **US-33.7** | [US-33.7](issues/US-33.7-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-33.8** | [US-33.8](issues/US-33.8-adicionar-atalho-contas-a-receber-no-submenu-/issue.md) Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend | 🔲 Pendente |
| **US-33.9** | [US-33.9](issues/US-33.9-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 10 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-33.1**: Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java`
- [ ] **US-33.2**: Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService`
- [ ] **US-33.3**: Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java`
- [ ] **US-33.4**: Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController`
- [ ] **US-33.5**: Criar teste unitário do `ReceiptPdfServiceTest`
- [ ] **US-33.6**: Criar componente `ClientFinancialStatementCard` no frontend
- [ ] **US-33.7**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-33.8**: Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend
- [ ] **US-33.9**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 10


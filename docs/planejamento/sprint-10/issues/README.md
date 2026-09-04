# 📌 Issues de Implementação — Sprint 10 — Contas a Receber, Parcelamento e Controle de Inadimplência

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-27: Desdobrar e Gerenciar Parcelamento de Pedidos

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-27.1](US-27.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables` | `backlog` | 🔲 Aberta |
| [US-27.2](US-27.2-criar-enums-receivablestatus-a-vencer-vencido/issue.md) | Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | `backlog` | 🔲 Aberta |
| [US-27.3](US-27.3-criar-entidade-jpa-accountreceivable-em-backe/issue.md) | Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java` | `backlog` | 🔲 Aberta |
| [US-27.4](US-27.4-criar-repositorio-accountreceivablerepository/issue.md) | Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java` | `backlog` | 🔲 Aberta |
| [US-27.5](US-27.5-criar-servico-utilitario-installmentcalculato/issue.md) | Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java` | `backlog` | 🔲 Aberta |
| [US-27.6](US-27.6-criar-record-accountreceivableresponse-em-bac/issue.md) | Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java` | `backlog` | 🔲 Aberta |
| [US-27.7](US-27.7-criar-record-installmentplancustomrequest-em-/issue.md) | Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java` | `backlog` | 🔲 Aberta |
| [US-27.8](US-27.8-criar-mapper-mapstruct-accountreceivablemappe/issue.md) | Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java` | `backlog` | 🔲 Aberta |
| [US-27.9](US-27.9-implementar-servico-accountreceivableservice-/issue.md) | Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java` | `backlog` | 🔲 Aberta |
| [US-27.10](US-27.10-criar-endpoint-post-api-finance-receivables-o/issue.md) | Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java` | `backlog` | 🔲 Aberta |
| [US-27.11](US-27.11-criar-testes-unitarios-do-installmentcalculat/issue.md) | Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest` | `backlog` | 🔲 Aberta |

## 📦 US-28: Controlar Contas a Receber, Vencimentos e Inadimplência

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-28.1](US-28.1-implementar-metodo-listar-pageable-status-cli/issue.md) | Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO` | `backlog` | 🔲 Aberta |
| [US-28.2](US-28.2-criar-endpoint-get-api-finance-receivables-no/issue.md) | Criar endpoint GET /api/finance/receivables no `AccountReceivableController` | `backlog` | 🔲 Aberta |
| [US-28.3](US-28.3-criar-interfaces-typescript-e-servico-axios-r/issue.md) | Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts` | `backlog` | 🔲 Aberta |
| [US-28.4](US-28.4-criar-componente-receivablestable-com-badges-/issue.md) | Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx` | `backlog` | 🔲 Aberta |
| [US-28.5](US-28.5-criar-pagina-receivablespage-e-registrar-rota/issue.md) | Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router | `backlog` | 🔲 Aberta |

## 📦 US-29: Emitir Extrato Financeiro do Cliente e Recibo de Quitação

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-29.1](US-29.1-criar-record-clientfinancialstatementresponse/issue.md) | Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java` | `backlog` | 🔲 Aberta |
| [US-29.2](US-29.2-implementar-metodo-obterextratocliente-long-c/issue.md) | Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService` | `backlog` | 🔲 Aberta |
| [US-29.3](US-29.3-criar-servico-receiptpdfservice-gerando-recib/issue.md) | Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java` | `backlog` | 🔲 Aberta |
| [US-29.4](US-29.4-adicionar-endpoints-get-api-finance-receivabl/issue.md) | Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController` | `backlog` | 🔲 Aberta |
| [US-29.5](US-29.5-criar-teste-unitario-do-receiptpdfservicetest/issue.md) | Criar teste unitário do `ReceiptPdfServiceTest` | `backlog` | 🔲 Aberta |
| [US-29.6](US-29.6-criar-componente-clientfinancialstatementcard/issue.md) | Criar componente `ClientFinancialStatementCard` no frontend | `backlog` | 🔲 Aberta |
| [US-29.7](US-29.7-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-29.8](US-29.8-adicionar-atalho-contas-a-receber-no-submenu-/issue.md) | Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend | `backlog` | 🔲 Aberta |
| [US-29.9](US-29.9-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 10 | `backlog` | 🔲 Aberta |


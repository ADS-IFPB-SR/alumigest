# 📌 Issues de Implementação — Sprint 11 — Baixas Financeiras, Movimentação de Caixa e Fechamento Diário

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-34: Realizar Baixa Financeira Manual com Parciais, Juros e Descontos

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-34.1](US-34.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows` | `sprint-11` | 🔲 Aberta |
| [US-34.2](US-34.2-criar-entidade-jpa-cashflow-em-backend-src-ma/issue.md) | Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java` | `sprint-11` | 🔲 Aberta |
| [US-34.3](US-34.3-criar-repositorio-cashflowrepository-com-quer/issue.md) | Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java` | `sprint-11` | 🔲 Aberta |
| [US-34.4](US-34.4-criar-record-settlementrequest-metodopagament/issue.md) | Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java` | `sprint-11` | 🔲 Aberta |
| [US-34.5](US-34.5-implementar-servico-settlementservice-liquida/issue.md) | Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java` | `sprint-11` | 🔲 Aberta |
| [US-34.6](US-34.6-criar-endpoint-post-api-finance-receivables-i/issue.md) | Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java` | `sprint-11` | 🔲 Aberta |
| [US-34.7](US-34.7-criar-testes-unitarios-do-settlementservicete/issue.md) | Criar testes unitários do `SettlementServiceTest` | `sprint-11` | 🔲 Aberta |
| [US-34.8](US-34.8-criar-modal-settlementmodal-no-frontend-com-c/issue.md) | Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx` | `sprint-11` | 🔲 Aberta |
| [US-34.9](US-34.9-adicionar-botao-dar-baixa-na-tabela-de-contas/issue.md) | Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`) | `sprint-11` | 🔲 Aberta |

## 📦 US-35: Acompanhar Fluxo de Caixa Diário e Mensal

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-35.1](US-35.1-criar-record-cashflowsummaryresponse-em-backe/issue.md) | Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java` | `sprint-11` | 🔲 Aberta |
| [US-35.2](US-35.2-implementar-servico-cashflowservice-obterresu/issue.md) | Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java` | `sprint-11` | 🔲 Aberta |
| [US-35.3](US-35.3-criar-endpoint-get-api-finance-cash-flow-summ/issue.md) | Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java` | `sprint-11` | 🔲 Aberta |
| [US-35.4](US-35.4-criar-componente-cashflowsummarycards-e-cashf/issue.md) | Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/` | `sprint-11` | 🔲 Aberta |
| [US-35.5](US-35.5-criar-pagina-cashflowpage-e-registrar-rota-fi/issue.md) | Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router | `sprint-11` | 🔲 Aberta |

## 📦 US-36: Emitir Relatório de Fechamento de Caixa Diário em PDF

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-36.1](US-36.1-criar-servico-dailyclosurepdfservice-gerando-/issue.md) | Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java` | `sprint-11` | 🔲 Aberta |
| [US-36.2](US-36.2-adicionar-endpoint-get-api-finance-cash-flow-/issue.md) | Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController` | `sprint-11` | 🔲 Aberta |
| [US-36.3](US-36.3-criar-teste-unitario-do-dailyclosurepdfservic/issue.md) | Criar teste unitário do `DailyClosurePdfServiceTest` | `sprint-11` | 🔲 Aberta |
| [US-36.4](US-36.4-adicionar-botao-emitir-fechamento-de-caixa-na/issue.md) | Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa | `sprint-11` | 🔲 Aberta |
| [US-36.5](US-36.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-11` | 🔲 Aberta |
| [US-36.6](US-36.6-adicionar-atalho-fluxo-de-caixa-no-menu-do-fr/issue.md) | Adicionar atalho "Fluxo de Caixa" no menu do frontend | `sprint-11` | 🔲 Aberta |
| [US-36.7](US-36.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 11 | `sprint-11` | 🔲 Aberta |


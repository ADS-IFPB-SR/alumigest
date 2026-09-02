# 📋 Lista de Tarefas (Tasks) — Sprint 11 — Baixas Financeiras, Movimentação de Caixa e Fechamento Diário

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-34: Realizar Baixa Financeira Manual com Parciais, Juros e Descontos

> **Descrição**: Permitir baixa manual de títulos com suporte a pagamentos parciais, acréscimo de juros/multa ou concessão de descontos pontuais.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-34.1** | [US-34.1](issues/US-34.1-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows` | 🔲 Pendente |
| **US-34.2** | [US-34.2](issues/US-34.2-criar-entidade-jpa-cashflow-em-backend-src-ma/issue.md) Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java` | 🔲 Pendente |
| **US-34.3** | [US-34.3](issues/US-34.3-criar-repositorio-cashflowrepository-com-quer/issue.md) Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java` | 🔲 Pendente |
| **US-34.4** | [US-34.4](issues/US-34.4-criar-record-settlementrequest-metodopagament/issue.md) Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java` | 🔲 Pendente |
| **US-34.5** | [US-34.5](issues/US-34.5-implementar-servico-settlementservice-liquida/issue.md) Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java` | 🔲 Pendente |
| **US-34.6** | [US-34.6](issues/US-34.6-criar-endpoint-post-api-finance-receivables-i/issue.md) Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java` | 🔲 Pendente |
| **US-34.7** | [US-34.7](issues/US-34.7-criar-testes-unitarios-do-settlementservicete/issue.md) Criar testes unitários do `SettlementServiceTest` | 🔲 Pendente |
| **US-34.8** | [US-34.8](issues/US-34.8-criar-modal-settlementmodal-no-frontend-com-c/issue.md) Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx` | 🔲 Pendente |
| **US-34.9** | [US-34.9](issues/US-34.9-adicionar-botao-dar-baixa-na-tabela-de-contas/issue.md) Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-34.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- [ ] **US-34.2**: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- [ ] **US-34.3**: Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- [ ] **US-34.4**: Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java`
- [ ] **US-34.5**: Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java`
- [ ] **US-34.6**: Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java`
- [ ] **US-34.7**: Criar testes unitários do `SettlementServiceTest`
- [ ] **US-34.8**: Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx`
- [ ] **US-34.9**: Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`)

---

## 📦 US-35: Acompanhar Fluxo de Caixa Diário e Mensal

> **Descrição**: Painel visual de fluxo de caixa com projeção de entradas, saídas, saldo operacional diário e consolidado mensal.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-35.1** | [US-35.1](issues/US-35.1-criar-record-cashflowsummaryresponse-em-backe/issue.md) Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java` | 🔲 Pendente |
| **US-35.2** | [US-35.2](issues/US-35.2-implementar-servico-cashflowservice-obterresu/issue.md) Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java` | 🔲 Pendente |
| **US-35.3** | [US-35.3](issues/US-35.3-criar-endpoint-get-api-finance-cash-flow-summ/issue.md) Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java` | 🔲 Pendente |
| **US-35.4** | [US-35.4](issues/US-35.4-criar-componente-cashflowsummarycards-e-cashf/issue.md) Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/` | 🔲 Pendente |
| **US-35.5** | [US-35.5](issues/US-35.5-criar-pagina-cashflowpage-e-registrar-rota-fi/issue.md) Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-35.1**: Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java`
- [ ] **US-35.2**: Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- [ ] **US-35.3**: Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`
- [ ] **US-35.4**: Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/`
- [ ] **US-35.5**: Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router

---

## 📦 US-36: Emitir Relatório de Fechamento de Caixa Diário em PDF

> **Descrição**: Emitir relatório oficial de fechamento de caixa diário em PDF com conciliação por forma de pagamento (Dinheiro, PIX, Cartão, Transferência).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-36.1** | [US-36.1](issues/US-36.1-criar-servico-dailyclosurepdfservice-gerando-/issue.md) Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java` | 🔲 Pendente |
| **US-36.2** | [US-36.2](issues/US-36.2-adicionar-endpoint-get-api-finance-cash-flow-/issue.md) Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController` | 🔲 Pendente |
| **US-36.3** | [US-36.3](issues/US-36.3-criar-teste-unitario-do-dailyclosurepdfservic/issue.md) Criar teste unitário do `DailyClosurePdfServiceTest` | 🔲 Pendente |
| **US-36.4** | [US-36.4](issues/US-36.4-adicionar-botao-emitir-fechamento-de-caixa-na/issue.md) Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa | 🔲 Pendente |
| **US-36.5** | [US-36.5](issues/US-36.5-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-36.6** | [US-36.6](issues/US-36.6-adicionar-atalho-fluxo-de-caixa-no-menu-do-fr/issue.md) Adicionar atalho "Fluxo de Caixa" no menu do frontend | 🔲 Pendente |
| **US-36.7** | [US-36.7](issues/US-36.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 11 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-36.1**: Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java`
- [ ] **US-36.2**: Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController`
- [ ] **US-36.3**: Criar teste unitário do `DailyClosurePdfServiceTest`
- [ ] **US-36.4**: Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa
- [ ] **US-36.5**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-36.6**: Adicionar atalho "Fluxo de Caixa" no menu do frontend
- [ ] **US-36.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 11


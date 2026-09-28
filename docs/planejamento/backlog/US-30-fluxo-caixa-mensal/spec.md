# Especificação Funcional: US-30 — Acompanhar Fluxo de Caixa Mensal

**Identificador**: `US-30`  
**Issue GitHub**: [#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Visão gerencial consolidada das entradas e saídas financeiras do mês da vidraçaria/serralheria.

---

## 📋 Sub-Tarefas / Issues Vinculadas (10 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-30.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows` | 🔲 No Backlog |
| [US](issues/US-30.10-documentacao-openapi-e-atalho-de-menu/issue.md) | US-30.10-documentacao-openapi-e-atalho-de-menu | 🔲 No Backlog |
| [US](issues/US-30.2-criar-entidade-jpa-cashflow-em-backend-src-ma/issue.md) | Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java` | 🔲 No Backlog |
| [US](issues/US-30.3-criar-repositorio-cashflowrepository-com-quer/issue.md) | Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java` | 🔲 No Backlog |
| [US](issues/US-30.4-criar-record-monthlycashflowresponse-em-back/issue.md) | Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java` | 🔲 No Backlog |
| [US](issues/US-30.5-implementar-servico-cashflowservice-obterresu/issue.md) | Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java` | 🔲 No Backlog |
| [US](issues/US-30.6-criar-endpoint-get-api-finance-cash-flow-month/issue.md) | Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java` | 🔲 No Backlog |
| [US](issues/US-30.7-criar-componente-monthlycashflowcards-e-grafi/issue.md) | Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/` | 🔲 No Backlog |
| [US](issues/US-30.8-criar-pagina-monthlycashflowpage-e-registrar-ro/issue.md) | Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router | 🔲 No Backlog |
| [US](issues/US-30.9-criar-testes-unitarios-do-cashflowservicetest/issue.md) | US-30.9-criar-testes-unitarios-do-cashflowservicetest | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

# Especificação Funcional: US-34 — Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

**Identificador**: `US-34`  
**Issue GitHub**: [#159](https://github.com/ADS-IFPB-SR/alumigest/issues/159)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Painel com indicadores em tempo real: ticket médio, taxa de conversão de orçamentos e faturamento mensal.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-34.1-criar-package-br-edu-ifpb-alumigest-analytics/issue.md) | Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics` | 🔲 No Backlog |
| [US](issues/US-34.2-criar-records-de-resposta-dashboardmetricsres/issue.md) | Criar records de resposta `DashboardMetricsResponse`DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/` | 🔲 No Backlog |
| [US](issues/US-34.3-criar-servico-utilitario-csvexportservice-com/issue.md) | Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java` | 🔲 No Backlog |
| [US](issues/US-34.4-implementar-servico-analyticsdashboardservice/issue.md) | Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java` | 🔲 No Backlog |
| [US](issues/US-34.5-criar-endpoint-get-api-analytics-dashboard-no/issue.md) | Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java` | 🔲 No Backlog |
| [US](issues/US-34.6-criar-testes-unitarios-do-analyticsdashboards/issue.md) | Criar testes unitários do `AnalyticsDashboardServiceTest` | 🔲 No Backlog |
| [US](issues/US-34.7-criar-interfaces-typescript-e-servico-axios-a/issue.md) | Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`) | 🔲 No Backlog |
| [US](issues/US-34.8-criar-componentes-kpicardgrid-e-salestrendcha/issue.md) | Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/` | 🔲 No Backlog |
| [US](issues/US-34.9-atualizar-pagina-inicial-dashboardpage-no-fro/issue.md) | Atualizar página inicial `DashboardPage` no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

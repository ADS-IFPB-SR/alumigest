# 📋 Issues da Sprint 13 — Relatórios Gerenciais, DRE e Dashboard

Este diretório contém todas as **21 issues** detalhadas da Sprint 13 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics`](T001-criar-package-br-edu-ifpb-alumigest-analytics/issue.md)
- [T002: Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/`](T002-criar-records-de-resposta-dashboardmetricsres/issue.md) `[P]`
- [T003: Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java`](T003-criar-servico-utilitario-csvexportservice-com/issue.md)

### Phase 2: User Story 1 - Dashboard Executivo e KPIs de Vendas (Priority: P1) 🎯 MVP

- [T004: Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java`](T004-implementar-servico-analyticsdashboardservice/issue.md) `[US1]`
- [T005: Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java`](T005-criar-endpoint-get-api-analytics-dashboard-no/issue.md) `[US1]`
- [T006: Criar testes unitários do `AnalyticsDashboardServiceTest`](T006-criar-testes-unitarios-do-analyticsdashboards/issue.md) `[P]` `[US1]`
- [T007: Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`)](T007-criar-interfaces-typescript-e-servico-axios-a/issue.md) `[P]` `[US1]`
- [T008: Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/`](T008-criar-componentes-kpicardgrid-e-salestrendcha/issue.md) `[US1]`
- [T009: Atualizar página inicial `DashboardPage` no frontend](T009-atualizar-pagina-inicial-dashboardpage-no-fro/issue.md) `[US1]`

### Phase 3: User Story 2 - DRE Simplificado (Competência vs Caixa) (Priority: P1) 🎯 MVP

- [T010: Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java`](T010-implementar-servico-drecalculationservice-cal/issue.md) `[US2]`
- [T011: Criar endpoint GET /api/analytics/dre no `AnalyticsDashboardController` com validação de permissão administrativa](T011-criar-endpoint-get-api-analytics-dre-no-analy/issue.md) `[US2]`
- [T012: Criar testes unitários do `DreCalculationServiceTest`](T012-criar-testes-unitarios-do-drecalculationservi/issue.md) `[P]` `[US2]`
- [T013: Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx`](T013-criar-componente-drereporttable-com-toggle-co/issue.md) `[US2]`
- [T014: Criar página `DrePage` e registrar rota `/gestao/dre` no React Router](T014-criar-pagina-drepage-e-registrar-rota-gestao-/issue.md) `[US2]`

### Phase 4: User Story 3 - Relatórios Gerenciais e Exportação (PDF e CSV) (Priority: P2)

- [T015: Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java`](T015-implementar-servico-analyticspdfreportservice/issue.md) `[US3]`
- [T016: Criar endpoint GET /api/analytics/reports/sales-csv e GET /api/analytics/reports/dre-pdf no `AnalyticsReportController`](T016-criar-endpoint-get-api-analytics-reports-sale/issue.md) `[US3]`
- [T017: Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`](T017-criar-testes-unitarios-de-exportacao-csvexpor/issue.md) `[P]` `[US3]`
- [T018: Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend](T018-adicionar-botoes-de-exportar-csv-e-exportar-p/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T019: Documentar endpoints no OpenAPI/Swagger](T019-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T020: Adicionar menu "Gestão & Relatórios" no frontend](T020-adicionar-menu-gestao-relatorios-no-frontend/issue.md) `[P]`
- [T021: Executar validação dos cenários de teste do `quickstart.md` da Sprint 13](T021-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

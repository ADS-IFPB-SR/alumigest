# Tasks: Sprint 13 — Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas

**Feature**: `010-relatorios-dre-dashboard`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-analytics.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Criação do package `analytics` e DTOs de projeção

- [ ] T001 Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics`
- [ ] T002 [P] Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/`
- [ ] T003 Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java`

---

## Phase 2: User Story 1 - Dashboard Executivo e KPIs de Vendas (Priority: P1) 🎯 MVP

**Goal**: Painel inicial com KPIs de faturamento, ticket médio, taxa de conversão e gráfico temporal.

**Independent Test**: Consultar endpoint do dashboard e verificar cálculo correto das métricas consolidadas.

- [ ] T004 [US1] Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java`
- [ ] T005 [US1] Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java`
- [ ] T006 [P] [US1] Criar testes unitários do `AnalyticsDashboardServiceTest`
- [ ] T007 [P] [US1] Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`)
- [ ] T008 [US1] Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/`
- [ ] T009 [US1] Atualizar página inicial `DashboardPage` no frontend

---

## Phase 3: User Story 2 - DRE Simplificado (Competência vs Caixa) (Priority: P1) 🎯 MVP

**Goal**: Demonstrativo contábil com margem de contribuição e alternância de regime.

**Independent Test**: Consultar DRE nos regimes de Competência e Caixa e validar coerência dos cálculos de lucro e custos.

- [ ] T010 [US2] Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java`
- [ ] T011 [US2] Criar endpoint GET /api/analytics/dre no `AnalyticsDashboardController` com validação de permissão administrativa
- [ ] T012 [P] [US2] Criar testes unitários do `DreCalculationServiceTest`
- [ ] T013 [US2] Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx`
- [ ] T014 [US2] Criar página `DrePage` e registrar rota `/gestao/dre` no React Router

---

## Phase 4: User Story 3 - Relatórios Gerenciais e Exportação (PDF e CSV) (Priority: P2)

**Goal**: Exportação de dados tabulares em CSV para Excel e relatório DRE em PDF via OpenPDF.

**Independent Test**: Baixar CSV e validar abertura sem erros de codificação no Excel.

- [ ] T015 [US3] Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java`
- [ ] T016 [US3] Criar endpoint GET /api/analytics/reports/sales-csv e GET /api/analytics/reports/dre-pdf no `AnalyticsReportController`
- [ ] T017 [P] [US3] Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`
- [ ] T018 [US3] Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T019 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T020 [P] Adicionar menu "Gestão & Relatórios" no frontend
- [ ] T021 Executar validação dos cenários de teste do `quickstart.md` da Sprint 13
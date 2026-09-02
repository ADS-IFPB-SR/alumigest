# 📌 Issues de Implementação — Sprint 13 — Dashboard Executivo, Indicadores (KPIs) e DRE Gerencial

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-41: Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-41.1](US-41.1-criar-package-br-edu-ifpb-alumigest-analytics/issue.md) | Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics` | `sprint-13` | 🔲 Aberta |
| [US-41.2](US-41.2-criar-records-de-resposta-dashboardmetricsres/issue.md) | Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/` | `sprint-13` | 🔲 Aberta |
| [US-41.3](US-41.3-criar-servico-utilitario-csvexportservice-com/issue.md) | Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java` | `sprint-13` | 🔲 Aberta |
| [US-41.4](US-41.4-implementar-servico-analyticsdashboardservice/issue.md) | Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java` | `sprint-13` | 🔲 Aberta |
| [US-41.5](US-41.5-criar-endpoint-get-api-analytics-dashboard-no/issue.md) | Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java` | `sprint-13` | 🔲 Aberta |
| [US-41.6](US-41.6-criar-testes-unitarios-do-analyticsdashboards/issue.md) | Criar testes unitários do `AnalyticsDashboardServiceTest` | `sprint-13` | 🔲 Aberta |
| [US-41.7](US-41.7-criar-interfaces-typescript-e-servico-axios-a/issue.md) | Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`) | `sprint-13` | 🔲 Aberta |
| [US-41.8](US-41.8-criar-componentes-kpicardgrid-e-salestrendcha/issue.md) | Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/` | `sprint-13` | 🔲 Aberta |
| [US-41.9](US-41.9-atualizar-pagina-inicial-dashboardpage-no-fro/issue.md) | Atualizar página inicial `DashboardPage` no frontend | `sprint-13` | 🔲 Aberta |

## 📦 US-42: Apurar DRE Gerencial (Competência e Caixa)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-42.1](US-42.1-implementar-servico-drecalculationservice-cal/issue.md) | Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java` | `sprint-13` | 🔲 Aberta |
| [US-42.2](US-42.2-criar-endpoint-get-api-analytics-dre-no-analy/issue.md) | Criar endpoint GET /api/analytics/dre no `AnalyticsDashboardController` com validação de permissão administrativa | `sprint-13` | 🔲 Aberta |
| [US-42.3](US-42.3-criar-testes-unitarios-do-drecalculationservi/issue.md) | Criar testes unitários do `DreCalculationServiceTest` | `sprint-13` | 🔲 Aberta |
| [US-42.4](US-42.4-criar-componente-drereporttable-com-toggle-co/issue.md) | Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx` | `sprint-13` | 🔲 Aberta |
| [US-42.5](US-42.5-criar-pagina-drepage-e-registrar-rota-gestao-/issue.md) | Criar página `DrePage` e registrar rota `/gestao/dre` no React Router | `sprint-13` | 🔲 Aberta |

## 📦 US-43: Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-43.1](US-43.1-implementar-servico-analyticspdfreportservice/issue.md) | Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java` | `sprint-13` | 🔲 Aberta |
| [US-43.2](US-43.2-criar-endpoint-get-api-analytics-reports-sale/issue.md) | Criar endpoint GET /api/analytics/reports/sales-csv e GET /api/analytics/reports/dre-pdf no `AnalyticsReportController` | `sprint-13` | 🔲 Aberta |
| [US-43.3](US-43.3-criar-testes-unitarios-de-exportacao-csvexpor/issue.md) | Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest` | `sprint-13` | 🔲 Aberta |
| [US-43.4](US-43.4-adicionar-botoes-de-exportar-csv-e-exportar-p/issue.md) | Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend | `sprint-13` | 🔲 Aberta |
| [US-43.5](US-43.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-13` | 🔲 Aberta |
| [US-43.6](US-43.6-adicionar-menu-gestao-relatorios-no-frontend/issue.md) | Adicionar menu "Gestão & Relatórios" no frontend | `sprint-13` | 🔲 Aberta |
| [US-43.7](US-43.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 13 | `sprint-13` | 🔲 Aberta |


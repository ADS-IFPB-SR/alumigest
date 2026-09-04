# 📌 Issues de Implementação — Sprint 13 — Dashboard Executivo, Indicadores (KPIs) e DRE Gerencial

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-35: Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-35.1](US-35.1-criar-package-br-edu-ifpb-alumigest-analytics/issue.md) | Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics` | `backlog` | 🔲 Aberta |
| [US-35.2](US-35.2-criar-records-de-resposta-dashboardmetricsres/issue.md) | Criar records de resposta `DashboardMetricsResponse`DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/` | `backlog` | 🔲 Aberta |
| [US-35.3](US-35.3-criar-servico-utilitario-csvexportservice-com/issue.md) | Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java` | `backlog` | 🔲 Aberta |
| [US-35.4](US-35.4-implementar-servico-analyticsdashboardservice/issue.md) | Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java` | `backlog` | 🔲 Aberta |
| [US-35.5](US-35.5-criar-endpoint-get-api-analytics-dashboard-no/issue.md) | Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java` | `backlog` | 🔲 Aberta |
| [US-35.6](US-35.6-criar-testes-unitarios-do-analyticsdashboards/issue.md) | Criar testes unitários do `AnalyticsDashboardServiceTest` | `backlog` | 🔲 Aberta |
| [US-35.7](US-35.7-criar-interfaces-typescript-e-servico-axios-a/issue.md) | Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`) | `backlog` | 🔲 Aberta |
| [US-35.8](US-35.8-criar-componentes-kpicardgrid-e-salestrendcha/issue.md) | Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/` | `backlog` | 🔲 Aberta |
| [US-35.9](US-35.9-atualizar-pagina-inicial-dashboardpage-no-fro/issue.md) | Atualizar página inicial `DashboardPage` no frontend | `backlog` | 🔲 Aberta |

## 📦 US-36: Apurar DRE Gerencial (Competência e Caixa)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-36.1](US-36.1-implementar-servico-drecalculationservice-cal/issue.md) | Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java` | `backlog` | 🔲 Aberta |
| [US-36.2](US-36.2-criar-endpoint-get-api-analytics-dre-no-analy/issue.md) | Criar endpoint GET /api/analytics/dre no `AnalyticsDashboardController` com validação de permissão administrativa | `backlog` | 🔲 Aberta |
| [US-36.3](US-36.3-criar-testes-unitarios-do-drecalculationservi/issue.md) | Criar testes unitários do `DreCalculationServiceTest` | `backlog` | 🔲 Aberta |
| [US-36.4](US-36.4-criar-componente-drereporttable-com-toggle-co/issue.md) | Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx` | `backlog` | 🔲 Aberta |
| [US-36.5](US-36.5-criar-pagina-drepage-e-registrar-rota-gestao-/issue.md) | Criar página `DrePage` e registrar rota `/gestao/dre` no React Router | `backlog` | 🔲 Aberta |

## 📦 US-37: Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-37.1](US-37.1-implementar-servico-analyticspdfreportservice/issue.md) | Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java` | `backlog` | 🔲 Aberta |
| [US-37.2](US-37.2-criar-endpoint-get-api-analytics-reports-sale/issue.md) | Criar endpoint GET /api/analytics/reports/sales-csv e GET /api/analytics/reports/dre-pdf no `AnalyticsReportController` | `backlog` | 🔲 Aberta |
| [US-37.3](US-37.3-criar-testes-unitarios-de-exportacao-csvexpor/issue.md) | Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest` | `backlog` | 🔲 Aberta |
| [US-37.4](US-37.4-adicionar-botoes-de-exportar-csv-e-exportar-p/issue.md) | Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend | `backlog` | 🔲 Aberta |
| [US-37.5](US-37.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-37.6](US-37.6-adicionar-menu-gestao-relatorios-no-frontend/issue.md) | Adicionar menu "Gestão & Relatórios" no frontend | `backlog` | 🔲 Aberta |
| [US-37.7](US-37.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 13 | `backlog` | 🔲 Aberta |


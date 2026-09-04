# Feature Specification: Sprint 13 — Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas

**Feature**: `010-relatorios-dre-dashboard`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Com todas as operações de Vendas, Fábrica, Estoque e Finanças integradas no AlumiGest, a diretoria da Alumiportas precisa de inteligência de negócios consolidada para tomada de decisões estratégicas:
1. **Dashboard Executivo em Tempo Real**: Indicadores de desempenho (KPIs) de faturamento, volume de esquadrias produzidas, taxa de conversão comercial e ticket médio.
2. **DRE Simplificado com Alternância de Regime**: Apuração contábil por Regime de Competência (data da venda) e por Regime de Caixa (data do recebimento efetivo), com controle restrito de visualização para Administradores e Diretores.
3. **Ranking de Produtos e Tipologias**: Análise dos modelos mais vendidos e mais lucrativos (ex: Linha Suprema vs Linha Gold).
4. **Relatórios Gerenciais Exportáveis**: Emissão de relatórios analíticos em PDF institucional (OpenPDF) e planilhas CSV/Excel (.xlsx).

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-35: Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

> Painel de métricas estratégicas: faturamento total, ticket médio, taxa de conversão de orçamentos, produtos mais vendidos e prazos médios de entrega.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-35.1**: Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics`
- **US-35.2**: Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/`
- **US-35.3**: Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java`
- **US-35.4**: Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java`
- **US-35.5**: Criar endpoint GET /api/analytics/dashboard no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java`
- **US-35.6**: Criar testes unitários do `AnalyticsDashboardServiceTest`
- **US-35.7**: Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`)
- **US-35.8**: Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/`
- **US-35.9**: Atualizar página inicial `DashboardPage` no frontend

### 📌 US-36: Apurar DRE Gerencial (Competência e Caixa)

> Demonstrativo de Resultados do Exercício (DRE) com receita bruta, deduções, custo de materiais (CMV), mão de obra e margem de contribuição.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-36.1**: Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java`
- **US-36.2**: Criar endpoint GET /api/analytics/dre no `AnalyticsDashboardController` com validação de permissão administrativa
- **US-36.3**: Criar testes unitários do `DreCalculationServiceTest`
- **US-36.4**: Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx`
- **US-36.5**: Criar página `DrePage` e registrar rota `/gestao/dre` no React Router

### 📌 US-37: Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel

> Exportação parametrizada de relatórios financeiros e gerenciais em PDF formatado e planilhas estruturadas CSV/Excel.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-37.1**: Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java`
- **US-37.2**: Criar endpoint GET /api/analytics/reports/sales-csv e GET /api/analytics/reports/dre-pdf no `AnalyticsReportController`
- **US-37.3**: Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`
- **US-37.4**: Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend
- **US-37.5**: Documentar endpoints no OpenAPI/Swagger
- **US-37.6**: Adicionar menu "Gestão & Relatórios" no frontend
- **US-37.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 13

## 3. Requisitos Funcionais

1. **RF01 - Agregação em Tempo Real**: Consultas analíticas sumarizadas de pedidos, orçamentos, estoque e pagamentos.
2. **RF02 - Alternância de Regime no DRE**: Suporte a cálculo por competência (`orders.created_at`) e por caixa (`payments.data_pagamento`).
3. **RF03 - Exportação Dupla (PDF e CSV)**: Geração de relatórios com OpenPDF e exportação CSV em UTF-8 com BOM.
4. **RF04 - Segurança por Papel**: Acesso ao DRE e dados de lucro bruto bloqueado para perfis não administrativos.
5. **RF05 - Gráficos Interativos**: Componentes gráficos de barra, linha e pizza com Recharts.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Regime do DRE)**: Regime de Competência com opção de alternar para Regime de Caixa.
- **Q2 (Formatos de Exportação)**: PDF formatado institucional + Planilha CSV/Excel.
- **Q3 (Controle de Acesso)**: DRE e margens de lucro visíveis apenas para Administradores e Diretores.
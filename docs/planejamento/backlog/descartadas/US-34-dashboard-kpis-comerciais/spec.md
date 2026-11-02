# Especificação Funcional: US-34 — Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

**Identificador**: `US-34`  
**Issue GitHub**: [#159](https://github.com/ADS-IFPB-SR/alumigest/issues/159)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como proprietário ou diretor comercial da Alumiportas, desejo acompanhar um painel executivo em tempo real com os principais indicadores de desempenho (KPIs) — faturamento bruto, ticket médio, taxa de conversão de orçamentos em pedidos e ranking de produtos mais vendidos —, viabilizando tomadas de decisão táticas e estratégicas fundamentadas em dados.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Apresentação dos Cards de Indicadores Principais (KPIs)**
  - **Dado que** o diretor acessa a página inicial `DashboardPage` (`/dashboard`),
  - **Quando** os dados do mês corrente são carregados via `GET /api/v1/analytics/dashboard`,
  - **Então** o grid `KpiCardGrid` exibe com precisão:
    - **Faturamento Mensal** (`totalRevenue` formatado em R$ com variação percentual vs mês anterior)
    - **Ticket Médio** (`averageTicket = totalRevenue / totalOrdersCount`)
    - **Taxa de Conversão** (`conversionRatePercentage = (convertedOrders / totalBudgets) * 100`)
    - **Novos Clientes Cadastrados** (`newClientsCount`).

- [ ] **Cenário 2: Gráfico de Tendência e Evolução de Faturamento Diário/Semanal**
  - **Dado que** existem vendas faturadas no período,
  - **Quando** o componente `SalesTrendChart` é renderizado,
  - **Então** exibe um gráfico interativo (Recharts) com a curva de evolução diária de vendas e linha comparativa com o mesmo período do mês anterior,
  - **E** tooltips ao passar o mouse revelando dia, quantidade de pedidos e valor total.

- [ ] **Cenário 3: Ranking dos Produtos e Tipologias Mais Vendidos**
  - **Dado que** foram fechados pedidos contendo esquadrias, portas e vidros,
  - **Quando** o usuário analisa o painel "Top Produtos por Receita",
  - **Então** o sistema lista as 5 tipologias/linhas líderes com nome, quantidade de unidades produzidas, receita gerada e percentual representativo sobre o total vendido.

- [ ] **Cenário 4: Filtro por Período Customizado e Recálculo Instantâneo**
  - **Dado que** o gestor deseja avaliar o desempenho de um trimestre ou mês fechado,
  - **Quando** seleciona o filtro rápido ("Últimos 30 dias", "Mês Anterior", "Ano Atual" ou data personalizada),
  - **Então** todas as métricas, gráficos e rankings são recalculados e atualizados dinamicamente sem reload da página.

- [ ] **Cenário 5: Estado Vazio Suave em Ausência de Movimentações**
  - **Dado que** o sistema é recém-instalado ou o mês selecionado não possui dados,
  - **Quando** a consulta é concluída com valores zerados,
  - **Então** o dashboard exibe ilustrações e mensagens orientativas claras ("Nenhuma venda registrada no período selecionado") com botão para criar novo orçamento.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Cálculo de Faturamento):** Apenas pedidos aprovados e faturados entram no cálculo de `totalRevenue`. Orçamentos pendentes ou pedidos cancelados são estritamente excluídos.
- **RN-02 (Precisão Monetária):** Todos os cálculos de agregação financeira e ticket médio utilizam `BigDecimal` com arredondamento `RoundingMode.HALF_UP`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades analíticas e DTOs em inglês: `DashboardMetricsResponse`, `ProductRankingItemResponse`, `totalRevenue`, `averageTicket`, `conversionRatePercentage`, `ordersCount`, `budgetsCount`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/analytics/dashboard?month=10&year=2026` (métricas consolidadas do dashboard)
- **DTOs:** `DashboardMetricsResponse`, `ProductRankingItemResponse` (records Java 21)
- **Serviço:** `AnalyticsDashboardService.java` com queries JPQL/Nativas otimizadas.

### Frontend (React 19 / Recharts / TanStack Query / Tailwind)
- **Componentes:**
  - `DashboardPage.tsx` (`/dashboard`)
  - `KpiCardGrid.tsx` (cards responsivos com ícones Lucide e badges de variação)
  - `SalesTrendChart.tsx` (gráfico de área/linha de vendas)
  - `TopProductsRankingCard.tsx` (tabela/gráfico de barras horizontais)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `AnalyticsDashboardServiceTest` validando agregação de receitas, ticket médio e taxa de conversão com tolerância zero.
- [ ] Teste de carga/desempenho da query de dashboard respondendo em menos de 200ms com volume de 5.000 pedidos.
- [ ] Validação visual e responsividade no desktop e mobile.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-34.1](issues/US-34.1-criar-package-br-edu-ifpb-alumigest-analytics/issue.md) | Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics` | 🔲 No Backlog |
| [US-34.2](issues/US-34.2-criar-records-de-resposta-dashboardmetricsres/issue.md) | Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` | 🔲 No Backlog |
| [US-34.3](issues/US-34.3-criar-servico-utilitario-csvexportservice-com/issue.md) | Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` | 🔲 No Backlog |
| [US-34.4](issues/US-34.4-implementar-servico-analyticsdashboardservice/issue.md) | Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int month, int year)` com queries de agregação | 🔲 No Backlog |
| [US-34.5](issues/US-34.5-criar-endpoint-get-api-analytics-dashboard-no/issue.md) | Criar endpoint GET `/api/v1/analytics/dashboard` no `AnalyticsDashboardController` | 🔲 No Backlog |
| [US-34.6](issues/US-34.6-criar-testes-unitarios-do-analyticsdashboards/issue.md) | Criar testes unitários do `AnalyticsDashboardServiceTest` | 🔲 No Backlog |
| [US-34.7](issues/US-34.7-criar-interfaces-typescript-e-servico-axios-a/issue.md) | Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`) | 🔲 No Backlog |
| [US-34.8](issues/US-34.8-criar-componentes-kpicardgrid-e-salestrendcha/issue.md) | Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts | 🔲 No Backlog |
| [US-34.9](issues/US-34.9-atualizar-pagina-inicial-dashboardpage-no-fro/issue.md) | Atualizar página inicial `DashboardPage` no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-34-dashboard-kpis-comerciais`

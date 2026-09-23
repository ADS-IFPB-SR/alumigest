# Feature Specification: Sprint 13 — Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas

**Feature**: `010-relatorios-dre-dashboard`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Com todas as operações de Vendas, Fábrica, Estoque e Finanças integradas no AlumiGest, a diretoria da Alumiportas precisa de inteligência de negócios consolidada para tomada de decisões estratégicas:
1. **Dashboard Executivo em Tempo Real**: Indicadores de desempenho (KPIs) de faturamento, volume de esquadrias produzidas, taxa de conversão comercial e ticket médio.
2. **DRE Simplificado com Alternância de Regime**: Apuração contábil por Regime de Competência (data da venda) e por Regime de Caixa (data do recebimento efetivo), com controle restrito de visualização para Administradores e Diretores.
3. **Ranking de Produtos e Tipologias**: Análise dos modelos mais vendidos e mais lucrativos (ex: Linha Suprema vs Linha Gold).
4. **Relatórios Gerenciais Exportáveis**: Emissão de relatórios analíticos em PDF institucional (OpenPDF) e planilhas CSV/Excel (.xlsx).

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-34: Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais

#### 🎯 Objetivo de Negócio
> **Como** diretor executivo e gestor comercial da Alumiportas,  
> **Desejo** consultar um painel de indicadores estratégicos (KPIs) em tempo real com faturamento, taxa de conversão de orçamentos, ticket médio e produtos mais vendidos,  
> **Para que** eu possa acompanhar as metas de vendas, identificar gargalos comerciais e direcionar as ações de crescimento da empresa.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta das Métricas Globais do Dashboard**
  - **Dado que** existem orçamentos e pedidos registrados para o mês de setembro de 2026
  - **Quando** o usuário acessa o Dashboard Executivo via `GET /api/analytics/dashboard?mes=9&ano=2026`
  - **Então** o sistema retorna status `200 OK` contendo o payload estruturado:
    1. `faturamentoTotal`: valor monetário total vendido no mês
    2. `ticketMedio`: valor médio por pedido de venda aprovado
    3. `taxaConversao`: percentual de orçamentos convertidos em pedidos
    4. `totalEsquadriasProduzidas`: quantidade total de unidades físicas fabricadas
    5. `prazoMedioEntregaDias`: média de dias entre a aprovação e a conclusão.

- [ ] **Cenário 2: Exibição visual dos Cards de KPIs no Frontend**
  - **Dado que** os dados analíticos foram carregados com sucesso
  - **Quando** o componente `KpiCardGrid` é renderizado na tela principal
  - **Então** ele exibe cartões com métricas em destaque, comparativo percentual em relação ao mês anterior (ex: "+12.5% vs mês anterior") e ícones representativos.

- [ ] **Cenário 3: Gráfico de Tendência e Distribuição de Vendas**
  - **Dado que** o gestor observa a seção gráfica do dashboard
  - **Quando** o componente `SalesTrendChart` é exibido
  - **Então** renderiza gráfico interativo com a evolução diária/semanal das vendas no período
  - **E** exibe tooltip informativo ao passar o cursor sobre os pontos de dados.

- [ ] **Cenário 4: Ranking dos Produtos e Tipologias mais Vendidos**
  - **Dado que** existem vendas com diferentes modelos de esquadrias
  - **Quando** o ranking de produtos é exibido
  - **Então** lista os 5 modelos com maior volume de vendas e faturamento (ex: Janela Suprema 2F, Porta Pivotante Gold, Basculante), com barra percentual de participação na receita.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Fórmula da Taxa de Conversão)**: `taxa_conversao = (pedidos_gerados / total_orcamentos_emitidos) * 100`, expressa com 1 casa decimal.
- **RN-02 (Fórmula do Ticket Médio)**: `ticket_medio = faturamento_total / total_pedidos_aprovados`, calculada em `BigDecimal` com arredondamento `HALF_EVEN`.
- **RN-03 (Performance e Cache)**: Consultas agregadas analíticas devem executar em menos de 500ms através de índices compostos em `orders(created_at, status)` e `budgets(created_at, status)`.

#### 🔌 Especificação Técnica
- **Backend**:
  - `AnalyticsDashboardService`: Agregação transacional otimizada com Spring Data JPA.
  - `AnalyticsDashboardController`: Endpoint `GET /api/analytics/dashboard`.
  - DTOs: `DashboardMetricsResponse`, `ProductRankingItemResponse`.
  - Testes com JUnit 5 cobrindo cenários com e sem histórico de vendas.
- **Frontend**:
  - `DashboardPage.tsx`: Dashboard executivo.
  - `KpiCardGrid.tsx` e `SalesTrendChart.tsx` integrando Recharts.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-34.1**: Criar package `br.edu.ifpb.alumigest.analytics` e diretório `frontend/src/features/analytics`
- **US-34.2**: Criar records de resposta `DashboardMetricsResponse`, `DreReportResponse` e `ProductRankingItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/dto/`
- **US-34.3**: Criar serviço utilitário `CsvExportService` com suporte a BOM UTF-8 e delimitador `;` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/CsvExportService.java`
- **US-34.4**: Implementar serviço `AnalyticsDashboardService.obterMetricasDashboard(int mes, int ano)` com queries de agregação em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsDashboardService.java`
- **US-34.5**: Criar endpoint `GET /api/analytics/dashboard` no `AnalyticsDashboardController` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/controller/AnalyticsDashboardController.java`
- **US-34.6**: Criar testes unitários do `AnalyticsDashboardServiceTest`
- **US-34.7**: Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`)
- **US-34.8**: Criar componentes `KpiCardGrid` e `SalesTrendChart` com Recharts em `frontend/src/features/analytics/components/`
- **US-34.9**: Atualizar página inicial `DashboardPage` no frontend

---

### 📌 US-35: Apurar DRE Gerencial (Competência e Caixa)

#### 🎯 Objetivo de Negócio
> **Como** administrador e diretor financeiro da Alumiportas,  
> **Desejo** visualizar o Demonstrativo de Resultados do Exercício (DRE) simplificado com opção de alternar entre Regime de Competência e Regime de Caixa,  
> **Para que** eu possa apurar a Receita Bruta, Custos das Matérias-Primas (CMV), Despesas Operacionais e Margem de Contribuição líquida real do negócio.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Apuração do DRE por Regime de Competência**
  - **Dado que** o gestor seleciona a visão "Regime de Competência" para o mês 09/2026
  - **Quando** o endpoint `GET /api/analytics/dre?mes=9&ano=2026&regime=COMPETENCIA` for chamado
  - **Então** o sistema apura as receitas com base na data de aprovação dos Pedidos de Venda (`orders.created_at`)
  - **E** estrutura o demonstrativo:
    - (+) Receita Operacional Bruta
    - (-) Deduções e Descontos Concedidos
    - (=) Receita Líquida
    - (-) Custo das Mercadorias Vendidas (Perfis, Vidros e Ferragens consumidos)
    - (=) Margem de Contribuição Bruta (em R$ e %)
    - (-) Despesas Fixas e Variáveis
    - (=) Resultado Operacional Líquido.

- [ ] **Cenário 2: Alternância instantânea para Regime de Caixa**
  - **Dado que** o gestor clica no botão toggle "Regime de Caixa"
  - **Quando** a consulta for reprocessada com `regime=CAIXA`
  - **Então** a apuração de receitas considera exclusivamente os pagamentos e PIX efetivamente liquidados no mês (`payments.data_pagamento`)
  - **E** as saídas consideram as despesas efetivamente pagas no período.

- [ ] **Cenário 3: Controle estrito de acesso e confidencialidade (RBAC)**
  - **Dado que** um usuário com perfil `VENDEDOR` ou `OPERADOR` tenta acessar a tela ou endpoint do DRE
  - **Quando** a requisição for interceptada pelo Spring Security
  - **Então** o sistema retorna `403 Forbidden`
  - **E** a rota `/gestao/dre` permanece oculta no menu lateral para esses perfis.

- [ ] **Cenário 4: Apresentação em tabela contábil no Frontend**
  - **Dado que** o usuário administrador acessa `/gestao/dre`
  - **Quando** o componente `DreReportTable` é renderizado
  - **Então** exibe os grupos de contas de forma expansível com percentuais verticais de análise em relação à receita líquida.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Dualidade de Regimes Contábeis)**:
  - *Competência*: Reflete o compromisso comercial assumido no mês, independente da data em que o cliente pagará as parcelas.
  - *Caixa*: Reflete a entrada e saída efetiva de dinheiro nas contas bancárias da empresa no mês de apuração.
- **RN-02 (Segurança de Dados Financeiros)**: Somente usuários com papéis `ROLE_ADMIN` e `ROLE_DIRETOR` possuem permissão para visualizar o DRE e dados de custo de aquisição de insumos.
- **RN-03 (Precisão Centesimal)**: Todas as contas do DRE fecham no centavo exato através de operações com `BigDecimal`.

#### 🔌 Especificação Técnica
- **Backend**:
  - `DreCalculationService`: Motor de cálculo das linhas contábeis segregado por regime.
  - `AnalyticsDashboardController.getDre(...)`: Anotado com `@PreAuthorize("hasAnyRole('ADMIN', 'DIRETOR')")`.
  - DTO `DreReportResponse` contendo lista estruturada de linhas e totais.
- **Frontend**:
  - `DrePage.tsx` e `DreReportTable.tsx` com tabs/toggle de regime e estilo contábil legível.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-35.1**: Implementar serviço `DreCalculationService.calcularDre(int mes, int ano, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java`
- **US-35.2**: Criar endpoint `GET /api/analytics/dre` no `AnalyticsDashboardController` com validação de permissão administrativa
- **US-35.3**: Criar testes unitários do `DreCalculationServiceTest`
- **US-35.4**: Criar componente `DreReportTable` com toggle Competência/Caixa no frontend em `frontend/src/features/analytics/components/DreReportTable.tsx`
- **US-35.5**: Criar página `DrePage` e registrar rota `/gestao/dre` no React Router

---

### 📌 US-36: Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel

#### 🎯 Objetivo de Negócio
> **Como** diretor executivo e contador da Alumiportas,  
> **Desejo** exportar relatórios de vendas, pedidos e o DRE gerencial em formatos PDF estruturado e planilha CSV/Excel (.xlsx),  
> **Para que** eu possa apresentar resultados em reuniões de diretoria, realizar conciliações fiscais com a contabilidade externa e conduzir análises customizadas em planilhas eletrônicas.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Exportação de Planilha CSV de Vendas compatível com Excel**
  - **Dado que** o gestor clica no botão "Exportar CSV" na tela de relatórios de vendas
  - **Quando** a requisição `GET /api/analytics/reports/sales-csv` for processada
  - **Então** o backend retorna arquivo com `Content-Type: text/csv; charset=UTF-8`
  - **E** o arquivo inclui Byte Order Mark UTF-8 (`\uFEFF`) e delimitador ponto-e-vírgula (`;`) para abertura perfeita no Microsoft Excel brasileiro sem desconfigurar acentuação
  - **E** contém colunas: Código, Cliente, Data, Valor Total, Desconto, Valor Líquido, Status, Forma Pagamento.

- [ ] **Cenário 2: Exportação do DRE em PDF Institucional A4**
  - **Dado que** o diretor clica em "Exportar PDF" na tela do DRE
  - **Quando** o endpoint `GET /api/analytics/reports/dre-pdf` for acionado
  - **Então** o sistema gera um PDF A4 estilizado institucionalmente via OpenPDF
  - **E** apresenta cabeçalho oficial, dados do período, tabela do DRE com linhas zebradas e campos de assinatura da diretoria.

- [ ] **Cenário 3: Proteção contra injeção de fórmulas em CSV (CSV Injection)**
  - **Dado que** algum campo textual (como nome de cliente ou observação) inicie com caracteres `=`, `+`, `-`, `@`
  - **Quando** o serviço `CsvExportService` montar as linhas do arquivo
  - **Então** o sistema sanitiza o conteúdo prefixando com apóstrofo (`'`), prevenindo execução indevida de comandos ou fórmulas no software de planilhas.

- [ ] **Cenário 4: Download direto no Frontend com feedback**
  - **Dado que** o usuário solicita o download de qualquer um dos relatórios
  - **Quando** o arquivo é recebido pelo navegador
  - **Então** o arquivo é salvo automaticamente na pasta de downloads com nome significativo (ex: `relatorio-vendas-2026-09.csv` ou `dre-gerencial-2026-09.pdf`).

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Formatação Brasileira para CSV)**: Delimitador `;` e numeração decimal com vírgula para integração transparente com o Excel em português.
- **RN-02 (Segurança de Exportação)**: Prevenção compulsória contra CSV Injection em todas as colunas de texto livre.
- **RN-03 (Imutabilidade do Relatório)**: O PDF emitido contém marca d'água de data/hora de emissão e identificação do usuário emissor para fins de auditoria.

#### 🔌 Especificação Técnica
- **Backend**:
  - `CsvExportService`: Gerador robusto de CSV com encoding UTF-8 BOM e sanitização.
  - `AnalyticsPdfReportService`: Gerador de relatórios contábeis e gerenciais via OpenPDF.
  - `AnalyticsReportController`: Endpoints de download de relatórios.
- **Frontend**:
  - Botões "Exportar CSV" e "Exportar PDF" estilizados e integrados nas páginas de relatórios e DRE.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-36.1**: Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java`
- **US-36.2**: Criar endpoint `GET /api/analytics/reports/sales-csv` e `GET /api/analytics/reports/dre-pdf` no `AnalyticsReportController`
- **US-36.3**: Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`
- **US-36.4**: Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend
- **US-36.5**: Documentar endpoints no OpenAPI/Swagger
- **US-36.6**: Adicionar menu "Gestão & Relatórios" no frontend
- **US-36.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 13

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard Executivo & KPIs | **US-34** | US-34.1 a US-34.5 | US-34.7, US-34.8, US-34.9 | US-34.6 (`AnalyticsDashboardServiceTest`) |
| DRE Gerencial | **US-35** | US-35.1, US-35.2 | US-35.4, US-35.5 | US-35.3 (`DreCalculationServiceTest`) |
| Exportação PDF e CSV | **US-36** | US-36.1, US-36.2 | US-36.4, US-36.6 | US-36.3 (`CsvExportServiceTest`, `AnalyticsPdfReportServiceTest`) |
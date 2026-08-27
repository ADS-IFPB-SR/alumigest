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

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Dashboard Executivo e KPIs de Vendas 🎯 MVP

**Como** Diretor e Vendedor da Alumiportas,
**Quero** visualizar os KPIs de faturamento, ticket médio e taxa de conversão no painel inicial,
**Para que** eu acompanhe os resultados comerciais e metas do período.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Visualização de KPIs do mês
  Dado que existem vendas registradas no mês corrente
  Quando o usuário acessa o Dashboard
  Então o sistema exibe os cards de Faturamento Líquido, Ticket Médio, Taxa de Conversão de Orçamentos (%) e Total de Esquadrias Entregues
  E o gráfico de evolução de vendas diárias
```

---

### User Story 2 (P1) — DRE Simplificado com Regime de Competência e Caixa 🎯 MVP

**Como** Diretor da Alumiportas,
**Quero** consultar o DRE do mês alternando entre regime de competência e regime de caixa,
**Para que** eu analise a margem de contribuição das vendas e o resultado financeiro líquido.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Alternar DRE para Regime de Caixa
  Dado que o diretor está na tela de DRE no modo Competência
  Quando ele seleciona a opção "Regime de Caixa"
  Então o DRE é recalculado considerando apenas os recebimentos e liquidações efetivas do período selecionado
```

---

### User Story 3 (P2) — Exportação de Relatórios em PDF e CSV/Excel

**Como** Gestor Administrativo,
**Quero** exportar a listagem de vendas e relatórios analíticos em PDF e CSV,
**Para que** eu possa cruzar dados no Excel e emitir relatórios impressos.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Exportação de Relatório de Vendas em CSV
  Dado que o usuário filtrou as vendas de um período
  Quando clica em "Exportar CSV"
  Então o sistema gera e faz o download de arquivo CSV formatado com delimitador e cabeçalhos em português
```

---

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
# Research: Sprint 13 — Relatórios Gerenciais, DRE e Dashboard

**Feature**: `010-relatorios-dre-dashboard`
**Date**: 2026-08-27

## R1: Estratégia de Agregação de Dados & Performance

### Decision: Consultas JPQL/SQL com projeções DTO diretas (sem carregar grafos inteiros de entidades)

**Rationale**:
- O cálculo de DRE e KPIs do dashboard realiza operações de `SUM`, `COUNT` e `GROUP BY` sobre as tabelas `orders`, `order_items`, `payments` e `stock_movements`.
- O uso de DTO projections no Spring Data JPA evita problemas de N+1 e memória.

## R2: Geração de CSV e PDF de Relatórios

### Decision: OpenPDF para relatórios visuais paginados e `StringWriter` com delimitador `;` e BOM UTF-8 para CSV

**Rationale**:
- O CSV com BOM UTF-8 abre nativamente no Excel sem desconfigurar acentuação em português (`é`, `ã`, `ç`).
- OpenPDF garante relatórios limpos com cabeçalho institucional Alumiportas.

## R3: Frontend Analytics

### Decision: Biblioteca `Recharts` para gráficos de evolução temporal (linhas) e distribuição de faturamento (rosca/barras)

**Rationale**:
- Totalmente compatível com React 19, responsiva e performática.
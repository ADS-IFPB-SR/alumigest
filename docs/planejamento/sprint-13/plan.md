# Implementation Plan: Sprint 13 — Relatórios Gerenciais, DRE e Dashboard

**Branch**: `010-relatorios-dre-dashboard` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-relatorios-dre-dashboard/spec.md`

## Summary

Implementar o módulo de Business Intelligence com Dashboard executivo de KPIs, DRE Simplificado com alternância de regime contábil (Competência vs Caixa), ranking de produtos e exportação de relatórios em PDF (OpenPDF) e CSV com formatação para Excel.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, OpenPDF 2.0.3
- Frontend: React 19, Recharts (gráficos de linha, barra e rosca), Lucide React, Tailwind CSS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `analytics` completo |
| I. DTOs em Records Java | ✅ PASS | `DashboardMetricsResponse`, `DreReportResponse`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do calculador de DRE e agregadores |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/analytics/
├── controller/
│   ├── AnalyticsDashboardController.java       # Endpoints de KPIs e DRE
│   └── AnalyticsReportController.java          # Endpoints de exportação PDF/CSV
├── service/
│   ├── AnalyticsDashboardService.java          # Agregação de KPIs e conversão
│   ├── DreCalculationService.java              # Lógica contábil do DRE
│   ├── CsvExportService.java                   # Gerador de CSV UTF-8
│   └── AnalyticsPdfReportService.java          # Geração do DRE em PDF
└── dto/
    ├── DashboardMetricsResponse.java
    ├── DreReportResponse.java
    └── ProductRankingItemResponse.java
```

### Frontend

```text
frontend/src/features/analytics/
├── components/
│   ├── KpiCardGrid.tsx                         # Cards com faturamento, ticket médio e conversão
│   ├── SalesTrendChart.tsx                     # Gráfico de evolução temporal
│   ├── DreReportTable.tsx                      # Tabela estruturada de DRE com toggle
│   └── ProductRankingChart.tsx                 # Gráfico de barras de produtos mais vendidos
└── pages/
    ├── DashboardPage.tsx                       # Dashboard executivo principal
    └── DrePage.tsx                             # Página dedicada do DRE
```
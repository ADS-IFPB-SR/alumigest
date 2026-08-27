# Implementation Plan: Sprint 11 — Baixa de Pagamentos e Fluxo de Caixa

**Branch**: `008-baixa-pagamentos-fluxo-caixa` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-baixa-pagamentos-fluxo-caixa/spec.md`

## Summary

Implementar a liquidação manual multi-método de títulos a receber (com suporte a pagamento parcial, descontos e juros), conciliação com pagamentos e lançamentos no fluxo de caixa diário/mensal, além da emissão do relatório consolidado de Fechamento de Caixa em PDF via OpenPDF.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, OpenPDF 2.0.3
- Frontend: React 19, TanStack Query, Recharts (gráficos de fluxo de caixa), Tailwind CSS

**Storage**: PostgreSQL 16+ (Migration `V14__create_cash_flows_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `finance.settlement` e `finance.cashflow` |
| I. DTOs em Records Java | ✅ PASS | `SettlementRequest`, `CashFlowSummaryResponse` |
| II. Test-First | ✅ PASS | Testes unitários do serviço de liquidação e relatórios |
| III. @Transactional atômico | ✅ PASS | Atualização síncrona de título, pagamento e caixa |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/finance/
├── controller/
│   ├── SettlementController.java               # Endpoints de baixa manual
│   └── CashFlowController.java                 # Endpoints de fluxo de caixa e fechamento
├── service/
│   ├── SettlementService.java                  # Lógica transacional de quitação e rateio
│   ├── CashFlowService.java                    # Agregações de entradas/saídas e previsões
│   └── DailyClosurePdfService.java             # Geração do relatório de fechamento em PDF
├── repository/
│   └── CashFlowRepository.java
├── domain/
│   └── CashFlow.java                           # @Entity Lançamento de Caixa
├── dto/
│   ├── SettlementRequest.java
│   └── CashFlowSummaryResponse.java
└── mapper/
    └── CashFlowMapper.java
```

### Frontend

```text
frontend/src/features/finance/
├── components/
│   ├── SettlementModal.tsx                     # Modal de baixa com seleção de método e descontos
│   ├── CashFlowSummaryCards.tsx                # Cards de totais do dia
│   └── CashFlowProjectionChart.tsx             # Gráfico de projeção com Recharts
└── pages/
    └── CashFlowPage.tsx                        # Painel principal de Fluxo de Caixa
```
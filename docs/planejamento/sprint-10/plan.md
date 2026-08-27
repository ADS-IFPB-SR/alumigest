# Implementation Plan: Sprint 10 — Contas a Receber e Parcelamento

**Branch**: `007-contas-receber-parcelamento` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-contas-receber-parcelamento/spec.md`

## Summary

Implementar a geração automática e edição flexível do plano de contas a receber por pedido (`AccountReceivable`), divisão com centavos residuais na 1ª parcela, acompanhamento de títulos a vencer/vencidos, extrato financeiro do cliente e emissão de recibos em PDF via OpenPDF.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, OpenPDF 2.0.3
- Frontend: React 19, TanStack Query, React Hook Form, Zod, Tailwind CSS

**Storage**: PostgreSQL 16+ (Migration `V13__create_account_receivables_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `finance.receivables` completo |
| I. DTOs em Records Java | ✅ PASS | `AccountReceivableResponse`, `InstallmentPlanCustomRequest`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do calculador de rateio e testes de PDF |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/finance/
├── controller/
│   └── AccountReceivableController.java        # REST endpoints (/api/finance/receivables)
├── service/
│   ├── AccountReceivableService.java           # Lógica de desdobramento, ajuste e vencimentos
│   ├── InstallmentCalculator.java              # Algoritmo de rateio com resto na 1ª parcela
│   └── ReceiptPdfService.java                  # Geração de recibos em PDF
├── repository/
│   └── AccountReceivableRepository.java
├── domain/
│   ├── AccountReceivable.java                  # @Entity Título a Receber
│   ├── ReceivableStatus.java                   # Enum status
│   └── InstallmentType.java                    # Enum tipo de parcela
├── dto/
│   ├── AccountReceivableResponse.java
│   ├── InstallmentPlanCustomRequest.java
│   └── ClientFinancialStatementResponse.java
└── mapper/
    └── AccountReceivableMapper.java
```

### Frontend

```text
frontend/src/features/finance/
├── components/
│   ├── ReceivablesTable.tsx                    # Tabela com filtros e badges de vencimento
│   ├── InstallmentEditorModal.tsx              # Modal de ajuste de parcelas
│   └── ClientFinancialStatementCard.tsx        # Resumo de saldo devedor do cliente
├── services/
│   └── receivablesApi.ts                       # Chamadas Axios
└── pages/
    └── ReceivablesPage.tsx                     # Página principal de Contas a Receber
```
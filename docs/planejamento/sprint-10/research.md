# Research: Sprint 10 — Contas a Receber e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Date**: 2026-08-27

## R1: Aritmética de Divisão de Parcelas com BigDecimal

### Decision: Algoritmo de rateio proporcional com resto na 1ª parcela

**Rationale**:
- Para $N$ parcelas, `valorParcela = total.divide(N, 2, RoundingMode.FLOOR)`.
- `resto = total.subtract(valorParcela.multiply(N))`.
- 1ª parcela recebe `valorParcela.add(resto)` e as restantes recebem `valorParcela`.
- Garante 100% de precisão matemática sem perda de frações de centavo.

## R2: Nova Migration Flyway

### Decision: `V13__create_account_receivables_schema.sql`

**Rationale**:
- Cria a tabela `account_receivables` com FK para `orders`, `clients` e `payments`.
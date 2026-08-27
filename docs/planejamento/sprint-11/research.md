# Research: Sprint 11 — Baixa de Pagamentos e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Date**: 2026-08-27

## R1: Transação Atômica de Baixa

### Decision: `@Transactional` orquestrando atualização do título `AccountReceivable`, criação do registro em `Payment` e lançamento no `CashFlow`

**Rationale**:
- A liquidação é uma operação crítica. Se o pagamento for gravado, o título e o fluxo de caixa devem ser atualizados no mesmo commit de banco.
- O recálculo do status financeiro do pedido pai ocorre automaticamente após a baixa.

## R2: Nova Migration Flyway

### Decision: `V14__create_cash_flows_schema.sql`

**Rationale**:
- Cria a tabela `cash_flows` e enums associados.
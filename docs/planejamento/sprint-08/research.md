# Research: Sprint 8 — Estoque, Perdas e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Date**: 2026-08-27

## R1: Modelagem de Estoque e Movimentações

### Decision: Tabelas `stock_items` (saldos atuais) e `stock_movements` (Kardex append-only)

**Rationale**:
- `stock_items` mantém o saldo físico, quantidade reservada e estoque mínimo por material (`material_id`).
- `stock_movements` registra o histórico transacional completo (tipo, quantidade, saldo anterior, saldo posterior, operador, documento de origem).
- Permite conciliação precisa e auditoria sem recálculo pesado de histórico.

## R2: Nova Migration Flyway

### Decision: `V11__create_stock_schema.sql`

**Rationale**:
- Sequencial após `V10__create_production_orders_schema.sql`.
- Cria as tabelas `stock_items`, `stock_movements` e `scrap_records`.

## R3: Transações Atômicas e Concorrência

### Decision: Uso de `@Transactional` e Pessimistic/Optimistic Locking para mutação de saldos de estoque

**Rationale**:
- Evita concorrência e condições de corrida durante a liberação simultânea de múltiplos pedidos ou baixas em lote.
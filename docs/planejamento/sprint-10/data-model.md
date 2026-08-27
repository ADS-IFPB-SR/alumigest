# Data Model: Sprint 10 — Contas a Receber e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Date**: 2026-08-27

## Entities

### AccountReceivable (Título a Receber)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `codigo_titulo` | `VARCHAR(30)` | NOT NULL | UNIQUE | Código do título (ex: `TIT-2026-0001-01`) |
| `order_id` | `BIGINT` | NOT NULL | FK → `orders(id)` | Pedido associado |
| `cliente_id` | `BIGINT` | NULL | FK → `clientes(id)` | Cliente |
| `cliente_nome` | `VARCHAR(200)` | NOT NULL | — | Nome do cliente |
| `numero_parcela` | `INTEGER` | NOT NULL | — | Parcela (ex: 1) |
| `total_parcelas` | `INTEGER` | NOT NULL | — | Total (ex: 2) |
| `tipo_parcela` | `VARCHAR(30)` | NOT NULL | — | Enum: ENTRADA_SINAL, SALDO_FINAL, PARCELA_MENSAL |
| `valor_original` | `NUMERIC(12,2)` | NOT NULL | CHECK > 0 | Valor nominal da parcela |
| `valor_pago` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Total liquidado |
| `data_vencimento` | `DATE` | NOT NULL | — | Vencimento acordado |
| `data_pagamento` | `TIMESTAMP` | NULL | — | Data da quitação |
| `status` | `VARCHAR(25)` | NOT NULL | DEFAULT 'A_VENCER' | Enum: A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO |
| `payment_id` | `BIGINT` | NULL | FK → `payments(id)` | Pagamento que liquidou o título |
| `observacoes` | `TEXT` | NULL | — | Observações |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |

**Índices**:
- `idx_receivables_order_id` ON `order_id`
- `idx_receivables_status` ON `status`
- `idx_receivables_data_vencimento` ON `data_vencimento`
- `idx_receivables_cliente_id` ON `cliente_id`
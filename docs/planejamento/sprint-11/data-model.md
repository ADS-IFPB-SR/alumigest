# Data Model: Sprint 11 — Baixa de Pagamentos e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Date**: 2026-08-27

## Entities

### CashFlow (Lançamento no Fluxo de Caixa)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `tipo_movimento` | `VARCHAR(20)` | NOT NULL | — | Enum: ENTRADA, SAIDA |
| `categoria` | `VARCHAR(50)` | NOT NULL | — | Ex: RECEBIMENTO_CLIENTE, COMPRA_MATERIAL |
| `metodo_pagamento` | `VARCHAR(30)` | NOT NULL | — | Enum: DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO, BOLETO, TRANSFERENCIA |
| `valor` | `NUMERIC(12,2)` | NOT NULL | CHECK > 0 | Valor monetário recebido |
| `data_movimento` | `DATE` | NOT NULL | DEFAULT CURRENT_DATE | Data contábil |
| `payment_id` | `BIGINT` | NULL | FK → `payments(id)` | Pagamento associado |
| `account_receivable_id` | `BIGINT` | NULL | FK → `account_receivables(id)` | Título liquidado |
| `operador_nome` | `VARCHAR(100)` | NOT NULL | — | Operador que realizou a baixa |
| `observacoes` | `TEXT` | NULL | — | Detalhes |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data e hora exata |

**Índices**:
- `idx_cash_flows_data_movimento` ON `data_movimento`
- `idx_cash_flows_metodo_pagamento` ON `metodo_pagamento`
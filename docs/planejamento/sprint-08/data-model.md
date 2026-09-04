# Data Model: Sprint 8 — Estoque, Perdas e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Date**: 2026-08-27

## Entities

### StockItem (Item de Estoque)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `material_id` | `BIGINT` | NOT NULL | UNIQUE, FK → `materials(id)` | Material do catálogo |
| `saldo_fisico` | `NUMERIC(12,3)` | NOT NULL | DEFAULT 0.000 | Quantidade física no almoxarifado |
| `quantidade_reservada` | `NUMERIC(12,3)` | NOT NULL | DEFAULT 0.000 | Quantidade reservada em OPs |
| `estoque_minimo` | `NUMERIC(12,3)` | NOT NULL | DEFAULT 0.000 | Ponto de reposição |
| `localizacao` | `VARCHAR(100)` | NULL | — | Prateleira/vão na fábrica |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |

**Índices**:
- `idx_stock_items_material_id` UNIQUE ON `material_id`

---

### StockMovement (Movimentação de Estoque / Kardex)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `stock_item_id` | `BIGINT` | NOT NULL | FK → `stock_items(id)` | Item de estoque |
| `tipo` | `VARCHAR(30)` | NOT NULL | — | Enum: ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA |
| `quantidade` | `NUMERIC(12,3)` | NOT NULL | — | Quantidade movimentada |
| `saldo_anterior` | `NUMERIC(12,3)` | NOT NULL | — | Saldo antes |
| `saldo_posterior`| `NUMERIC(12,3)` | NOT NULL | — | Saldo depois |
| `documento_origem` | `VARCHAR(50)` | NULL | — | Código do Pedido/OP ou NF |
| `operador_nome` | `VARCHAR(100)` | NOT NULL | — | Responsável |
| `motivo` | `TEXT` | NULL | — | Justificativa |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data e hora exata |

---

### ScrapRecord (Registro de Perda & Sucata)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `stock_item_id` | `BIGINT` | NOT NULL | FK → `stock_items(id)` | Material descartado |
| `order_id` | `BIGINT` | NULL | FK → `orders(id)` | Pedido associado (opcional) |
| `quantidade` | `NUMERIC(12,3)` | NOT NULL | CHECK > 0 | Quantidade perdida |
| `motivo` | `VARCHAR(40)` | NOT NULL | — | Enum: QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS |
| `operador_nome` | `VARCHAR(100)` | NOT NULL | — | Operador que registrou |
| `observacoes` | `TEXT` | NULL | — | Detalhes da ocorrência |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data do registro |

---

## Enums

### StockMovementType
```
ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA
```

### ScrapReason
```
QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS
```
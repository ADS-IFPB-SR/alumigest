# Data Model: Sprint 6 — Ordens de Produção (OP) e Etiquetas QR Code

**Feature**: `003-ordens-producao-qrcode`
**Date**: 2026-08-27

## Entities

### ProductionOrder (Ordem de Produção)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `codigo` | `VARCHAR(35)` | NOT NULL | UNIQUE | Código formatado (ex: `OP-2026-0001-01`) |
| `order_id` | `BIGINT` | NOT NULL | FK → `orders(id)` | Pedido de Venda pai |
| `order_item_id` | `BIGINT` | NOT NULL | FK → `order_items(id)` | Item do pedido de referência |
| `numero_peca` | `INTEGER` | NOT NULL | — | Índice da peça (ex: 1) |
| `total_pecas_item` | `INTEGER` | NOT NULL | — | Total de peças do item (ex: 2) |
| `cliente_nome` | `VARCHAR(200)` | NOT NULL | — | Nome do cliente (desnormalizado) |
| `descricao_peca` | `VARCHAR(300)` | NOT NULL | — | Descrição do produto congelada |
| `largura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Largura nominal em mm |
| `altura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Altura nominal em mm |
| `cor_aluminio` | `VARCHAR(50)` | NULL | — | Acabamento do perfil |
| `tipo_vidro` | `VARCHAR(100)` | NULL | — | Vidro/espessura |
| `orientacao_abertura`| `VARCHAR(30)` | NULL | — | Lado/modo de abertura |
| `ferragens` | `TEXT` | NULL | — | Relação de ferragens |
| `status` | `VARCHAR(30)` | NOT NULL | DEFAULT 'AGUARDANDO_CORTE' | Enum: AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO |
| `operador_atual` | `VARCHAR(100)`| NULL | — | Último operador que movimentou a peça |
| `data_previsao_entrega` | `DATE` | NOT NULL | — | Prazo prometido |
| `observacoes` | `TEXT` | NULL | — | Observações da oficina |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `ativo` | `BOOLEAN` | NOT NULL | DEFAULT TRUE | Soft delete |

**Índices**:
- `idx_production_orders_codigo` UNIQUE ON `codigo`
- `idx_production_orders_order_id` ON `order_id`
- `idx_production_orders_status` ON `status`

---

### ProductionOrderHistory (Histórico de Movimentação)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `production_order_id` | `BIGINT` | NOT NULL | FK → `production_orders(id)` ON DELETE CASCADE | OP associada |
| `status_anterior` | `VARCHAR(30)` | NULL | — | Status prévio |
| `status_novo` | `VARCHAR(30)` | NOT NULL | — | Novo status assumido |
| `operador_nome` | `VARCHAR(100)` | NOT NULL | — | Operador que realizou a transição |
| `observacao` | `TEXT` | NULL | — | Observações ou motivos |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data e hora exata da bipagem |

---

## Enums

### ProductionOrderStatus
```
AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO
```
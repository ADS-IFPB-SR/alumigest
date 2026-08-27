# Data Model: Sprint 9 — Pagamento e Cobrança via PIX

**Feature**: `006-pagamento-cobranca-pix`
**Date**: 2026-08-27

## Entities

### Payment (Pagamento Geral)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `order_id` | `BIGINT` | NOT NULL | FK → `orders(id)` | Pedido associado |
| `tipo_pagamento` | `VARCHAR(30)` | NOT NULL | — | Enum: ENTRADA_SINAL, SALDO_FINAL, PARCELA, LIQUIDACAO_TOTAL |
| `metodo_pagamento` | `VARCHAR(30)` | NOT NULL | — | Enum: PIX, DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, BOLETO |
| `valor` | `NUMERIC(12,2)` | NOT NULL | CHECK > 0 | Valor em R$ |
| `status` | `VARCHAR(25)` | NOT NULL | DEFAULT 'PENDENTE' | Enum: PENDENTE, CONFIRMADO, CANCELADO, ESTORNADO |
| `data_vencimento` | `DATE` | NOT NULL | — | Data prevista |
| `data_pagamento` | `TIMESTAMP` | NULL | — | Data/hora da quitação |
| `observacoes` | `TEXT` | NULL | — | Detalhes |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |

---

### PixTransaction (Transação PIX Dinâmica)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `payment_id` | `BIGINT` | NOT NULL | FK → `payments(id)` | Pagamento vinculado |
| `txid` | `VARCHAR(100)` | NOT NULL | UNIQUE | Identificador único da transação PIX |
| `e2eid` | `VARCHAR(100)` | NULL | — | End-to-End ID bancário retornado no pagamento |
| `payload_copia_cola` | `TEXT` | NOT NULL | — | Código Copia e Cola EMV |
| `qr_code_base64` | `TEXT` | NOT NULL | — | Imagem do QR Code em Base64 PNG |
| `valor` | `NUMERIC(12,2)` | NOT NULL | — | Valor da cobrança |
| `status` | `VARCHAR(30)` | NOT NULL | DEFAULT 'AGUARDANDO_PAGAMENTO' | Enum: AGUARDANDO_PAGAMENTO, PAGO, EXPIRADO, CANCELADO |
| `data_expiracao` | `TIMESTAMP` | NOT NULL | — | Validade (24h após criação) |
| `data_liquidacao` | `TIMESTAMP` | NULL | — | Data e hora em que caiu na conta |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data de geração |

**Índices**:
- `idx_pix_txid` UNIQUE ON `txid`
- `idx_pix_payment_id` ON `payment_id`
- `idx_pix_status` ON `status`
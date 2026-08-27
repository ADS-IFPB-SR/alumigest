# Data Model: Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Date**: 2026-08-27

## Entities

### Order (Pedido de Venda)

Entidade principal do módulo de vendas e produção. Armazena os dados do contrato de venda oficial.

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador auto-gerado |
| `codigo` | `VARCHAR(20)` | NOT NULL | UNIQUE | Código sequencial (ex: `PED-2026-0001`) |
| `orcamento_id` | `BIGINT` | NOT NULL | UNIQUE, FK → `budgets(id)` | Orçamento de origem |
| `cliente_id` | `BIGINT` | NULL | FK → `clientes(id)` | Cliente associado |
| `cliente_nome` | `VARCHAR(200)` | NOT NULL | — | Nome do cliente (desnormalizado) |
| `cliente_telefone` | `VARCHAR(20)` | NULL | — | Telefone (desnormalizado) |
| `cliente_endereco` | `TEXT` | NULL | — | Endereço completo (desnormalizado) |
| `status` | `VARCHAR(25)` | NOT NULL | DEFAULT 'AGUARDANDO_PRODUCAO' | Enum: CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO |
| `canal_aprovacao` | `VARCHAR(20)` | NOT NULL | — | Enum: WHATSAPP, PRESENCIAL, TELEFONE, EMAIL |
| `data_aprovacao` | `DATE` | NOT NULL | DEFAULT CURRENT_DATE | Data da aprovação formal |
| `data_previsao_entrega` | `DATE` | NOT NULL | — | Data prevista de entrega acordada |
| `data_conclusao` | `DATE` | NULL | — | Data em que a produção/entrega foi concluída |
| `valor_bruto` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Snapshot da soma dos itens |
| `valor_desconto` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot do desconto concedido |
| `taxa_instalacao` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot da taxa de instalação |
| `taxa_frete` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot da taxa de frete |
| `valor_liquido` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Snapshot do valor líquido total a pagar |
| `condicao_pagamento` | `VARCHAR(30)` | NULL | — | Snapshot da condição de pagamento |
| `observacoes_pagamento` | `TEXT` | NULL | — | Snapshot das observações de pagamento |
| `observacoes` | `TEXT` | NULL | — | Observações gerais do pedido |
| `justificativa_cancelamento`| `TEXT` | NULL | — | Justificativa obrigatória se cancelado |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `ativo` | `BOOLEAN` | NOT NULL | DEFAULT TRUE | Soft delete |

**Índices**:
- `idx_orders_codigo` UNIQUE ON `codigo`
- `idx_orders_orcamento_id` UNIQUE ON `orcamento_id`
- `idx_orders_status` ON `status`
- `idx_orders_data_previsao_entrega` ON `data_previsao_entrega`

---

### OrderItem (Item do Pedido de Venda — Snapshot Imutável)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador auto-gerado |
| `order_id` | `BIGINT` | NOT NULL | FK → `orders(id)` ON DELETE CASCADE | Pedido pai |
| `product_id` | `BIGINT` | NULL | FK → `products(id)` | Referência ao catálogo (opcional) |
| `descricao` | `VARCHAR(300)` | NOT NULL | — | Descrição do produto congelada |
| `largura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Largura congelada |
| `altura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Altura congelada |
| `quantidade` | `INTEGER` | NOT NULL | CHECK > 0 | Quantidade congelada |
| `cor_aluminio` | `VARCHAR(50)` | NULL | — | Cor do perfil congelada |
| `tipo_vidro` | `VARCHAR(100)` | NULL | — | Vidro/espessura congelado |
| `orientacao_abertura` | `VARCHAR(30)` | NULL | — | Sentido de abertura congelado |
| `ferragens` | `TEXT` | NULL | — | Ferragens congeladas |
| `valor_unitario` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Preço unitário congelado |
| `valor_total` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Preço total congelado |
| `ordem` | `INTEGER` | NOT NULL | DEFAULT 0 | Ordem no pedido |

---

## Enums

### OrderStatus
```
CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO
```

### ApprovalChannel
```
WHATSAPP, PRESENCIAL, TELEFONE, EMAIL
```
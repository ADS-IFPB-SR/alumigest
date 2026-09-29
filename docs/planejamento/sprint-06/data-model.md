# Data Model: Sprint 6 — Pedidos de Venda e Snapshot Imutável (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`  
**Período da Sprint 06**: 29/09/2026 a 12/10/2026  
**Status**: APPROVED  
**Migration**: `V19__create_orders_schema.sql` (última existente: V18)

## Entidades Principais

### Order (Pedido de Venda)

Entidade central do módulo comercial formalizado e produção fabril. Armazena os dados do contrato de venda oficial e o estado de avanço na esteira da fábrica.

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NOT NULL | PK, DEFAULT uuid_generate_v4() | Identificador auto-gerado |
| `codigo` | `VARCHAR(20)` | NOT NULL | UNIQUE | Código sequencial anual (ex: `PED-2026-0001`) |
| `orcamento_id` | `UUID` | NOT NULL | UNIQUE, FK → `tb_budgets(id)` | Orçamento de origem (Invariante 1-para-1) |
| `cliente_id` | `UUID` | NULL | FK → `tb_clients(id)` | Cliente associado |
| `cliente_nome` | `VARCHAR(200)` | NOT NULL | — | Nome do cliente (desnormalizado / snapshot) |
| `cliente_telefone` | `VARCHAR(20)` | NULL | — | Telefone (desnormalizado) |
| `cliente_endereco` | `TEXT` | NULL | — | Endereço completo de entrega |
| `status` | `VARCHAR(25)` | NOT NULL | DEFAULT 'AGUARDANDO_PRODUCAO' | Enum: `CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELADO` |
| `canal_aprovacao` | `VARCHAR(20)` | NOT NULL | — | Enum: `WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL` |
| `data_aprovacao` | `DATE` | NOT NULL | DEFAULT CURRENT_DATE | Data da aprovação formal do cliente |
| `data_previsao_entrega` | `DATE` | NOT NULL | — | Data prevista de entrega (+15 dias corridos padrão) |
| `data_conclusao` | `DATE` | NULL | — | Preenchida automaticamente ao atingir `CONCLUIDO` |
| `valor_bruto` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Snapshot da soma dos itens |
| `valor_desconto` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot do desconto concedido |
| `taxa_instalacao` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot da taxa de instalação |
| `taxa_frete` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Snapshot da taxa de frete |
| `valor_liquido` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Snapshot do valor líquido total a pagar |
| `condicao_pagamento` | `VARCHAR(30)` | NULL | — | Snapshot da condição de pagamento comercial |
| `observacoes_pagamento` | `TEXT` | NULL | — | Snapshot das observações de pagamento |
| `observacoes` | `TEXT` | NULL | — | Observações gerais do pedido |
| `justificativa_cancelamento`| `TEXT` | NULL | — | Justificativa formal ($\ge 10$ caracteres) se cancelado |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Timestamp de criação |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Timestamp de atualização |
| `ativo` | `BOOLEAN` | NOT NULL | DEFAULT TRUE | Soft delete |

**Índices e Constraints**:
- `idx_orders_codigo` UNIQUE ON `codigo`
- `idx_orders_orcamento_id` UNIQUE ON `orcamento_id`
- `idx_orders_status` ON `status`
- `idx_orders_data_previsao_entrega` ON `data_previsao_entrega`

---

### OrderItem (Item do Pedido de Venda — Snapshot Imutável)

Representa cada exemplar físico de esquadria ou item contratado com todos os parâmetros técnicos e comerciais congelados no momento da aprovação do pedido.

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NOT NULL | PK, DEFAULT uuid_generate_v4() | Identificador auto-gerado |
| `order_id` | `UUID` | NOT NULL | FK → `tb_orders(id)` ON DELETE CASCADE | Pedido pai |
| `product_id` | `UUID` | NULL | FK → `tb_products(id)` | Referência ao catálogo de templates (opcional) |
| `descricao` | `VARCHAR(300)` | NOT NULL | — | Descrição do modelo congelada |
| `largura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Largura nominal em mm congelada |
| `altura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Altura nominal em mm congelada |
| `quantidade` | `INTEGER` | NOT NULL | CHECK > 0 | Quantidade de peças contratadas |
| `cor_aluminio` | `VARCHAR(50)` | NULL | — | Cor e acabamento dos perfis |
| `tipo_vidro` | `VARCHAR(100)` | NULL | — | Especificação e espessura do vidro |
| `orientacao_abertura` | `VARCHAR(30)` | NULL | — | Sentido/orientação construtiva |
| `ferragens` | `TEXT` | NULL | — | Componentes e acessórios vinculados |
| `valor_unitario` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Preço unitário congelado |
| `valor_total` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Preço total ($qtd \times unitario$) congelado |
| `template_config` | `JSONB` | NULL | — | Snapshot da configuração do template (clonado de `BudgetItem`) |
| `handle_config` | `JSONB` | NULL | — | Snapshot da configuração do puxador (clonado de `BudgetItem`) |
| `drilling_config` | `JSONB` | NULL | — | Snapshot da configuração de furação (clonado de `BudgetItem`) |
| `ordem` | `INTEGER` | NOT NULL | DEFAULT 0 | Sequência de exibição na proposta |

---

## Enums

### OrderStatus
```java
public enum OrderStatus {
    CRIADO,
    AGUARDANDO_PRODUCAO,
    EM_PRODUCAO,
    CONCLUIDO,
    CANCELADO
}
```

### ApprovalChannel
```java
public enum ApprovalChannel {
    WHATSAPP("WhatsApp"),
    PRESENCIAL("Presencial"),
    TELEFONE("Telefone"),
    EMAIL("E-mail");

    private final String label;
}
```

---

## Máquina de Estados e Transições

```text
       [Orçamento Aprovado]
                │
                ▼
            [CRIADO]
                │
                ▼
      [AGUARDANDO_PRODUCAO] ────▶ [CANCELADO] (com justificativa)
                │                      ▲
                ▼                      │ (bloqueado se em corte)
          [EM_PRODUCAO] ───────────────┘
                │
                ▼
           [CONCLUIDO]
```
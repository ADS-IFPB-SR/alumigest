# Data Model: Sprint 4 — Descontos, PDF e Homologação R1

**Feature**: `001-orcamento-descontos-pdf`
**Date**: 2026-08-27

## Entities

### Budget (Orçamento)

Entidade principal do módulo de orçamentos. Armazena os dados comerciais, financeiros e de rastreabilidade.

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador auto-gerado |
| `codigo` | `VARCHAR(20)` | NOT NULL | UNIQUE | Código sequencial legível (ex: `ORC-2026-0001`) |
| `cliente_id` | `BIGINT` | NULL | FK → `clientes(id)` | Cliente associado (nullable para rascunhos iniciais) |
| `cliente_nome` | `VARCHAR(200)` | NULL | — | Nome/razão social para exibição rápida (desnormilizado) |
| `cliente_telefone` | `VARCHAR(20)` | NULL | — | Telefone do cliente (desnormilizado) |
| `cliente_endereco` | `TEXT` | NULL | — | Endereço completo (desnormilizado) |
| `status` | `VARCHAR(20)` | NOT NULL | DEFAULT 'RASCUNHO' | Enum: RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO |
| `valor_bruto` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Soma dos valores dos itens |
| `tipo_desconto` | `VARCHAR(15)` | NULL | — | Enum: PERCENTUAL, VALOR_FIXO |
| `percentual_desconto` | `NUMERIC(5,2)` | NULL | CHECK >= 0 AND <= 100 | Percentual de desconto aplicado |
| `valor_desconto` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Valor absoluto do desconto em R$ |
| `taxa_instalacao` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Taxa de instalação adicional |
| `taxa_frete` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | Taxa de frete/transporte |
| `valor_liquido` | `NUMERIC(12,2)` | NOT NULL | DEFAULT 0.00 | valorBruto - valorDesconto + taxaInstalacao + taxaFrete |
| `condicao_pagamento` | `VARCHAR(30)` | NULL | — | Enum: A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR |
| `observacoes_pagamento` | `TEXT` | NULL | — | Observações livres sobre a negociação |
| `observacoes` | `TEXT` | NULL | — | Observações gerais do orçamento |
| `data_emissao` | `DATE` | NOT NULL | DEFAULT CURRENT_DATE | Data de criação/emissão |
| `data_validade` | `DATE` | NOT NULL | — | Data limite de validade (padrão: emissão + 15 dias) |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria: data de criação do registro |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria: última atualização |
| `ativo` | `BOOLEAN` | NOT NULL | DEFAULT TRUE | Soft delete |

**Índices**:
- `idx_budgets_codigo` UNIQUE ON `codigo`
- `idx_budgets_cliente_id` ON `cliente_id`
- `idx_budgets_status` ON `status`
- `idx_budgets_data_emissao` ON `data_emissao`

---

### BudgetItem (Item do Orçamento)

Cada linha de produto/esquadria dentro do orçamento, com especificações técnicas e valores.

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador auto-gerado |
| `budget_id` | `BIGINT` | NOT NULL | FK → `budgets(id)` ON DELETE CASCADE | Orçamento pai |
| `product_id` | `BIGINT` | NULL | FK → `products(id)` | Produto/template de referência |
| `descricao` | `VARCHAR(300)` | NOT NULL | — | Nome/descrição da esquadria ou vidro |
| `largura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Largura nominal em milímetros |
| `altura_mm` | `INTEGER` | NOT NULL | CHECK > 0 | Altura nominal em milímetros |
| `quantidade` | `INTEGER` | NOT NULL | DEFAULT 1, CHECK > 0 | Quantidade de peças idênticas |
| `cor_aluminio` | `VARCHAR(50)` | NULL | — | Cor/acabamento do perfil (branco, preto, bronze, fosco) |
| `tipo_vidro` | `VARCHAR(100)` | NULL | — | Tipo e espessura do vidro (ex: "Temperado 8mm Incolor") |
| `orientacao_abertura` | `VARCHAR(30)` | NULL | — | Lado ou sentido de abertura (ESQUERDA, DIREITA, CORRER, BASCULANTE, MAXIM_AR, PIVOTANTE) |
| `ferragens` | `TEXT` | NULL | — | Relação de ferragens e acessórios (JSON ou texto descritivo) |
| `valor_unitario` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | Preço unitário calculado pelo motor de orçamentos |
| `valor_total` | `NUMERIC(12,2)` | NOT NULL | CHECK >= 0 | valorUnitario * quantidade |
| `ordem` | `INTEGER` | NOT NULL | DEFAULT 0 | Ordem de exibição no orçamento |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |

**Índices**:
- `idx_budget_items_budget_id` ON `budget_id`

---

## Enums (Java)

### BudgetStatus
```
RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO
```

### DiscountType
```
PERCENTUAL, VALOR_FIXO
```

### PaymentCondition
```
A_VISTA_PIX("À Vista (PIX / Dinheiro)")
ENTRADA_50_SALDO_ENTREGA("50% Entrada + 50% na Entrega")
CARTAO_12X("Cartão de Crédito até 12x")
A_COMBINAR("A Combinar")
```

### OpeningOrientation (reutilizado/estendido do catálogo)
```
ESQUERDA, DIREITA, CORRER, BASCULANTE, MAXIM_AR, PIVOTANTE
```

---

## Relationships

```
Budget (1) ──── (N) BudgetItem
Budget (N) ────→ (1) Cliente (opcional, FK nullable)
BudgetItem (N) ────→ (1) Product (opcional, FK nullable para itens avulsos)
```

---

## State Transitions (Budget.status)

```
RASCUNHO ──→ ENVIADO ──→ APROVADO
                │              │
                └──→ REJEITADO │
                               │
         (automático por data) ↓
                          EXPIRADO
```

- `RASCUNHO → ENVIADO`: Quando o vendedor finaliza e emite o PDF comercial.
- `ENVIADO → APROVADO`: Quando o cliente aceita a proposta.
- `ENVIADO → REJEITADO`: Quando o cliente recusa ou o vendedor cancela.
- `ENVIADO → EXPIRADO`: Transição automática quando `data_validade < CURRENT_DATE`.
- `RASCUNHO → RASCUNHO`: Edições livres durante a montagem.

---

## Validation Rules

| Regra | Aplicação | Tipo |
| :--- | :--- | :--- |
| `percentualDesconto >= 0 AND <= 100` | DTO + Entity | Bean Validation (JSR-380) |
| `valorDesconto >= 0 AND <= valorBruto` | Service | Regra de negócio |
| `larguraMm > 0 AND alturaMm > 0` | DTO | Bean Validation |
| `quantidade >= 1` | DTO | Bean Validation |
| `valorUnitario >= 0` | DTO | Bean Validation |
| `dataValidade >= dataEmissao` | Service | Regra de negócio |
| Status transitions válidas | Service | Máquina de estados |
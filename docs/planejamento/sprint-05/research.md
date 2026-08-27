# Research: Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Date**: 2026-08-27

## R1: Estratégia de Lock de Preços e Imutabilidade

### Decision: Cópia profunda (Deep Copy) dos itens para tabela dedicada `order_items` com campos desnormalizados

**Rationale**:
- A tabela `order_items` armazena uma cópia estática do nome, medidas, opções, cor do perfil, tipo de vidro, ferragens e preços unitários/totais no exato momento da conversão.
- Alterações futuras nos preços do catálogo ou mesmo nos itens do orçamento original não propagam para `order_items`.
- Isso garante 100% de integridade contábil e jurídica sem necessidade de versionamento complexo no catálogo de materiais.

**Alternatives Considered**:
- Versionamento temporal de preços no catálogo (SCD Type 2): Muito complexo para o escopo atual e desnecessário, já que o pedido precisa apenas do snapshot final do item montado.
- Manter apenas FK para `budget_items`: Se o orçamento fosse reaberto ou modificado, o pedido seria corrompido.

## R2: Relação entre Orçamento e Pedido de Venda

### Decision: Relacionamento 1:1 com constraint UNIQUE no campo `orders.orcamento_id`

**Rationale**:
- Um orçamento só pode gerar um único pedido ativo.
- A constraint UNIQUE no banco garante que mesmo sob concorrência (duplo clique no botão de aprovar), nunca serão criados pedidos duplicados para o mesmo orçamento.

## R3: Nova Migration Flyway

### Decision: `V9__create_orders_schema.sql`

**Rationale**:
- A Sprint 4 introduz `V8__create_budgets_schema.sql`.
- A migration `V9` criará a tabela `orders`, a tabela `order_items` e os respectivos índices e constraints.

## R4: Reutilização do Motor OpenPDF para Comprovante de Pedido

### Decision: `OrderPdfService` no módulo `orders` reutilizando o padrão institucional da Alumiportas

**Rationale**:
- Segue a mesma arquitetura do `BudgetPdfService` (OpenPDF server-side).
- Gera o Comprovante do Pedido com dados de entrega, canal de aprovação e número oficial do pedido (`PED-YYYY-NNNN`).

## R5: Máquina de Estados e Transições do Pedido

### Decision: Enum `OrderStatus` com transições controladas no `OrderService`

**Status**:
- `AGUARDANDO_PRODUCAO`: Status inicial após aprovação.
- `EM_PRODUCAO`: Disparado quando a Sprint 6 iniciar a fabricação das Ordens de Produção.
- `CONCLUIDO`: Pedido fabricado e pronto para expedição/instalação.
- `CANCELADO`: Pedido cancelado antes de entrar em produção (exige campo de justificativa não vazio).
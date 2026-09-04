# Data Model: Sprint 6 — Etiquetas de Identificação e Kanban de Produção

**Feature**: `003-producao-kanban-etiquetas`  
**Date**: 2026-09-04  

## Contexto de Modelo de Dados

Conforme decisão de arquitetura, a Sprint 06 **não cria tabelas adicionais no banco de dados** (`production_orders` e `production_order_histories` foram descartadas). Toda a operação de chão de fábrica é conduzida diretamente sobre as entidades imutáveis consolidadas na Sprint 05: `orders` e `order_items`.

---

## Entidades Utilizadas

### Order (Pedido de Venda)
Utilizado diretamente como cartão no painel Kanban de produção.

| Campo Relevante no Kanban | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGINT` | Identificador único do pedido |
| `codigo` | `VARCHAR(20)` | Código sequencial (ex: `PED-2026-0001`) |
| `cliente_nome` | `VARCHAR(200)` | Nome do cliente |
| `status` | `VARCHAR(25)` | Enum: `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO` |
| `data_previsao_entrega` | `DATE` | Prazo prometido para entrega/instalação (usado em alertas visuais) |
| `data_conclusao` | `DATE` | Preenchido automaticamente ao mover para `CONCLUIDO` |
| `observacoes` | `TEXT` | Observações gerais |

### OrderItem (Item do Pedido de Venda)
Utilizado como fonte de dados para emissão das etiquetas térmicas de identificação das esquadrias.

| Campo na Etiqueta | Tipo | Descrição |
| :--- | :--- | :--- |
| `order_id` | `BIGINT` | Vínculo com o pedido pai |
| `descricao` | `VARCHAR(300)` | Descrição da esquadria (ex: "Janela 2 Folhas Linha Suprema") |
| `quantidade` | `INTEGER` | Quantidade de peças ($N$ etiquetas geradas) |
| `largura_mm` | `INTEGER` | Largura nominal em mm |
| `altura_mm` | `INTEGER` | Altura nominal em mm |
| `cor_aluminio` | `VARCHAR(50)` | Cor do acabamento dos perfis |
| `tipo_vidro` | `VARCHAR(100)` | Especificação e espessura do vidro |
| `orientacao_abertura` | `VARCHAR(30)` | Sentido/lado de abertura |

---

## Máquina de Estados no Kanban

```text
[AGUARDANDO_PRODUCAO] ────▶ [EM_PRODUCAO] ────▶ [CONCLUIDO]
```

- **Transição 1 (`AGUARDANDO_PRODUCAO` → `EM_PRODUCAO`)**: Início dos trabalhos de corte/montagem na oficina.
- **Transição 2 (`EM_PRODUCAO` → `CONCLUIDO`)**: Finalização da fabricação de todas as esquadrias do pedido, registrando `data_conclusao = CURRENT_DATE`.
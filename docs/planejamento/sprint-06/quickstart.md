# Quickstart Validation Guide: Sprint 6 — Etiquetas de Identificação e Kanban de Produção

**Feature**: `003-producao-kanban-etiquetas`  
**Date**: 2026-09-04  

## Prerequisites

- PostgreSQL rodando com migrations da Sprint 05 aplicadas
- Backend compilando sem erros (`mvn clean compile`)
- Frontend buildando sem erros (`npm run build`)
- Existência de pelo menos 1 Pedido de Venda aprovado (ex: ID 1)

## Validation Scenarios

### Cenário 1: Baixar Lote de Etiquetas de Identificação das Peças

```bash
# Baixar PDF de etiquetas térmicas para o pedido ID 1
curl -s -o etiquetas-pedido-1.pdf http://localhost:8080/api/orders/1/labels-pdf

# Resultado esperado:
# - HTTP 200 OK com Content-Type: application/pdf
# - Páginas no tamanho 100x50mm contendo cliente, código do pedido, medidas (L x A mm), cor e vidro
# - Quantidade de páginas igual à soma das quantidades de todos os itens do pedido
```

### Cenário 2: Transicionar Status de Produção do Pedido

```bash
# Iniciar produção do pedido ID 1
curl -s -X PATCH http://localhost:8080/api/orders/1/production-status \
  -H "Content-Type: application/json" \
  -d '{
    "novoStatus": "EM_PRODUCAO"
  }'

# Resultado esperado:
# - HTTP 200 OK com status atualizado para EM_PRODUCAO
```

### Cenário 3: Finalizar Produção do Pedido

```bash
# Concluir produção do pedido ID 1
curl -s -X PATCH http://localhost:8080/api/orders/1/production-status \
  -H "Content-Type: application/json" \
  -d '{
    "novoStatus": "CONCLUIDO"
  }'

# Resultado esperado:
# - HTTP 200 OK com status CONCLUIDO e dataConclusao preenchida com a data de hoje
```

### Cenário 4: Visualização no Painel Kanban do Frontend

1. Acessar rota `/producao` no navegador.
2. O pedido ID 1 deve aparecer no card correspondente à sua coluna atual.
3. Arrastar o card para a próxima coluna ou utilizar os botões de avanço rápido e verificar a atualização instantânea no backend.
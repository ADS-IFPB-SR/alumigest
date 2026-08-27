# Quickstart Validation Guide: Sprint 6 — Ordens de Produção e QR Code

**Feature**: `003-ordens-producao-qrcode`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V10 aplicadas
- Backend compilando sem erros (`mvn clean compile`)
- Frontend buildando sem erros (`npm run build`)
- Existência de pelo menos 1 Pedido de Venda criado (ex: ID 1)

## Validation Scenarios

### Cenário 1: Gerar OPs a partir do Pedido de Venda

```bash
# Gerar OPs para pedido ID 1
curl -s -X POST http://localhost:8080/api/production-orders/generate-from-order/1

# Resultado esperado:
# - HTTP 201 Created com array de OPs individuais (ex: OP-2026-0001-01, OP-2026-0001-02)
# - Todas com status AGUARDANDO_CORTE
# - Pedido ID 1 atualizado para EM_PRODUCAO
```

### Cenário 2: Bipar QR Code / Consultar OP por Código

```bash
curl -s http://localhost:8080/api/production-orders/by-code/OP-2026-0001-01

# Resultado esperado: HTTP 200 OK com detalhes da esquadria, medidas e histórico
```

### Cenário 3: Transicionar Status da OP

```bash
curl -s -X PATCH http://localhost:8080/api/production-orders/1/transition \
  -H "Content-Type: application/json" \
  -d '{
    "novoStatus": "EM_CORTE",
    "operadorNome": "Carlos Silva",
    "observacao": "Iniciando corte dos perfis"
  }'

# Resultado esperado: HTTP 200 OK com status atualizado para EM_CORTE e registro no histórico
```

### Cenário 4: Baixar Lote de Etiquetas com QR Code

```bash
curl -s -o lote-etiquetas.pdf http://localhost:8080/api/production-orders/order/1/labels-pdf

# Resultado esperado: Arquivo PDF de páginas 100x50mm contendo QR Codes legíveis
```
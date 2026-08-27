# Quickstart Validation Guide: Sprint 10 — Contas a Receber e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V13 aplicadas
- Backend e Frontend rodando
- Existência de 1 Pedido criado (ex: ID 1)

## Validation Scenarios

### Cenário 1: Desdobramento de Parcelas 50%+50% com Resto

```bash
# Gerar plano de parcelas para pedido ID 1
curl -s -X POST http://localhost:8080/api/finance/receivables/order/1/generate

# Resultado esperado: HTTP 201 Created com 2 títulos gerados e soma exata do valor líquido
```

### Cenário 2: Listar Títulos com Alerta de Inadimplência

```bash
curl -s http://localhost:8080/api/finance/receivables?status=VENCIDO

# Resultado esperado: HTTP 200 OK com lista de parcelas vencidas e cálculo de diasAtraso
```

### Cenário 3: Baixar Recibo de Parcela

```bash
curl -s -o recibo.pdf http://localhost:8080/api/finance/receivables/1/receipt-pdf

# Resultado esperado: PDF A4 com dados da quitação e valor por extenso
```
# Quickstart Validation Guide: Sprint 11 — Baixa de Pagamentos e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V14 aplicadas
- Backend e Frontend rodando
- Existência de títulos a receber gerados (ex: ID 1)

## Validation Scenarios

### Cenário 1: Realizar Baixa com Desconto em Dinheiro

```bash
curl -s -X POST http://localhost:8080/api/finance/receivables/1/settle \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPagamento": "DINHEIRO",
    "valorPago": 950.00,
    "descontoConcedido": 50.00,
    "operadorNome": "Financeiro",
    "observacoes": "Desconto pontualidade"
  }'

# Resultado esperado: HTTP 200 OK com status PAGO e lançamento no fluxo de caixa de R$ 950,00
```

### Cenário 2: Consultar Resumo do Fluxo de Caixa

```bash
curl -s http://localhost:8080/api/finance/cash-flow/summary

# Resultado esperado: HTTP 200 OK com totalEntradasRealizadas e distribuição por método
```

### Cenário 3: Baixar Relatório de Fechamento de Caixa Diário

```bash
curl -s -o fechamento-caixa.pdf http://localhost:8080/api/finance/cash-flow/daily-closure-pdf

# Resultado esperado: Arquivo PDF A4 consolidando todas as entradas do dia
```
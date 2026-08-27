# Quickstart Validation Guide: Sprint 9 — Pagamento e Cobrança via PIX

**Feature**: `006-pagamento-cobranca-pix`
**Date**: 2026-08-27

## Prerequisites

- Backend e Frontend rodando com profiles `dev`
- Existência de 1 Pedido com sinal pendente (ex: ID 1)

## Validation Scenarios

### Cenário 1: Gerar Cobrança PIX de Sinal

```bash
curl -s -X POST http://localhost:8080/api/payments/pix/generate-for-order/1 \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPagamento": "ENTRADA_SINAL",
    "valor": 1000.00
  }'

# Resultado esperado: HTTP 201 Created contendo txid, payloadCopiaECola, qrCodeBase64 e validade de 24h
```

### Cenário 2: Simular Liquidação do PIX no Ambiente Local

```bash
curl -s -X POST http://localhost:8080/api/payments/pix/simulate/ALUMI-2026-0827-ABC1234

# Resultado esperado: HTTP 200 OK com status PAGO e pedido ID 1 atualizado para SINAL_PAGO
```

### Cenário 3: Consultar Status por Polling

```bash
curl -s http://localhost:8080/api/payments/pix/status/ALUMI-2026-0827-ABC1234

# Resultado esperado: HTTP 200 OK com status PAGO e dataLiquidacao
```
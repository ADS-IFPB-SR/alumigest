# Quickstart Validation Guide: Sprint 8 — Estoque, Perdas e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V11 aplicadas
- Backend compilando sem erros (`mvn clean compile`)
- Frontend buildando sem erros (`npm run build`)

## Validation Scenarios

### Cenário 1: Entrada de Mercadoria no Estoque

```bash
curl -s -X POST http://localhost:8080/api/stock/movement \
  -H "Content-Type: application/json" \
  -d '{
    "stockItemId": 1,
    "tipo": "ENTRADA_COMPRA",
    "quantidade": 100.0,
    "documentoOrigem": "NF-9988",
    "operadorNome": "Almoxarife",
    "motivo": "Compra de barras de alumínio"
  }'

# Resultado esperado: HTTP 201 Created com saldo atualizado
```

### Cenário 2: Consulta de Saldos (Físico, Reservado e Disponível)

```bash
curl -s http://localhost:8080/api/stock

# Resultado esperado: HTTP 200 OK com saldoFisico, quantidadeReservada, saldoDisponivel e flag alertaEstoqueMinimo
```

### Cenário 3: Registrar Perda de Material / Sucata

```bash
curl -s -X POST http://localhost:8080/api/stock/scrap \
  -H "Content-Type: application/json" \
  -d '{
    "stockItemId": 1,
    "quantidade": 2.5,
    "motivo": "ERRO_MEDIDA_CORTE",
    "operadorNome": "Cortador",
    "observacoes": "Perfil cortado 50mm menor que o especificado"
  }'

# Resultado esperado: HTTP 201 Created, débito automático no estoque físico e registro de sucata gravado
```

### Cenário 4: Homologação Completa da Release 2

```bash
# Backend
cd backend
./mvnw clean verify

# Frontend
cd frontend
npm run build
```
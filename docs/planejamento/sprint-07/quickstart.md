# Quickstart Validation Guide: Sprint 7 — Lista de Corte e Ficha Técnica

**Feature**: `004-lista-corte-ficha-montagem`  
**Date**: 2026-08-27  
**Updated**: 2026-09-04  

## Prerequisites

- Backend e Frontend rodando
- Existência de 1 Pedido aprovado (ex: ID 1)

## Validation Scenarios

### Cenário 1: Consultar Romaneio Consolidado de Corte

```bash
curl -s http://localhost:8080/api/production/orders/1/cutting-list

# Resultado esperado: HTTP 200 OK com lista de todas as esquadrias do pedido, medidas nominais, cores e vidros
```

### Cenário 2: Baixar PDF do Romaneio de Oficina com Checkboxes

```bash
curl -s -o romaneio-corte.pdf http://localhost:8080/api/production/orders/1/cutting-list-pdf

# Resultado esperado: Arquivo PDF A4 contendo tabela de corte e colunas de visto físico
```

### Cenário 3: Consultar Ficha Técnica de Montagem de um Item

```bash
curl -s http://localhost:8080/api/production/order-items/1/assembly-sheet

# Resultado esperado: HTTP 200 OK com detalhes completos de abertura, ferragens e medidas da peça
```

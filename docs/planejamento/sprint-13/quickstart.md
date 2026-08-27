# Quickstart Validation Guide: Sprint 13 — Relatórios Gerenciais, DRE e Dashboard

**Feature**: `010-relatorios-dre-dashboard`
**Date**: 2026-08-27

## Prerequisites

- Backend e Frontend rodando
- Base com pedidos e pagamentos lançados

## Validation Scenarios

### Cenário 1: Consultar Métricas do Dashboard

```bash
curl -s http://localhost:8080/api/analytics/dashboard

# Resultado esperado: HTTP 200 OK com faturamentoLiquido, ticketMedio, taxaConversao e gráfico de vendas
```

### Cenário 2: Consultar DRE nos Modos Competência e Caixa

```bash
# Modo Competência
curl -s "http://localhost:8080/api/analytics/dre?mes=8&ano=2026&regime=COMPETENCIA"

# Modo Caixa
curl -s "http://localhost:8080/api/analytics/dre?mes=8&ano=2026&regime=CAIXA"

# Resultado esperado: HTTP 200 OK com demonstrativo contábil e margens de lucro
```

### Cenário 3: Baixar Relatório de Vendas em CSV

```bash
curl -s -o vendas.csv "http://localhost:8080/api/analytics/reports/sales-csv?dataInicio=2026-08-01&dataFim=2026-08-31"

# Resultado esperado: Arquivo CSV com BOM UTF-8 e delimitador ';' pronto para Excel
```
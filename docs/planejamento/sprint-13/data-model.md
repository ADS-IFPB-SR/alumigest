# Data Model: Sprint 13 — Relatórios Gerenciais, DRE e Dashboard

**Feature**: `010-relatorios-dre-dashboard`
**Date**: 2026-08-27

## DTOs & Projeções Analíticas

### DashboardMetricsResponse
```json
{
  "faturamentoBruto": 85000.00,
  "faturamentoLiquido": 79500.00,
  "totalPedidos": 28,
  "ticketMedio": 2839.28,
  "taxaConversao": 68.5,
  "totalEsquadriasEntregues": 74,
  "vendasPorDia": [
    { "data": "2026-08-01", "valor": 3200.00 },
    { "data": "2026-08-02", "valor": 4500.00 }
  ]
}
```

### DreReportResponse
```json
{
  "periodo": "08/2026",
  "regime": "COMPETENCIA",
  "receitaBruta": 85000.00,
  "descontosConcedidos": 5500.00,
  "receitaLiquida": 79500.00,
  "custosMateriais": 38000.00,
  "lucroBruto": 41500.00,
  "margemBrutaPercentual": 52.2,
  "taxasInstalacaoFrete": 4200.00,
  "lucroOperacional": 37300.00,
  "margemOperacionalPercentual": 46.9
}
```

### ProductRankingItemResponse
```json
{
  "descricaoProduto": "Janela 2 Folhas Linha Suprema",
  "quantidadeVendida": 35,
  "faturamentoTotal": 19250.00,
  "percentualParticipacao": 24.2
}
```
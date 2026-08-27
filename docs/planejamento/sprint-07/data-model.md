# Data Model: Sprint 7 — Lista de Corte e Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`
**Date**: 2026-08-27

## Projeções e DTOs (Sem novas tabelas de banco)

### CuttingListResponse (Romaneio Consolidado do Pedido)
```json
{
  "orderId": 1,
  "orderCodigo": "PED-2026-0001",
  "clienteNome": "João Silva",
  "dataPrevisaoEntrega": "2026-09-15",
  "totalPecas": 3,
  "itens": [
    {
      "productionOrderCodigo": "OP-2026-0001-01",
      "numeroPeca": 1,
      "totalPecasItem": 2,
      "descricao": "Janela 2 Folhas Correr",
      "larguraMm": 1200,
      "alturaMm": 1000,
      "corAluminio": "Branco",
      "tipoVidro": "Temperado 8mm Incolor",
      "orientacaoAbertura": "CORRER (Folha Direita)",
      "ferragens": "1x Fecho Concha, 2x Roldanas",
      "status": "AGUARDANDO_CORTE"
    }
  ]
}
```

### AssemblySheetResponse (Ficha Técnica Individual da OP)
```json
{
  "productionOrderId": 1,
  "productionOrderCodigo": "OP-2026-0001-01",
  "orderCodigo": "PED-2026-0001",
  "clienteNome": "João Silva",
  "descricaoPeca": "Janela 2 Folhas Correr",
  "pecaIndex": "1 de 2",
  "larguraMm": 1200,
  "alturaMm": 1000,
  "corAluminio": "Branco",
  "tipoVidro": "Temperado 8mm Incolor",
  "orientacaoAbertura": "CORRER",
  "ferragens": "1x Fecho Concha, 2x Roldanas",
  "observacoes": "Folha direita móvel"
}
```
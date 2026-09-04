# Research: Sprint 6 — Etiquetas de Identificação e Kanban de Produção

**Feature**: `003-producao-kanban-etiquetas`  
**Date**: 2026-09-04  

## R1: Descarte de OPs Individuais e Scanner QR Code

### Decision: Gestão simplificada centrada no Pedido (`Order`) e etiquetas térmicas via `OrderItem`

**Rationale**:
- A criação de tabelas dedicadas (`production_orders` e `production_order_histories`) com granularidade de peça física adicionava burocracia excessiva e risco de dessincronização no chão de fábrica.
- Para a operação da Alumiportas, o controle visual ágil via Kanban de Pedidos (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e etiquetas adesivas legíveis coladas nas peças atendem perfeitamente à necessidade operacional.

## R2: Dimensão e Paginação do PDF de Etiquetas Térmicas

### Decision: Documento OpenPDF com tamanho de página customizado `new Rectangle(283f, 141f)` (100x50mm a 72 DPI)

**Rationale**:
- 100mm = ~283.46 pontos / 50mm = ~141.73 pontos.
- Configurar o tamanho de página exato do OpenPDF gera um documento onde cada página corresponde a 1 etiqueta física em impressoras térmicas (Zebra ZD220, Argox OS-214, Elgin L42 Pro).
- A etiqueta prioriza tipografia nítida, medidas nominais (LxA mm), acabamento e identificação do cliente/pedido sem a necessidade de dependências de QR code como ZXing.

## R3: Reutilização do Schema Existente

### Decision: Sem novas migrations Flyway para produção

**Rationale**:
- A tabela `orders` já possui os campos de status (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`), `data_previsao_entrega` e `data_conclusao`.
- Evita complexidade de schema e migrações adicionais.
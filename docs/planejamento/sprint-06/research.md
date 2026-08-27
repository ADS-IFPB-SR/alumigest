# Research: Sprint 6 — Ordens de Produção (OP) e Etiquetas QR Code

**Feature**: `003-ordens-producao-qrcode`
**Date**: 2026-08-27

## R1: Geração do QR Code

### Decision: Geração no backend com ZXing (`com.google.zxing:core:3.5.3` e `javase:3.5.3`)

**Rationale**:
- ZXing é a biblioteca padrão da indústria Java para codificação/decodificação de códigos de barra e QR Code.
- A geração da imagem PNG/ByteArray do QR Code no backend permite embutir o código diretamente no fluxo de PDF do OpenPDF (geração das etiquetas).
- O payload do QR Code conterá uma URL curta de consulta/scanner: `/producao/op/OP-2026-0001-01`.

## R2: Dimensão e Paginação do PDF de Etiquetas Térmicas

### Decision: Documento OpenPDF com tamanho de página customizado `new Rectangle(283f, 141f)` (100x50mm a 72 DPI)

**Rationale**:
- 100mm = ~283.46 pontos / 50mm = ~141.73 pontos.
- Configurar o tamanho de página exato do OpenPDF gera um documento onde cada página corresponde a 1 etiqueta física em impressoras térmicas (Zebra ZD220, Argox OS-214, Elgin L42 Pro).

## R3: Nova Migration Flyway

### Decision: `V10__create_production_orders_schema.sql`

**Rationale**:
- Sequencial após `V9__create_orders_schema.sql`.
- Cria as tabelas `production_orders` e `production_order_histories`.

## R4: Leitor de QR Code no Frontend PWA

### Decision: Biblioteca `html5-qrcode` para leitura via câmera do navegador

**Rationale**:
- Suporta Android, iOS e Web desktop sem necessidade de plugins nativos.
- Leve (<50KB), sem dependências externas pesadas e com detecção automática de câmeras traseiras (environment camera).
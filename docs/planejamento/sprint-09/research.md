# Research: Sprint 9 — Pagamento e Cobrança via PIX

**Feature**: `006-pagamento-cobranca-pix`
**Date**: 2026-08-27

## R1: Padrão do Payload EMV / BR Code para PIX

### Decision: Geração do payload EMV no backend com formatação CRC16 CCITT

**Rationale**:
- O padrão BACEN define tags EMV (Payload Format Indicator, Point of Initiation Method, Merchant Account Information com chave PIX/URL do payload, Merchant Category Code, Transaction Currency 986 para BRL, Transaction Amount, Country Code BR, Merchant Name, Merchant City, Additional Data Field com txid, e CRC16).
- O backend encapsula a geração matemática do payload e gera a imagem do QR Code usando ZXing.

## R2: Padrão Strategy para Provedor PIX

### Decision: Interface `PixGatewayService` com implementações `MockPixGatewayServiceImpl` e `AsaasPixGatewayServiceImpl`

**Rationale**:
- `@Profile("dev")` ou `@Profile("test")` injeta o Simulador Mock que gera txids locais e permite liquidar com 1 endpoint de teste.
- `@Profile("prod")` injeta o Gateway real.
- Garante total testabilidade em pipelines CI e desenvolvimento offline.

## R3: Nova Migration Flyway

### Decision: `V12__create_payments_and_pix_schema.sql`

**Rationale**:
- Cria as tabelas `payments` e `pix_transactions`.
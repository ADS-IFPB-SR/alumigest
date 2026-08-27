# Implementation Plan: Sprint 9 — Pagamento e Cobrança via PIX

**Branch**: `006-pagamento-cobranca-pix` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-pagamento-cobranca-pix/spec.md`

## Summary

Implementar a emissão de cobranças PIX Dinâmicas com QR Code e Copia e Cola (padrão BACEN / EMV), arquitetura com interface de Gateway e Simulador Mock, listener de Webhook, polling de status no frontend com modal interativo e transição do status do pedido para `SINAL_PAGO` após a confirmação.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, ZXing 3.5.3 (geração de QR Code em imagem), Spring Data JPA
- Frontend: React 19, Lucide React, TanStack Query, React Hot Toast (feedback de cópia)

**Storage**: PostgreSQL 16+ (Migration `V12__create_payments_and_pix_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `finance.pix` com controller, service, repository, domain, dto |
| I. DTOs em Records Java | ✅ PASS | `PixGenerateRequest`, `PixChargeResponse`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do gerador de payload EMV e simulador mock |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/finance/
├── controller/
│   ├── PixPaymentController.java               # Endpoints de geração e polling
│   └── PixWebhookController.java               # Listener de webhooks de PSP
├── service/
│   ├── PixService.java                         # Regras de negócio e liquidação
│   ├── PixPayloadGenerator.java                # Algoritmo de payload EMV + CRC16
│   ├── PixGatewayService.java                  # Interface do Gateway
│   └── impl/
│       ├── MockPixGatewayServiceImpl.java      # Simulador para dev/test
│       └── AsaasPixGatewayServiceImpl.java     # Gateway de produção
├── repository/
│   ├── PaymentRepository.java
│   └── PixTransactionRepository.java
├── domain/
│   ├── Payment.java                            # @Entity Pagamento
│   ├── PixTransaction.java                     # @Entity Transação PIX
│   ├── PaymentType.java                        # Enum tipo
│   └── PixStatus.java                          # Enum status
├── dto/
│   ├── PixGenerateRequest.java
│   ├── PixChargeResponse.java
│   └── PixStatusResponse.java
└── mapper/
    └── PixMapper.java
```

### Frontend

```text
frontend/src/features/finance/
├── components/
│   ├── PixPaymentModal.tsx                     # Modal com QR Code, botão copiar e timer
│   └── PixPaymentSuccessAlert.tsx              # Card de animação de sucesso
├── hooks/
│   └── usePixPayment.ts                        # Hook com polling a cada 3s
└── services/
    └── pixApi.ts                               # Chamadas Axios
```
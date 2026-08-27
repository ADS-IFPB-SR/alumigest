# Implementation Plan: Sprint 6 — Ordens de Produção e QR Code

**Branch**: `003-ordens-producao-qrcode` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-ordens-producao-qrcode/spec.md`

## Summary

Implementar a gestão de chão de fábrica com geração de Ordens de Produção (OP) individuais por peça física (`OP-YYYY-NNNN-XX`), emissão de etiquetas adesivas térmicas (100x50mm) contendo QR Code via OpenPDF + ZXing, e scanner móvel PWA no frontend (`html5-qrcode`) para transição ágil de status da fabricação.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, ZXing 3.5.3 (QR Code), OpenPDF 2.0.3, Spring Data JPA, MapStruct, Lombok
- Frontend: React 19, `html5-qrcode` (leitura de câmera), React Query, Tailwind CSS, Lucide React

**Storage**: PostgreSQL 16+ (Migration `V10__create_production_orders_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `production` com controller, service, repository, domain, dto, mapper |
| I. DTOs em Records Java | ✅ PASS | `ProductionOrderResponse`, `ProductionOrderTransitionRequest`, etc. |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários do gerador de QR Code, service e endpoints |
| III. Validação Dupla | ✅ PASS | Bean Validation nos DTOs + validação de máquina de estados no Service |
| IV. Commits em PT-BR | ✅ PASS | Padrão Conventional Commits em português |

## Project Structure

### Backend

```text
backend/
├── pom.xml                                     # Adicionar com.google.zxing:core e javase
└── src/main/java/br/edu/ifpb/alumigest/production/
    ├── controller/
    │   └── ProductionOrderController.java      # REST endpoints (/api/production-orders)
    ├── service/
    │   ├── ProductionOrderService.java         # Regras de decomposição de peças e transição
    │   ├── QrCodeGeneratorService.java         # Motor de geração de imagem QR Code (ZXing)
    │   └── LabelPdfService.java                # Geração de PDF de etiquetas térmicas (100x50mm)
    ├── repository/
    │   ├── ProductionOrderRepository.java      # Consultas por código, pedido e status
    │   └── ProductionOrderHistoryRepository.java # Histórico de bipagens
    ├── domain/
    │   ├── ProductionOrder.java                # @Entity Ordem de Produção
    │   ├── ProductionOrderHistory.java         # @Entity Histórico
    │   └── ProductionOrderStatus.java          # Enum de status de fábrica
    ├── dto/
    │   ├── ProductionOrderResponse.java        # Record resposta
    │   ├── ProductionOrderTransitionRequest.java # Record transição
    │   └── ProductionOrderHistoryResponse.java # Record histórico
    └── mapper/
        └── ProductionOrderMapper.java          # MapStruct mapper
```

### Frontend

```text
frontend/
├── package.json                                # Adicionar html5-qrcode
└── src/features/production/
    ├── components/
    │   ├── QrScannerModal.tsx                  # Componente leitor de câmera com html5-qrcode
    │   ├── ProductionKanbanBoard.tsx           # Quadro Kanban de estágios de produção
    │   ├── ProductionOrderCard.tsx             # Card de esquadria no Kanban
    │   └── ProductionStatusBadge.tsx           # Badge visual de estágio
    ├── hooks/
    │   └── useProductionOrders.ts              # React Query hooks
    ├── services/
    │   └── productionApi.ts                    # Axios endpoints
    └── pages/
        ├── ProductionKanbanPage.tsx            # Tela principal de chão de fábrica
        ├── ProductionScannerPage.tsx           # Tela dedicada do scanner mobile
        └── ProductionOrderDetailPage.tsx       # Detalhes da peça e histórico
```
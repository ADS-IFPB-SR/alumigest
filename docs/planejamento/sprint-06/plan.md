# Implementation Plan: Sprint 6 — Etiquetas de Identificação e Kanban de Produção

**Branch**: `003-producao-kanban-etiquetas` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `docs/planejamento/sprint-06/spec.md`

## Summary

Implementar a gestão de chão de fábrica simplificada e eficiente, com emissão de etiquetas adesivas físicas para cada esquadria a partir dos itens do pedido (`OrderItem`) via OpenPDF (100x50mm legível) e acompanhamento visual do fluxo de produção por meio de um Painel Kanban de Pedidos de Venda (`Order`) nas colunas `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO` e `CONCLUIDO`.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, OpenPDF 2.0.3, Spring Data JPA, MapStruct, Lombok
- Frontend: React 19, React Query, Tailwind CSS, Lucide React

**Storage**: PostgreSQL 16+ (Utilização direta do schema existente de `orders` e `order_items` criado na Sprint 05, sem necessidade de novas tabelas pesadas de OPs).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulos `production` / `order` com controller, service, dto |
| I. DTOs em Records Java | ✅ PASS | Records para payload de atualização de status e relatórios |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários do gerador de etiquetas em PDF e de transições de status |
| III. Validação Dupla | ✅ PASS | Validação de transição de status de pedido no backend + UI interativa |
| IV. Commits em PT-BR | ✅ PASS | Padrão Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/
├── order/
│   ├── controller/
│   │   └── OrderController.java                # Endpoint de etiquetas e transição de status de produção
│   └── service/
│       └── OrderService.java                   # Regra de avanço de status do pedido para produção
└── production/
    └── service/
        └── LabelPdfService.java                # Geração de PDF de etiquetas térmicas (100x50mm) dos OrderItems
```

### Frontend

```text
frontend/src/
├── features/
│   ├── orders/
│   │   └── pages/
│   │       └── OrderDetailPage.tsx             # Botão de emissão de etiquetas térmicas
│   └── production/
│       ├── components/
│       │   ├── ProductionKanbanBoard.tsx       # Quadro Kanban de produção por pedido
│       │   └── OrderProductionCard.tsx         # Card de pedido no Kanban
│       ├── hooks/
│       │   └── useProductionKanban.ts          # React Query hooks para pedidos em produção
│       └── services/
│           └── productionApi.ts                # Axios endpoints para gestão de produção
└── pages/
    └── ProductionKanbanPage.tsx                # Tela principal do Kanban de Produção
```
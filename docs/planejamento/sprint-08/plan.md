# Implementation Plan: Sprint 8 — Estoque, Perdas e Homologação R2

**Branch**: `005-estoque-perdas-homologacao-r2` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-estoque-perdas-homologacao-r2/spec.md`

## Summary

Implementar a gestão de estoque em tempo real com controle de saldos (físico, reservado e disponível), reservas na liberação da produção, baixas automáticas na conclusão do corte, registro de perdas/sucata e homologação integrada da Release 2 (v2.0.0).

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, Hibernate, MapStruct, Lombok
- Frontend: React 19, TanStack Query, React Hook Form, Zod, Tailwind CSS, Lucide React

**Storage**: PostgreSQL 16+ (Migration `V11__create_stock_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `stock` com controller, service, repository, domain, dto, mapper |
| I. DTOs em Records Java | ✅ PASS | `StockItemResponse`, `StockMovementRequest`, etc. |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários do motor de estoque, concorrência e integração |
| III. @Transactional atômico | ✅ PASS | Garantia de consistência em reservas e baixas |
| IV. Commits em PT-BR | ✅ PASS | Padrão Conventional Commits |

## Project Structure

### Backend

```text
backend/
├── src/main/java/br/edu/ifpb/alumigest/stock/
│   ├── controller/
│   │   └── StockController.java                # REST endpoints (/api/stock)
│   ├── service/
│   │   ├── StockService.java                   # Lógica de reserva, baixa e ajuste
│   │   └── ScrapService.java                   # Registro de perdas e sucata
│   ├── repository/
│   │   ├── StockItemRepository.java            # Consultas com lock e busca por material
│   │   ├── StockMovementRepository.java        # Histórico Kardex
│   │   └── ScrapRecordRepository.java          # Registros de perdas
│   ├── domain/
│   │   ├── StockItem.java                      # @Entity Item de Estoque
│   │   ├── StockMovement.java                  # @Entity Movimentação
│   │   ├── ScrapRecord.java                    # @Entity Perda/Sucata
│   │   ├── StockMovementType.java              # Enum tipo de movimentação
│   │   └── ScrapReason.java                    # Enum motivo de perda
│   ├── dto/
│   │   ├── StockItemResponse.java              # Record com saldos
│   │   ├── StockMovementRequest.java           # Record de entrada/ajuste
│   │   ├── StockMovementResponse.java          # Record movimentação
│   │   └── ScrapRecordRequest.java             # Record de perda
│   └── mapper/
│       └── StockMapper.java                    # MapStruct mapper
└── src/main/resources/db/migration/
    └── V11__create_stock_schema.sql            # Migration Flyway
```

### Frontend

```text
frontend/
├── src/features/stock/
│   ├── components/
│   │   ├── StockTable.tsx                      # Tabela com saldos e alertas
│   │   ├── StockMovementModal.tsx              # Modal de entrada de mercadoria
│   │   ├── ScrapRecordModal.tsx                # Modal de registro de perda
│   │   └── KardexDrawer.tsx                    # Painel lateral com extrato
│   ├── hooks/
│   │   └── useStock.ts                         # React Query hooks
│   ├── services/
│   │   └── stockApi.ts                         # Axios endpoints
│   └── pages/
│       └── StockPage.tsx                       # Página principal de estoque
```
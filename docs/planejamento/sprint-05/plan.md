# Implementation Plan: Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

**Branch**: `002-pedidos-lock-precos` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-pedidos-lock-precos/spec.md`

## Summary

Implementar a formalização da aprovação de orçamentos e a conversão automatizada em Pedidos de Venda vinculantes (`Order` / `OrderItem`), garantindo o congelamento total de preços unitários e especificações técnicas (Lock de Preços). O módulo gerencia o ciclo de vida do pedido (`AGUARDANDO_PRODUCAO` a `CONCLUIDO` / `CANCELADO`), com emissão de Comprovante do Pedido em PDF via OpenPDF e sugestão inteligente de prazo de entrega.

## Technical Context

**Language/Version**: Java 21 LTS (backend) + TypeScript 6.x / React 19 (frontend)

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, Hibernate, MapStruct 1.6.3, OpenPDF 2.0.3, Jakarta Bean Validation
- Frontend: React 19, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS, Lucide React

**Storage**: PostgreSQL 16+ com Flyway Migrations (Migration `V9__create_orders_schema.sql`)

**Constraints**: Lock de preços via cópia profunda (deep copy) de `BudgetItem` para `OrderItem`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Arquitetura Package-by-Feature | ✅ PASS | Módulo `orders` segue `controller/service/repository/domain/dto/mapper` |
| I. DTOs obrigatórios (Records Java) | ✅ PASS | `OrderConvertRequest`, `OrderResponse`, etc. |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários e de integração planejados com H2 |
| III. Validação Dupla | ✅ PASS | Bean Validation nos DTOs + regras de negócio no Service |
| III. @Transactional explícito | ✅ PASS | Transações atômicas para garantir conversão íntegra de orçamento + itens |
| III. Soft Delete | ✅ PASS | Campo `ativo` na entidade `Order` |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português do Brasil |
| V. Git Flow & PR obrigatório | ✅ PASS | Branch de feature com PR para develop |

## Project Structure

### Backend

```text
backend/
├── src/main/java/br/edu/ifpb/alumigest/orders/
│   ├── controller/
│   │   └── OrderController.java                # REST endpoints (/api/orders)
│   ├── service/
│   │   ├── OrderService.java                   # Lógica de conversão, lock de preços e cancelamento
│   │   ├── OrderPdfService.java                # Geração de Comprovante do Pedido em PDF
│   │   └── OrderCodeGenerator.java             # Gerador sequencial PED-YYYY-NNNN
│   ├── repository/
│   │   ├── OrderRepository.java                # JpaRepository com buscas por status e código
│   │   └── OrderItemRepository.java            # JpaRepository de itens
│   ├── domain/
│   │   ├── Order.java                          # @Entity Pedido de Venda
│   │   ├── OrderItem.java                      # @Entity Item do Pedido (Snapshot)
│   │   ├── OrderStatus.java                    # Enum de status
│   │   └── ApprovalChannel.java                # Enum canal de aprovação
│   ├── dto/
│   │   ├── OrderConvertRequest.java            # Record de conversão
│   │   ├── OrderCancelRequest.java             # Record de cancelamento com justificativa
│   │   ├── OrderResponse.java                  # Record completo
│   │   ├── OrderSummaryResponse.java           # Record resumido para listagem
│   │   └── OrderItemResponse.java              # Record item
│   └── mapper/
│       └── OrderMapper.java                    # MapStruct mapper
└── src/main/resources/db/migration/
    └── V9__create_orders_schema.sql            # Migration Flyway
```

### Frontend

```text
frontend/
├── src/features/orders/
│   ├── components/
│   │   ├── OrderApprovalModal.tsx              # Modal de aprovação a partir do orçamento
│   │   ├── OrderCancelModal.tsx                # Modal de cancelamento com justificativa
│   │   ├── OrderStatusBadge.tsx                # Badge visual de status
│   │   ├── OrderItemsTable.tsx                 # Tabela de itens congelados
│   │   └── OrderSummaryCard.tsx                # Card com totais e prazos
│   ├── hooks/
│   │   └── useOrders.ts                        # React Query hooks
│   ├── services/
│   │   └── orderApi.ts                         # Axios endpoints
│   ├── types/
│   │   └── order.ts                            # Interfaces TypeScript
│   └── schemas/
│       └── orderSchema.ts                      # Schemas Zod
└── src/pages/
    ├── OrderListPage.tsx                       # Listagem de pedidos de venda
    └── OrderDetailPage.tsx                     # Detalhes do pedido com PDF e ações
```
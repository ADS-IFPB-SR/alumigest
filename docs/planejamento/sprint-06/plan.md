# Implementation Plan: Sprint 6 — Pedidos de Venda, Lock de Preços e Comprovante Oficial

**Branch**: `002-pedidos-lock-precos` | **Período da Sprint 06**: 29/09/2026 a 12/10/2026 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `docs/planejamento/sprint-06/spec.md`

## Summary

Implementar a formalização da aprovação de orçamentos e a conversão automatizada em Pedidos de Venda vinculantes (`Order` / `OrderItem`), garantindo o congelamento total de preços unitários e especificações técnicas (Lock de Preços / Snapshot Imutável). O módulo gerencia o ciclo de vida do pedido (`AGUARDANDO_PRODUCAO` a `CONCLUIDO` / `CANCELADO`), com emissão de Comprovante do Pedido em PDF via OpenPDF e sugestão inteligente de prazo de entrega (+15 dias corridos).

## Technical Context

**Language/Version**: Java 21 LTS (backend) + TypeScript 6.x / React 19 (frontend)

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, Hibernate, MapStruct 1.6.3, OpenPDF 2.0.3, Jakarta Bean Validation, Lombok
- Frontend: React 19, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS, Lucide React

**Storage**: PostgreSQL 16+ com Flyway Migrations (Migration `V19__create_orders_schema.sql`)

**Constraints**: Lock de preços via cópia profunda (*deep copy*) de `BudgetItem` para `OrderItem` em transação `@Transactional` atômica.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Arquitetura Package-by-Feature | ✅ PASS | Módulo `orders` segue `controller/service/repository/domain/dto/mapper` |
| I. DTOs obrigatórios (Records Java) | ✅ PASS | `OrderConvertRequest`, `OrderResponse`, `OrderCancelRequest` |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários e de integração planejados com H2 e mock de serviços |
| III. Validação Dupla | ✅ PASS | Bean Validation nos DTOs + regras de negócio no Service + Zod no frontend |
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
│   │   ├── OrderPdfService.java                # Geração de Comprovante do Pedido em PDF (OpenPDF)
│   │   └── OrderCodeGenerator.java             # Gerador sequencial PED-YYYY-NNNN
│   ├── repository/
│   │   ├── OrderRepository.java                # Spring Data JPA
│   │   └── OrderItemRepository.java            # Spring Data JPA
│   ├── domain/
│   │   ├── Order.java                          # Entidade JPA principal
│   │   ├── OrderItem.java                      # Entidade JPA item (snapshot imutável)
│   │   ├── OrderStatus.java                    # Enum CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO
│   │   └── ApprovalChannel.java                # Enum WHATSAPP, PRESENCIAL, TELEFONE, EMAIL
│   ├── dto/
│   │   ├── OrderConvertRequest.java            # Record request de conversão
│   │   ├── OrderCancelRequest.java             # Record request de cancelamento com justificativa
│   │   ├── OrderResponse.java                  # Record response detalhado
│   │   ├── OrderSummaryResponse.java           # Record response para listagem
│   │   └── OrderItemResponse.java              # Record response item
│   └── mapper/
│       └── OrderMapper.java                    # MapStruct mapper
└── src/main/resources/db/migration/
    └── V19__create_orders_schema.sql            # Tabelas orders e order_items
```

### Frontend

```text
frontend/src/
├── features/orders/
│   ├── components/
│   │   ├── OrderApprovalModal.tsx              # Modal de aprovação com canal e data
│   │   ├── OrderCancelModal.tsx                # Modal de cancelamento com justificativa
│   │   ├── OrderStatusBadge.tsx                # Badge colorido de status
│   │   └── OrderItemsTable.tsx                 # Tabela de itens com lock de preços
│   ├── hooks/
│   │   └── useOrders.ts                        # Hooks React Query (useOrders, useOrder, useConvertBudget, useCancelOrder)
│   ├── services/
│   │   └── orderApi.ts                         # Chamadas Axios para endpoints de orders
│   ├── schemas/
│   │   └── orderSchema.ts                      # Schemas de validação Zod
│   └── types/
│       └── order.ts                            # Interfaces TypeScript
└── pages/
    ├── OrderListPage.tsx                       # Listagem de pedidos com busca e filtros
    └── OrderDetailPage.tsx                     # Detalhes do pedido, ações e download de comprovante
```
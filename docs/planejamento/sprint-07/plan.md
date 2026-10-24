# Implementation Plan: Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

**Branch**: `003-etiquetas-kanban-producao` | **Período da Sprint 07**: 13/10/2026 a 27/10/2026 | **Spec**: [spec.md](spec.md) | **Status**: 🟢 Concluído

**Input**: Feature specification from `docs/planejamento/sprint-07/spec.md`

## Summary

Implementar a identificação física de esquadrias e o controle visual da esteira fabril de esquadrias de alumínio. O módulo contempla:
1. Geração de PDF térmico padronizado (100x50mm) com OpenPDF para cada unidade física de peça contratada (`US-17`);
2. Quadro visual Kanban com 3 colunas de estágio de fabricação (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`), cards informativos com cálculo de urgência de prazo/SLA, transições estritas com preenchimento automático de `data_conclusao` e navegação dedicada no frontend (`US-18`).

## Technical Context

**Language/Version**: Java 21 LTS (backend) + TypeScript 5.8+ / React 19 (frontend)

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, Hibernate, MapStruct 1.6.3, OpenPDF 2.0.3, Jakarta Bean Validation, Lombok
- Frontend: React 19, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS, Lucide React (`Columns3`, `Printer`, `Clock`, `AlertTriangle`)

**Storage**: PostgreSQL 16+ (reaproveita as tabelas `tb_orders` e `tb_order_items` consolidadas na Sprint 06 via migration `V19__create_orders_schema.sql`).

**Constraints**:
- Layout de etiqueta térmica com dimensões exatas de 100x50 mm ($283.46 \times 141.73 \text{ pt}$).
- Transições de produção atômicas via `@Transactional` no backend com validação de status anterior.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Arquitetura Package-by-Feature | ✅ PASS | Endpoints de produção e etiquetas integrados no pacote `orders`/`production` |
| I. DTOs obrigatórios (Records Java) | ✅ PASS | `ProductionStatusUpdateRequest`, `OrderProductionSummaryResponse` |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários para `LabelPdfService` e testes de transição de status no controller/service |
| III. Validação Dupla | ✅ PASS | Validação de enum e integridade no Backend + Zod/TypeScript no Frontend |
| III. @Transactional explícito | ✅ PASS | Método de alteração de status com `@Transactional` atômico |
| III. Soft Delete & Auditoria | ✅ PASS | Respeita flag `is_active` e atualiza `completion_date` e `updated_at` |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português do Brasil |
| V. Git Flow & PR obrigatório | ✅ PASS | Branches específicas por sub-tarefa integradas via Pull Request |

## Project Structure

### Backend

```text
backend/
├── src/main/java/br/edu/ifpb/alumigest/orders/
│   ├── controller/
│   │   └── OrderController.java                # Adicionar GET /labels-pdf e PATCH /production-status
│   ├── service/
│   │   ├── OrderService.java                   # Lógica de atualização de status fabril e data de conclusão
│   │   └── LabelPdfService.java                # Novo serviço: Geração de etiquetas térmicas 100x50mm (OpenPDF)
│   ├── domain/
│   │   ├── Order.java                          # Entidade JPA (atualização de status e dataConclusao)
│   │   └── OrderStatus.java                    # Enum de status (AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO)
│   ├── dto/
│   │   ├── ProductionStatusUpdateRequest.java  # Record request para atualização de status fabril
│   │   └── OrderProductionCardResponse.java    # Record response otimizado para o quadro Kanban
│   └── mapper/
│       └── OrderMapper.java                    # Mapeamentos MapStruct
└── src/test/java/br/edu/ifpb/alumigest/orders/
    ├── service/
    │   ├── LabelPdfServiceTest.java            # Teste unitário de geração de etiquetas e contagem de páginas
    │   └── OrderServiceProductionTest.java     # Teste unitário de máquina de estados de produção
    └── controller/
        └── OrderControllerProductionTest.java  # Teste de integração MockMvc para os novos endpoints
```

### Frontend

```text
frontend/src/
├── features/
│   ├── orders/
│   │   └── pages/
│   │       └── OrderDetailPage.tsx             # Botão "Imprimir Etiquetas" na action bar com download de PDF
│   └── production/
│       ├── components/
│       │   ├── OrderProductionCard.tsx         # Card de pedido no Kanban com SLA de prazo e botões de ação
│       │   ├── ProductionKanbanBoard.tsx       # Estrutura do quadro em 3 colunas
│       │   └── ProductionFilters.tsx           # Filtros de busca rápida (código, cliente, atrasados)
│       ├── hooks/
│       │   └── useProductionKanban.ts          # Hooks React Query para busca de pedidos fabris e mutação de status
│       ├── services/
│       │   └── productionApi.ts                # Chamadas Axios específicas do fluxo fabril
│       ├── types/
│       │   └── production.ts                   # Interfaces TypeScript de produção
│       └── pages/
│           └── ProductionKanbanPage.tsx        # Página principal do painel Kanban
├── components/
│   └── layout/
│       └── Sidebar.tsx                         # Inclusão do link de navegação "Produção (Kanban)"
└── routes/
    └── AppRoutes.tsx                           # Registro da rota "/producao"
```

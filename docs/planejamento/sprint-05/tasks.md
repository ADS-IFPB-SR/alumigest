# Tasks: Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-orders.md, research.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estruturação inicial do módulo de pedidos

- [ ] T001 Criar package `br.edu.ifpb.alumigest.orders` e diretório `frontend/src/features/orders`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migration Flyway V9, Entidades JPA, Repositories e Enums fundamentais

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão desta fase

- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V9__create_orders_schema.sql` com tabelas `orders` e `order_items`, constraints UNIQUE e índices
- [ ] T003 [P] Criar enum `OrderStatus` (CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderStatus.java`
- [ ] T004 [P] Criar enum `ApprovalChannel` com labels em português (WHATSAPP, PRESENCIAL, TELEFONE, EMAIL) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/ApprovalChannel.java`
- [ ] T005 Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`
- [ ] T006 Criar entidade JPA `OrderItem` com snapshot imutável de itens em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderItem.java`
- [ ] T007 [P] Criar repositório `OrderRepository` com busca por código, status e cliente em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderRepository.java`
- [ ] T008 [P] Criar repositório `OrderItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderItemRepository.java`
- [ ] T009 Criar gerador de código sequencial `OrderCodeGenerator` (padrão PED-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderCodeGenerator.java`

**Checkpoint**: Base de persistência pronta. A conversão e as regras de negócio podem ser implementadas.

---

## Phase 3: User Story 1 & 2 - Conversão de Orçamento em Pedido e Lock de Preços (Priority: P1) 🎯 MVP

**Goal**: Aprovar orçamento, gerar pedido de venda oficial com código sequencial, clonar itens (deep copy) e garantir o congelamento de preços e medidas.

**Independent Test**: Converter orçamento ID 1 em pedido de venda, alterar preços no catálogo de materiais e constatar que o pedido mantém valores inalterados.

### DTOs & Mapper

- [ ] T010 [P] [US1] Criar record `OrderConvertRequest` (canalAprovacao, dataPrevisaoEntrega, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderConvertRequest.java`
- [ ] T011 [P] [US1] Criar record `OrderResponse` (resposta completa com lista de itens e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderResponse.java`
- [ ] T012 [P] [US1] Criar record `OrderSummaryResponse` para listagem paginada em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderSummaryResponse.java`
- [ ] T013 [P] [US1] Criar record `OrderItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderItemResponse.java`
- [ ] T014 [US1] Criar mapper MapStruct `OrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/mapper/OrderMapper.java`

### Service & Controller

- [ ] T015 [US1] Implementar método `converterOrcamentoEmPedido(Long orcamentoId, OrderConvertRequest request)` no `OrderService` com validação de status de orçamento e atualização para APROVADO em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderService.java`
- [ ] T016 [US1] Implementar clonagem profunda (deep copy) dos itens do orçamento para `OrderItem` no `OrderService` garantindo lock de preços
- [ ] T017 [US1] Implementar métodos `buscarPorId()` e `listar()` com paginação e filtros no `OrderService`
- [ ] T018 [US1] Criar `OrderController` com endpoints POST /api/orders/from-budget/{budgetId}, GET /api/orders/{id}, GET /api/orders em `backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java`

### Testes Backend

- [ ] T019 [P] [US1] Criar testes unitários do `OrderService` cobrindo conversão bem-sucedida, bloqueio de conversão duplicada e teste de imutabilidade de itens em `backend/src/test/java/br/edu/ifpb/alumigest/orders/service/OrderServiceTest.java`
- [ ] T020 [US1] Criar testes de integração dos endpoints REST do `OrderController` com base H2 em `backend/src/test/java/br/edu/ifpb/alumigest/orders/controller/OrderControllerIntegrationTest.java`

### Frontend — Tipos, Serviços e Componentes

- [ ] T021 [P] [US1] Criar interfaces TypeScript (Order, OrderItem, OrderConvertRequest, etc.) em `frontend/src/features/orders/types/order.ts`
- [ ] T022 [P] [US1] Criar schemas Zod de validação (orderConvertSchema) em `frontend/src/features/orders/schemas/orderSchema.ts`
- [ ] T023 [US1] Criar serviço de API Axios em `frontend/src/features/orders/services/orderApi.ts`
- [ ] T024 [US1] Criar custom hooks React Query (useOrders, useOrder, useConvertBudget) em `frontend/src/features/orders/hooks/useOrders.ts`
- [ ] T025 [US1] Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx`
- [ ] T026 [US1] Integrar o botão "Aprovar e Gerar Pedido" na tela de detalhes do orçamento (`BudgetDetailPage.tsx`) abrindo o modal de aprovação
- [ ] T027 [US1] Criar componente `OrderStatusBadge` em `frontend/src/features/orders/components/OrderStatusBadge.tsx`
- [ ] T028 [US1] Criar componente `OrderItemsTable` exibindo a tabela dos itens contratados com valores congelados em `frontend/src/features/orders/components/OrderItemsTable.tsx`
- [ ] T029 [US1] Criar página `OrderListPage` com listagem paginada, busca e filtros em `frontend/src/pages/OrderListPage.tsx`
- [ ] T030 [US1] Criar página `OrderDetailPage` com visualização detalhada do pedido em `frontend/src/pages/OrderDetailPage.tsx`
- [ ] T031 [US1] Configurar rotas `/pedidos` e `/pedidos/:id` no React Router em `frontend/src/App.tsx`

**Checkpoint**: Conversão funcional, itens congelados e navegação ponta a ponta pronta (MVP).

---

## Phase 4: User Story 3 - Gestão de Status e Cancelamento de Pedidos (Priority: P2)

**Goal**: Permitir cancelar pedidos com justificativa obrigatória e gerenciar o ciclo de vida do pedido.

**Independent Test**: Cancelar pedido informando justificativa e validar gravação no banco e bloqueio de produção.

- [ ] T032 [P] [US3] Criar record `OrderCancelRequest` (justificativa obrigatória com min 10 caracteres) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderCancelRequest.java`
- [ ] T033 [US3] Implementar método `cancelarPedido(Long id, OrderCancelRequest request)` no `OrderService` validando que o pedido não está em produção
- [ ] T034 [US3] Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController`
- [ ] T035 [US3] Criar modal `OrderCancelModal` com campo de justificativa no frontend em `frontend/src/features/orders/components/OrderCancelModal.tsx`
- [ ] T036 [US3] Adicionar botão "Reabrir Orçamento para Edição" na tela do orçamento quando o pedido vinculado estiver cancelado

**Checkpoint**: Cancelamento seguro com rastreabilidade implementado.

---

## Phase 5: User Story 4 - Emissão do Comprovante do Pedido em PDF (Priority: P2)

**Goal**: Emitir e baixar o PDF oficial do Comprovante do Pedido de Venda.

**Independent Test**: Gerar PDF do pedido e verificar dados da Alumiportas, número do pedido e valores financeiros.

- [ ] T037 [US4] Criar `OrderPdfService` com layout institucional para comprovante do pedido usando OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderPdfService.java`
- [ ] T038 [US4] Adicionar endpoint GET /api/orders/{id}/pdf/comprovante no `OrderController`
- [ ] T039 [P] [US4] Criar teste unitário de geração do PDF do comprovante no `OrderPdfServiceTest`
- [ ] T040 [US4] Adicionar botão "Emitir Comprovante do Pedido" e integração de download na `OrderDetailPage`

**Checkpoint**: Comprovante PDF emitido com sucesso.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentação, menu e validação geral

- [ ] T041 [P] Adicionar documentação OpenAPI/Swagger nos endpoints do `OrderController`
- [ ] T042 [P] Adicionar item "Pedidos de Venda" no menu de navegação do frontend
- [ ] T043 Executar validação completa do `quickstart.md` da Sprint 5 e documentar checklist

---

## Dependencies & Execution Order

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational: Migration V9 + Entidades Order/OrderItem)
    │
    ▼
Phase 3 (US1 & US2: Conversão de Orçamento + Lock de Preços + Frontend) ← MVP
    │
    ▼
Phase 4 (US3: Cancelamento com Justificativa)
    │
    ▼
Phase 5 (US4: Comprovante PDF do Pedido)
    │
    ▼
Phase 6 (Polish)
```
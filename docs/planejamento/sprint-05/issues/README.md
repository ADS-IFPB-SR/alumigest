# 📋 Issues da Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

Este diretório contém todas as **43 issues** detalhadas da Sprint 5 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup (Shared Infrastructure)

- [T001: Criar package `br.edu.ifpb.alumigest.orders` e diretório `frontend/src/features/orders`](T001-criar-package-br-edu-ifpb-alumigest-orders-e-/issue.md)

### Phase 2: Foundational (Blocking Prerequisites)

- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V9__create_orders_schema.sql` com tabelas `orders` e `order_items`, constraints UNIQUE e índices](T002-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T003: Criar enum `OrderStatus` (CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderStatus.java`](T003-criar-enum-orderstatus-criado-aguardando-prod/issue.md) `[P]`
- [T004: Criar enum `ApprovalChannel` com labels em português (WHATSAPP, PRESENCIAL, TELEFONE, EMAIL) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/ApprovalChannel.java`](T004-criar-enum-approvalchannel-com-labels-em-port/issue.md) `[P]`
- [T005: Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`](T005-criar-entidade-jpa-order-com-mapeamento-de-to/issue.md)
- [T006: Criar entidade JPA `OrderItem` com snapshot imutável de itens em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderItem.java`](T006-criar-entidade-jpa-orderitem-com-snapshot-imu/issue.md)
- [T007: Criar repositório `OrderRepository` com busca por código, status e cliente em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderRepository.java`](T007-criar-repositorio-orderrepository-com-busca-p/issue.md) `[P]`
- [T008: Criar repositório `OrderItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderItemRepository.java`](T008-criar-repositorio-orderitemrepository-em-back/issue.md) `[P]`
- [T009: Criar gerador de código sequencial `OrderCodeGenerator` (padrão PED-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderCodeGenerator.java`](T009-criar-gerador-de-codigo-sequencial-ordercodeg/issue.md)

### Phase 3: User Story 1 & 2 - Conversão de Orçamento em Pedido e Lock de Preços (Priority: P1) 🎯 MVP

- [T010: Criar record `OrderConvertRequest` (canalAprovacao, dataPrevisaoEntrega, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderConvertRequest.java`](T010-criar-record-orderconvertrequest-canalaprovac/issue.md) `[P]` `[US1]`
- [T011: Criar record `OrderResponse` (resposta completa com lista de itens e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderResponse.java`](T011-criar-record-orderresponse-resposta-completa-/issue.md) `[P]` `[US1]`
- [T012: Criar record `OrderSummaryResponse` para listagem paginada em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderSummaryResponse.java`](T012-criar-record-ordersummaryresponse-para-listag/issue.md) `[P]` `[US1]`
- [T013: Criar record `OrderItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderItemResponse.java`](T013-criar-record-orderitemresponse-em-backend-src/issue.md) `[P]` `[US1]`
- [T014: Criar mapper MapStruct `OrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/mapper/OrderMapper.java`](T014-criar-mapper-mapstruct-ordermapper-em-backend/issue.md) `[US1]`
- [T015: Implementar método `converterOrcamentoEmPedido(Long orcamentoId, OrderConvertRequest request)` no `OrderService` com validação de status de orçamento e atualização para APROVADO em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderService.java`](T015-implementar-metodo-converterorcamentoempedido/issue.md) `[US1]`
- [T016: Implementar clonagem profunda (deep copy) dos itens do orçamento para `OrderItem` no `OrderService` garantindo lock de preços](T016-implementar-clonagem-profunda-deep-copy-dos-i/issue.md) `[US1]`
- [T017: Implementar métodos `buscarPorId()` e `listar()` com paginação e filtros no `OrderService`](T017-implementar-metodos-buscarporid-e-listar-com-/issue.md) `[US1]`
- [T018: Criar `OrderController` com endpoints POST /api/orders/from-budget/{budgetId}, GET /api/orders/{id}, GET /api/orders em `backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java`](T018-criar-ordercontroller-com-endpoints-post-api-/issue.md) `[US1]`
- [T019: Criar testes unitários do `OrderService` cobrindo conversão bem-sucedida, bloqueio de conversão duplicada e teste de imutabilidade de itens em `backend/src/test/java/br/edu/ifpb/alumigest/orders/service/OrderServiceTest.java`](T019-criar-testes-unitarios-do-orderservice-cobrin/issue.md) `[P]` `[US1]`
- [T020: Criar testes de integração dos endpoints REST do `OrderController` com base H2 em `backend/src/test/java/br/edu/ifpb/alumigest/orders/controller/OrderControllerIntegrationTest.java`](T020-criar-testes-de-integracao-dos-endpoints-rest/issue.md) `[US1]`
- [T021: Criar interfaces TypeScript (Order, OrderItem, OrderConvertRequest, etc.) em `frontend/src/features/orders/types/order.ts`](T021-criar-interfaces-typescript-order-orderitem-o/issue.md) `[P]` `[US1]`
- [T022: Criar schemas Zod de validação (orderConvertSchema) em `frontend/src/features/orders/schemas/orderSchema.ts`](T022-criar-schemas-zod-de-validacao-orderconvertsc/issue.md) `[P]` `[US1]`
- [T023: Criar serviço de API Axios em `frontend/src/features/orders/services/orderApi.ts`](T023-criar-servico-de-api-axios-em-frontend-src-fe/issue.md) `[US1]`
- [T024: Criar custom hooks React Query (useOrders, useOrder, useConvertBudget) em `frontend/src/features/orders/hooks/useOrders.ts`](T024-criar-custom-hooks-react-query-useorders-useo/issue.md) `[US1]`
- [T025: Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx`](T025-criar-modal-orderapprovalmodal-selecao-de-can/issue.md) `[US1]`
- [T026: Integrar o botão "Aprovar e Gerar Pedido" na tela de detalhes do orçamento (`BudgetDetailPage.tsx`) abrindo o modal de aprovação](T026-integrar-o-botao-aprovar-e-gerar-pedido-na-te/issue.md) `[US1]`
- [T027: Criar componente `OrderStatusBadge` em `frontend/src/features/orders/components/OrderStatusBadge.tsx`](T027-criar-componente-orderstatusbadge-em-frontend/issue.md) `[US1]`
- [T028: Criar componente `OrderItemsTable` exibindo a tabela dos itens contratados com valores congelados em `frontend/src/features/orders/components/OrderItemsTable.tsx`](T028-criar-componente-orderitemstable-exibindo-a-t/issue.md) `[US1]`
- [T029: Criar página `OrderListPage` com listagem paginada, busca e filtros em `frontend/src/pages/OrderListPage.tsx`](T029-criar-pagina-orderlistpage-com-listagem-pagin/issue.md) `[US1]`
- [T030: Criar página `OrderDetailPage` com visualização detalhada do pedido em `frontend/src/pages/OrderDetailPage.tsx`](T030-criar-pagina-orderdetailpage-com-visualizacao/issue.md) `[US1]`
- [T031: Configurar rotas `/pedidos` e `/pedidos/:id` no React Router em `frontend/src/App.tsx`](T031-configurar-rotas-pedidos-e-pedidos-id-no-reac/issue.md) `[US1]`

### Phase 4: User Story 3 - Gestão de Status e Cancelamento de Pedidos (Priority: P2)

- [T032: Criar record `OrderCancelRequest` (justificativa obrigatória com min 10 caracteres) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderCancelRequest.java`](T032-criar-record-ordercancelrequest-justificativa/issue.md) `[P]` `[US3]`
- [T033: Implementar método `cancelarPedido(Long id, OrderCancelRequest request)` no `OrderService` validando que o pedido não está em produção](T033-implementar-metodo-cancelarpedido-long-id-ord/issue.md) `[US3]`
- [T034: Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController`](T034-adicionar-endpoint-patch-api-orders-id-cancel/issue.md) `[US3]`
- [T035: Criar modal `OrderCancelModal` com campo de justificativa no frontend em `frontend/src/features/orders/components/OrderCancelModal.tsx`](T035-criar-modal-ordercancelmodal-com-campo-de-jus/issue.md) `[US3]`
- [T036: Adicionar botão "Reabrir Orçamento para Edição" na tela do orçamento quando o pedido vinculado estiver cancelado](T036-adicionar-botao-reabrir-orcamento-para-edicao/issue.md) `[US3]`

### Phase 5: User Story 4 - Emissão do Comprovante do Pedido em PDF (Priority: P2)

- [T037: Criar `OrderPdfService` com layout institucional para comprovante do pedido usando OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderPdfService.java`](T037-criar-orderpdfservice-com-layout-instituciona/issue.md) `[US4]`
- [T038: Adicionar endpoint GET /api/orders/{id}/pdf/comprovante no `OrderController`](T038-adicionar-endpoint-get-api-orders-id-pdf-comp/issue.md) `[US4]`
- [T039: Criar teste unitário de geração do PDF do comprovante no `OrderPdfServiceTest`](T039-criar-teste-unitario-de-geracao-do-pdf-do-com/issue.md) `[P]` `[US4]`
- [T040: Adicionar botão "Emitir Comprovante do Pedido" e integração de download na `OrderDetailPage`](T040-adicionar-botao-emitir-comprovante-do-pedido-/issue.md) `[US4]`

### Phase 6: Polish & Cross-Cutting Concerns

- [T041: Adicionar documentação OpenAPI/Swagger nos endpoints do `OrderController`](T041-adicionar-documentacao-openapi-swagger-nos-en/issue.md) `[P]`
- [T042: Adicionar item "Pedidos de Venda" no menu de navegação do frontend](T042-adicionar-item-pedidos-de-venda-no-menu-de-na/issue.md) `[P]`
- [T043: Executar validação completa do `quickstart.md` da Sprint 5 e documentar checklist](T043-executar-validacao-completa-do-quickstart-md-/issue.md)

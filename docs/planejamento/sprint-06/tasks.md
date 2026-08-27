# Tasks: Sprint 6 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code

**Feature**: `003-ordens-producao-qrcode`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-production-orders.md, research.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependências do ZXing no backend e html5-qrcode no frontend

- [ ] T001 Adicionar dependências `com.google.zxing:core:3.5.3` e `com.google.zxing:javase:3.5.3` no `backend/pom.xml`
- [ ] T002 [P] Adicionar dependência `html5-qrcode` no `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migration Flyway V10, Entidades JPA, Repositories e Enums

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão desta fase

- [ ] T003 Criar migration Flyway `backend/src/main/resources/db/migration/V10__create_production_orders_schema.sql` com tabelas `production_orders` e `production_order_histories`
- [ ] T004 [P] Criar enum `ProductionOrderStatus` (AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO) em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderStatus.java`
- [ ] T005 Criar entidade JPA `ProductionOrder` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrder.java`
- [ ] T006 Criar entidade JPA `ProductionOrderHistory` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderHistory.java`
- [ ] T007 [P] Criar repositório `ProductionOrderRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderRepository.java`
- [ ] T008 [P] Criar repositório `ProductionOrderHistoryRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderHistoryRepository.java`
- [ ] T009 Criar serviço gerador de imagens QR Code `QrCodeGeneratorService` usando ZXing em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/QrCodeGeneratorService.java`

**Checkpoint**: Base de persistência e gerador de QR Code prontos.

---

## Phase 3: User Story 1 - Geração de OPs Individuais por Peça (Priority: P1) 🎯 MVP

**Goal**: Decompor itens de um pedido de venda aprovado em Ordens de Produção individuais físicas com código sequencial `OP-YYYY-NNNN-XX`.

**Independent Test**: Gerar OPs para pedido com quantidade = 2 e confirmar criação de 2 OPs distintas no status AGUARDANDO_CORTE.

- [ ] T010 [P] [US1] Criar record `ProductionOrderResponse` com todos os dados da peça, cliente, status e datas em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderResponse.java`
- [ ] T011 [P] [US1] Criar record `ProductionOrderHistoryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderHistoryResponse.java`
- [ ] T012 [US1] Criar mapper MapStruct `ProductionOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/production/mapper/ProductionOrderMapper.java`
- [ ] T013 [US1] Implementar método `gerarOrdensDeProducao(Long orderId)` no `ProductionOrderService` decompondo cada item em $N$ OPs físicas e atualizando o status do Pedido para `EM_PRODUCAO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/ProductionOrderService.java`
- [ ] T014 [US1] Implementar métodos `buscarPorCodigo(String codigo)` e `listar(Pageable, status, orderId, busca)` no `ProductionOrderService`
- [ ] T015 [US1] Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`
- [ ] T016 [P] [US1] Criar testes unitários do `ProductionOrderService` para decomposição de itens em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/ProductionOrderServiceTest.java`

---

## Phase 4: User Story 2 - Emissão de Etiquetas com QR Code 100x50mm (Priority: P1) 🎯 MVP

**Goal**: Gerar PDF de etiquetas adesivas térmicas de 100x50mm contendo QR Code legível e informações da esquadria.

**Independent Test**: Gerar PDF de etiquetas e validar dimensões da página (100x50mm) e presença de QR Code.

- [ ] T017 [US2] Criar serviço `LabelPdfService` usando OpenPDF com tamanho de página 100x50mm, embutindo imagem gerada pelo `QrCodeGeneratorService`, logo, código da OP, cliente, descrição e medidas em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- [ ] T018 [US2] Adicionar endpoint GET /api/production-orders/order/{orderId}/labels-pdf no `ProductionOrderController` (retorna application/pdf)
- [ ] T019 [P] [US2] Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- [ ] T020 [US2] Adicionar botão "Imprimir Etiquetas com QR Code" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`)

---

## Phase 5: User Story 3 - Scanner de QR Code e Atualização de Status (Priority: P1) 🎯 MVP

**Goal**: Leitura de QR Code via câmera no frontend e transição de status da peça com 1 toque.

**Independent Test**: Bipar QR Code de uma OP em EM_CORTE, selecionar operador e transicionar para EM_MONTAGEM.

- [ ] T021 [P] [US3] Criar record `ProductionOrderTransitionRequest` (novoStatus, operadorNome, observacao) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderTransitionRequest.java`
- [ ] T022 [US3] Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido
- [ ] T023 [US3] Adicionar endpoint PATCH /api/production-orders/{id}/transition no `ProductionOrderController`
- [ ] T024 [P] [US3] Criar interfaces TypeScript e serviço de API Axios (`productionApi.ts`) em `frontend/src/features/production/services/productionApi.ts`
- [ ] T025 [US3] Criar hooks React Query (`useProductionOrders.ts`) em `frontend/src/features/production/hooks/useProductionOrders.ts`
- [ ] T026 [US3] Criar componente `QrScannerModal` com `html5-qrcode` para leitura via câmera traseira do dispositivo em `frontend/src/features/production/components/QrScannerModal.tsx`
- [ ] T027 [US3] Criar página `ProductionScannerPage` para operação rápida de chão de fábrica com bipagem e seleção de operador em `frontend/src/pages/ProductionScannerPage.tsx`
- [ ] T028 [US3] Criar página `ProductionOrderDetailPage` com ficha técnica completa da peça e histórico de etapas em `frontend/src/pages/ProductionOrderDetailPage.tsx`

---

## Phase 6: User Story 4 - Quadro Kanban de Acompanhamento da Fábrica (Priority: P2)

**Goal**: Visualizar o quadro Kanban de produção com colunas para cada estágio.

**Independent Test**: Visualizar peças distribuídas nas colunas de Corte, Montagem e Qualidade.

- [ ] T029 [US4] Criar componente `ProductionStatusBadge` em `frontend/src/features/production/components/ProductionStatusBadge.tsx`
- [ ] T030 [US4] Criar componente `ProductionOrderCard` em `frontend/src/features/production/components/ProductionOrderCard.tsx`
- [ ] T031 [US4] Criar componente `ProductionKanbanBoard` com colunas (Aguardando Corte, Corte, Montagem, CQ, Pronto) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- [ ] T032 [US4] Criar página `ProductionKanbanPage` com filtros de busca e botão de atalho para o Scanner em `frontend/src/pages/ProductionKanbanPage.tsx`
- [ ] T033 [US4] Configurar rotas `/producao`, `/producao/scanner`, `/producao/op/:codigo` no React Router em `frontend/src/App.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI, navegação e testes E2E

- [ ] T034 [P] Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger
- [ ] T035 [P] Adicionar atalhos de "Chão de Fábrica" e "Scanner QR" no menu lateral do frontend
- [ ] T036 Executar validação dos cenários de teste do `quickstart.md` da Sprint 6
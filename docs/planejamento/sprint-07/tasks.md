# Tasks: Sprint 7 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-cutting-lists.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Estruturação dos DTOs no backend

- [ ] T001 [P] Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`
- [ ] T002 [P] Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`
- [ ] T003 [P] Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`

---

## Phase 2: User Story 1 - Lista Consolidada de Corte do Pedido (Priority: P1) 🎯 MVP

**Goal**: Gerar a visão consolidada de corte com todas as peças do pedido agrupadas por tipo de material.

**Independent Test**: Consultar romaneio de corte de um pedido e verificar retorno das medidas e acabamentos de todas as peças.

- [ ] T004 [US1] Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- [ ] T005 [US1] Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`
- [ ] T006 [P] [US1] Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`
- [ ] T007 [US1] Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`
- [ ] T008 [US1] Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)

---

## Phase 3: User Story 2 - Ficha Técnica de Montagem por OP (Priority: P1) 🎯 MVP

**Goal**: Exibir detalhes de montagem, lado de abertura, ferragens e vidros por esquadria individual.

**Independent Test**: Consultar ficha técnica de uma OP e confirmar presença de lado de abertura e ferragens.

- [ ] T009 [US2] Implementar método `gerarFichaMontagem(Long productionOrderId)` no `CuttingListService`
- [ ] T010 [US2] Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController`
- [ ] T011 [US2] Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`
- [ ] T012 [US2] Integrar a visualização da Ficha Técnica na página de detalhes da OP (`ProductionOrderDetailPage.tsx`) e após leitura no scanner

---

## Phase 4: User Story 3 - Emissão de Romaneio de Oficina em PDF com Checkboxes (Priority: P2)

**Goal**: Gerar PDF A4 de oficina com OpenPDF contendo tabela de corte e caixas de visto manual para conferência.

**Independent Test**: Baixar PDF do romaneio e verificar diagramação das colunas "[ ] Cortado" e "[ ] Montado".

- [ ] T013 [US3] Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java`
- [ ] T014 [US3] Adicionar método para gerar PDF individual da Ficha Técnica da OP no `WorkshopPdfService`
- [ ] T015 [US3] Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`
- [ ] T016 [P] [US3] Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios
- [ ] T017 [US3] Adicionar botões de download do PDF na interface do frontend

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T018 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T019 Executar validação dos cenários de teste do `quickstart.md` da Sprint 7
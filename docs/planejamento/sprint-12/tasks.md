# Tasks: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes

**Feature**: `009-instalacoes-ordens-servico`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-service-orders.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V15, Entidades JPA, Repositories e Enums

- [ ] T001 Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`
- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`
- [ ] T003 [P] Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- [ ] T004 Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- [ ] T005 [P] Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`

---

## Phase 2: User Story 1 - Agendamento e Geração da OS (Priority: P1) 🎯 MVP

**Goal**: Agendar instalação com alocação de equipe e turno, gerando código sequencial `OS-YYYY-NNNN`.

**Independent Test**: Agendar OS para pedido pronto e constatar persistência no banco e status AGENDADA.

- [ ] T006 [P] [US1] Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/`
- [ ] T007 [US1] Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`
- [ ] T008 [US1] Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java`
- [ ] T009 [US1] Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java`
- [ ] T010 [P] [US1] Criar testes unitários do `ServiceOrderServiceTest`

---

## Phase 3: User Story 2 - Execução de Campo e Upload de Fotos no PWA (Priority: P1) 🎯 MVP

**Goal**: Atualizar status da OS em campo, anexar fotos de evidência e registrar recebedor da obra.

**Independent Test**: Enviar foto de conclusão de obra e transicionar status para CONCLUIDA.

- [ ] T011 [P] [US2] Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`
- [ ] T012 [US2] Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`
- [ ] T013 [US2] Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController`
- [ ] T014 [US2] Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`

---

## Phase 4: User Story 3 - Calendário Visual de Instalações (Priority: P2)

**Goal**: Grid de calendário mensal/semanal de agendamentos por equipe com alertas de sobreposição.

**Independent Test**: Consultar calendário e validar agrupamento de eventos por data e equipe.

- [ ] T015 [P] [US3] Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`
- [ ] T016 [US3] Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`
- [ ] T017 [US3] Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController`
- [ ] T018 [P] [US3] Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)
- [ ] T019 [US3] Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`
- [ ] T020 [US3] Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router

---

## Phase 5: User Story 4 - Emissão da OS de Campo em PDF (Priority: P2)

**Goal**: Gerar PDF A4 da Ordem de Serviço com termo de entrega técnica e espaço para assinatura.

**Independent Test**: Baixar PDF da OS e verificar endereço da obra, lista de esquadrias e termo de garantia.

- [ ] T021 [US4] Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`
- [ ] T022 [US4] Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`
- [ ] T023 [P] [US4] Criar teste unitário do `ServiceOrderPdfServiceTest`
- [ ] T024 [US4] Adicionar botão "Emitir OS em PDF" no frontend

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T025 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T026 [P] Adicionar atalho "Instalações & Agenda" no menu do frontend
- [ ] T027 Executar validação dos cenários de teste do `quickstart.md` da Sprint 12
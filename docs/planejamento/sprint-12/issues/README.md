# 📋 Issues da Sprint 12 — Instalações e Ordens de Serviço (OS)

Este diretório contém todas as **27 issues** detalhadas da Sprint 12 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`](T001-criar-package-br-edu-ifpb-alumigest-installat/issue.md)
- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`](T002-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T003: Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`](T003-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) `[P]`
- [T004: Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`](T004-criar-entidades-jpa-installationteam-serviceo/issue.md)
- [T005: Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`](T005-criar-repositorios-serviceorderrepository-ins/issue.md) `[P]`

### Phase 2: User Story 1 - Agendamento e Geração da OS (Priority: P1) 🎯 MVP

- [T006: Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/`](T006-criar-record-serviceordercreaterequest-e-serv/issue.md) `[P]` `[US1]`
- [T007: Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`](T007-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) `[US1]`
- [T008: Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java`](T008-implementar-servico-serviceorderservice-criar/issue.md) `[US1]`
- [T009: Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java`](T009-criar-endpoints-post-api-installation-service/issue.md) `[US1]`
- [T010: Criar testes unitários do `ServiceOrderServiceTest`](T010-criar-testes-unitarios-do-serviceorderservice/issue.md) `[P]` `[US1]`

### Phase 3: User Story 2 - Execução de Campo e Upload de Fotos no PWA (Priority: P1) 🎯 MVP

- [T011: Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`](T011-criar-record-serviceorderstatusupdaterequest-/issue.md) `[P]` `[US2]`
- [T012: Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`](T012-implementar-servico-de-upload-de-imagens-e-at/issue.md) `[US2]`
- [T013: Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController`](T013-criar-endpoints-patch-api-installation-servic/issue.md) `[US2]`
- [T014: Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`](T014-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) `[US2]`

### Phase 4: User Story 3 - Calendário Visual de Instalações (Priority: P2)

- [T015: Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`](T015-criar-record-calendareventresponse-em-backend/issue.md) `[P]` `[US3]`
- [T016: Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`](T016-implementar-servico-calendarservice-obtereven/issue.md) `[US3]`
- [T017: Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController`](T017-criar-endpoint-get-api-installation-service-o/issue.md) `[US3]`
- [T018: Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)](T018-criar-interfaces-typescript-e-servico-axios-i/issue.md) `[P]` `[US3]`
- [T019: Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`](T019-criar-componente-installationcalendar-no-fron/issue.md) `[US3]`
- [T020: Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router](T020-criar-pagina-installationcalendarpage-e-regis/issue.md) `[US3]`

### Phase 5: User Story 4 - Emissão da OS de Campo em PDF (Priority: P2)

- [T021: Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`](T021-criar-servico-serviceorderpdfservice-gerando-/issue.md) `[US4]`
- [T022: Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`](T022-adicionar-endpoint-get-api-installation-servi/issue.md) `[US4]`
- [T023: Criar teste unitário do `ServiceOrderPdfServiceTest`](T023-criar-teste-unitario-do-serviceorderpdfservic/issue.md) `[P]` `[US4]`
- [T024: Adicionar botão "Emitir OS em PDF" no frontend](T024-adicionar-botao-emitir-os-em-pdf-no-frontend/issue.md) `[US4]`

### Phase 6: Polish & Cross-Cutting Concerns

- [T025: Documentar endpoints no OpenAPI/Swagger](T025-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T026: Adicionar atalho "Instalações & Agenda" no menu do frontend](T026-adicionar-atalho-instalacoes-agenda-no-menu-d/issue.md) `[P]`
- [T027: Executar validação dos cenários de teste do `quickstart.md` da Sprint 12](T027-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

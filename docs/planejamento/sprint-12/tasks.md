# 📋 Lista de Tarefas (Tasks) — Sprint 12 — Gestão de Instalações, Agendamento e Execução em Campo (OS)

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-37: Agendar Instalação e Gerar Ordem de Serviço (OS)

> **Descrição**: Vincular pedidos prontos a equipes de instalação com agendamento de data, turno, endereço de obra e geração da Ordem de Serviço (OS).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-37.1** | [US-37.1](issues/US-37.1-criar-package-br-edu-ifpb-alumigest-installat/issue.md) Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation` | 🔲 Pendente |
| **US-37.2** | [US-37.2](issues/US-37.2-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos` | 🔲 Pendente |
| **US-37.3** | [US-37.3](issues/US-37.3-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | 🔲 Pendente |
| **US-37.4** | [US-37.4](issues/US-37.4-criar-entidades-jpa-installationteam-serviceo/issue.md) Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | 🔲 Pendente |
| **US-37.5** | [US-37.5](issues/US-37.5-criar-repositorios-serviceorderrepository-ins/issue.md) Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/` | 🔲 Pendente |
| **US-37.6** | [US-37.6](issues/US-37.6-criar-record-serviceordercreaterequest-e-serv/issue.md) Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/` | 🔲 Pendente |
| **US-37.7** | [US-37.7](issues/US-37.7-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java` | 🔲 Pendente |
| **US-37.8** | [US-37.8](issues/US-37.8-implementar-servico-serviceorderservice-criar/issue.md) Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java` | 🔲 Pendente |
| **US-37.9** | [US-37.9](issues/US-37.9-criar-endpoints-post-api-installation-service/issue.md) Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java` | 🔲 Pendente |
| **US-37.10** | [US-37.10](issues/US-37.10-criar-testes-unitarios-do-serviceorderservice/issue.md) Criar testes unitários do `ServiceOrderServiceTest` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-37.1**: Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`
- [ ] **US-37.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`
- [ ] **US-37.3**: Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- [ ] **US-37.4**: Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- [ ] **US-37.5**: Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`
- [ ] **US-37.6**: Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/`
- [ ] **US-37.7**: Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`
- [ ] **US-37.8**: Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java`
- [ ] **US-37.9**: Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java`
- [ ] **US-37.10**: Criar testes unitários do `ServiceOrderServiceTest`

---

## 📦 US-38: Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

> **Descrição**: Instalador acessa a OS no smartphone via PWA, realiza checklist de entrega, tira fotos do trabalho concluído e colhe assinatura do cliente.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-38.1** | [US-38.1](issues/US-38.1-criar-record-serviceorderstatusupdaterequest-/issue.md) Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse` | 🔲 Pendente |
| **US-38.2** | [US-38.2](issues/US-38.2-implementar-servico-de-upload-de-imagens-e-at/issue.md) Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService` | 🔲 Pendente |
| **US-38.3** | [US-38.3](issues/US-38.3-criar-endpoints-patch-api-installation-servic/issue.md) Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController` | 🔲 Pendente |
| **US-38.4** | [US-38.4](issues/US-38.4-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-38.1**: Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`
- [ ] **US-38.2**: Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`
- [ ] **US-38.3**: Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController`
- [ ] **US-38.4**: Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`

---

## 📦 US-39: Visualizar Calendário de Instalações e Prevenção de Conflitos

> **Descrição**: Calendário visual interativo com visão diária/semanal de equipes alocadas e detecção de sobreposição de horários.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-39.1** | [US-39.1](issues/US-39.1-criar-record-calendareventresponse-em-backend/issue.md) Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java` | 🔲 Pendente |
| **US-39.2** | [US-39.2](issues/US-39.2-implementar-servico-calendarservice-obtereven/issue.md) Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)` | 🔲 Pendente |
| **US-39.3** | [US-39.3](issues/US-39.3-criar-endpoint-get-api-installation-service-o/issue.md) Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController` | 🔲 Pendente |
| **US-39.4** | [US-39.4](issues/US-39.4-criar-interfaces-typescript-e-servico-axios-i/issue.md) Criar interfaces TypeScript e serviço Axios (`installationApi.ts`) | 🔲 Pendente |
| **US-39.5** | [US-39.5](issues/US-39.5-criar-componente-installationcalendar-no-fron/issue.md) Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx` | 🔲 Pendente |
| **US-39.6** | [US-39.6](issues/US-39.6-criar-pagina-installationcalendarpage-e-regis/issue.md) Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-39.1**: Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`
- [ ] **US-39.2**: Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`
- [ ] **US-39.3**: Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController`
- [ ] **US-39.4**: Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)
- [ ] **US-39.5**: Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`
- [ ] **US-39.6**: Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router

---

## 📦 US-40: Emitir Ordem de Serviço (OS) em PDF

> **Descrição**: Emitir a Ordem de Serviço em PDF com via para a equipe técnica e via de aceite do cliente.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-40.1** | [US-40.1](issues/US-40.1-criar-servico-serviceorderpdfservice-gerando-/issue.md) Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java` | 🔲 Pendente |
| **US-40.2** | [US-40.2](issues/US-40.2-adicionar-endpoint-get-api-installation-servi/issue.md) Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController` | 🔲 Pendente |
| **US-40.3** | [US-40.3](issues/US-40.3-criar-teste-unitario-do-serviceorderpdfservic/issue.md) Criar teste unitário do `ServiceOrderPdfServiceTest` | 🔲 Pendente |
| **US-40.4** | [US-40.4](issues/US-40.4-adicionar-botao-emitir-os-em-pdf-no-frontend/issue.md) Adicionar botão "Emitir OS em PDF" no frontend | 🔲 Pendente |
| **US-40.5** | [US-40.5](issues/US-40.5-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-40.6** | [US-40.6](issues/US-40.6-adicionar-atalho-instalacoes-agenda-no-menu-d/issue.md) Adicionar atalho "Instalações & Agenda" no menu do frontend | 🔲 Pendente |
| **US-40.7** | [US-40.7](issues/US-40.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 12 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-40.1**: Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`
- [ ] **US-40.2**: Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`
- [ ] **US-40.3**: Criar teste unitário do `ServiceOrderPdfServiceTest`
- [ ] **US-40.4**: Adicionar botão "Emitir OS em PDF" no frontend
- [ ] **US-40.5**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-40.6**: Adicionar atalho "Instalações & Agenda" no menu do frontend
- [ ] **US-40.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 12


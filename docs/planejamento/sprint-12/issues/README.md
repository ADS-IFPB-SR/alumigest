# 📌 Issues de Implementação — Sprint 12 — Gestão de Instalações, Agendamento e Execução em Campo (OS)

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-37: Agendar Instalação e Gerar Ordem de Serviço (OS)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-37.1](US-37.1-criar-package-br-edu-ifpb-alumigest-installat/issue.md) | Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation` | `sprint-12` | 🔲 Aberta |
| [US-37.2](US-37.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos` | `sprint-12` | 🔲 Aberta |
| [US-37.3](US-37.3-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) | Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | `sprint-12` | 🔲 Aberta |
| [US-37.4](US-37.4-criar-entidades-jpa-installationteam-serviceo/issue.md) | Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | `sprint-12` | 🔲 Aberta |
| [US-37.5](US-37.5-criar-repositorios-serviceorderrepository-ins/issue.md) | Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/` | `sprint-12` | 🔲 Aberta |
| [US-37.6](US-37.6-criar-record-serviceordercreaterequest-e-serv/issue.md) | Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/` | `sprint-12` | 🔲 Aberta |
| [US-37.7](US-37.7-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) | Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java` | `sprint-12` | 🔲 Aberta |
| [US-37.8](US-37.8-implementar-servico-serviceorderservice-criar/issue.md) | Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java` | `sprint-12` | 🔲 Aberta |
| [US-37.9](US-37.9-criar-endpoints-post-api-installation-service/issue.md) | Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java` | `sprint-12` | 🔲 Aberta |
| [US-37.10](US-37.10-criar-testes-unitarios-do-serviceorderservice/issue.md) | Criar testes unitários do `ServiceOrderServiceTest` | `sprint-12` | 🔲 Aberta |

## 📦 US-38: Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-38.1](US-38.1-criar-record-serviceorderstatusupdaterequest-/issue.md) | Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse` | `sprint-12` | 🔲 Aberta |
| [US-38.2](US-38.2-implementar-servico-de-upload-de-imagens-e-at/issue.md) | Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService` | `sprint-12` | 🔲 Aberta |
| [US-38.3](US-38.3-criar-endpoints-patch-api-installation-servic/issue.md) | Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController` | `sprint-12` | 🔲 Aberta |
| [US-38.4](US-38.4-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) | Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx` | `sprint-12` | 🔲 Aberta |

## 📦 US-39: Visualizar Calendário de Instalações e Prevenção de Conflitos

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-39.1](US-39.1-criar-record-calendareventresponse-em-backend/issue.md) | Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java` | `sprint-12` | 🔲 Aberta |
| [US-39.2](US-39.2-implementar-servico-calendarservice-obtereven/issue.md) | Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)` | `sprint-12` | 🔲 Aberta |
| [US-39.3](US-39.3-criar-endpoint-get-api-installation-service-o/issue.md) | Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController` | `sprint-12` | 🔲 Aberta |
| [US-39.4](US-39.4-criar-interfaces-typescript-e-servico-axios-i/issue.md) | Criar interfaces TypeScript e serviço Axios (`installationApi.ts`) | `sprint-12` | 🔲 Aberta |
| [US-39.5](US-39.5-criar-componente-installationcalendar-no-fron/issue.md) | Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx` | `sprint-12` | 🔲 Aberta |
| [US-39.6](US-39.6-criar-pagina-installationcalendarpage-e-regis/issue.md) | Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router | `sprint-12` | 🔲 Aberta |

## 📦 US-40: Emitir Ordem de Serviço (OS) em PDF

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-40.1](US-40.1-criar-servico-serviceorderpdfservice-gerando-/issue.md) | Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java` | `sprint-12` | 🔲 Aberta |
| [US-40.2](US-40.2-adicionar-endpoint-get-api-installation-servi/issue.md) | Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController` | `sprint-12` | 🔲 Aberta |
| [US-40.3](US-40.3-criar-teste-unitario-do-serviceorderpdfservic/issue.md) | Criar teste unitário do `ServiceOrderPdfServiceTest` | `sprint-12` | 🔲 Aberta |
| [US-40.4](US-40.4-adicionar-botao-emitir-os-em-pdf-no-frontend/issue.md) | Adicionar botão "Emitir OS em PDF" no frontend | `sprint-12` | 🔲 Aberta |
| [US-40.5](US-40.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-12` | 🔲 Aberta |
| [US-40.6](US-40.6-adicionar-atalho-instalacoes-agenda-no-menu-d/issue.md) | Adicionar atalho "Instalações & Agenda" no menu do frontend | `sprint-12` | 🔲 Aberta |
| [US-40.7](US-40.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 12 | `sprint-12` | 🔲 Aberta |


# 📌 Issues de Implementação — Sprint 12 — Gestão de Instalações, Execução em Campo (OS) e Agenda

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-31: Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-31.1](US-31.1-criar-package-br-edu-ifpb-alumigest-installat/issue.md) | Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation` | `backlog` | 🔲 Aberta |
| [US-31.2](US-31.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos` | `backlog` | 🔲 Aberta |
| [US-31.3](US-31.3-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) | Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | `backlog` | 🔲 Aberta |
| [US-31.4](US-31.4-criar-entidades-jpa-installationteam-serviceo/issue.md) | Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | `backlog` | 🔲 Aberta |
| [US-31.5](US-31.5-criar-repositorios-serviceorderrepository-ins/issue.md) | Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/` | `backlog` | 🔲 Aberta |
| [US-31.6](US-31.6-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) | Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java` | `backlog` | 🔲 Aberta |
| [US-31.7](US-31.7-criar-record-serviceorderstatusupdaterequest-/issue.md) | Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse` | `backlog` | 🔲 Aberta |
| [US-31.8](US-31.8-implementar-servico-de-upload-de-imagens-e-at/issue.md) | Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService` | `backlog` | 🔲 Aberta |
| [US-31.9](US-31.9-criar-endpoints-patch-api-installation-servic/issue.md) | Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController` | `backlog` | 🔲 Aberta |
| [US-31.10](US-31.10-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) | Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx` | `backlog` | 🔲 Aberta |
| [US-31.11](US-31.11-criar-testes-unitarios-do-serviceorderservice/issue.md) | Criar testes unitários do `ServiceOrderServiceTest` | `backlog` | 🔲 Aberta |

## 📦 US-32: Visualizar Calendário de Instalações e Prevenção de Conflitos

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-32.1](US-32.1-criar-record-calendareventresponse-em-backend/issue.md) | Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java` | `backlog` | 🔲 Aberta |
| [US-32.2](US-32.2-implementar-servico-calendarservice-obtereven/issue.md) | Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)` | `backlog` | 🔲 Aberta |
| [US-32.3](US-32.3-criar-endpoint-get-api-installation-service-o/issue.md) | Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController` | `backlog` | 🔲 Aberta |
| [US-32.4](US-32.4-criar-interfaces-typescript-e-servico-axios-i/issue.md) | Criar interfaces TypeScript e serviço Axios (`installationApi.ts`) | `backlog` | 🔲 Aberta |
| [US-32.5](US-32.5-criar-componente-installationcalendar-no-fron/issue.md) | Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx` | `backlog` | 🔲 Aberta |
| [US-32.6](US-32.6-criar-pagina-installationcalendarpage-e-regis/issue.md) | Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router | `backlog` | 🔲 Aberta |

## 📦 US-33: Emitir Ordem de Serviço (OS) em PDF

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-33.1](US-33.1-criar-servico-serviceorderpdfservice-gerando-/issue.md) | Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java` | `backlog` | 🔲 Aberta |
| [US-33.2](US-33.2-adicionar-endpoint-get-api-installation-servi/issue.md) | Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController` | `backlog` | 🔲 Aberta |
| [US-33.3](US-33.3-criar-teste-unitario-do-serviceorderpdfservic/issue.md) | Criar teste unitário do `ServiceOrderPdfServiceTest` | `backlog` | 🔲 Aberta |
| [US-33.4](US-33.4-adicionar-botao-emitir-os-em-pdf-no-frontend/issue.md) | Adicionar botão "Emitir OS em PDF" no frontend | `backlog` | 🔲 Aberta |
| [US-33.5](US-33.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-33.6](US-33.6-adicionar-atalho-instalacoes-agenda-no-menu-d/issue.md) | Adicionar atalho "Instalações & Agenda" no menu do frontend | `backlog` | 🔲 Aberta |
| [US-33.7](US-33.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 12 | `backlog` | 🔲 Aberta |

---

## 🚫 Tarefas Descartadas (Decisão de Escopo)
- As sub-tarefas de agendamento manual avulso da antiga US-37 (`US-31.6`, `US-31.8`, `US-31.9`) foram arquivadas em [descartadas/](descartadas/).

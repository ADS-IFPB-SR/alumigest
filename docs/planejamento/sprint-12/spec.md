# Feature Specification: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes

**Feature**: `009-instalacoes-ordens-servico`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Updated**: 2026-09-05 (Reestruturação de Escopo: Foco em Execução de Campo, Calendário e PDF)
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

A etapa final do ciclo de atendimento da Alumiportas consiste no transporte e instalação das esquadrias e vidros na obra do cliente.

Atualmente, o agendamento de instalações e a coordenação das equipes externas ocorrem via WhatsApp ou lousa física, gerando conflitos de horários, atrasos e falta de comprovação de entrega.

Esta sprint entrega:
1. **Infraestrutura e Acompanhamento de Campo no PWA (OS)**: Criação da estrutura de dados de Ordens de Serviço (`OS-YYYY-NNNN`), controle de equipes de instalação e atualização de status da OS em campo (`AGENDADA`, `EM_DESLOCAMENTO`, `EM_EXECUCAO`, `CONCLUIDA`, `REAGENDADA`), com upload de fotos do antes/depois e nome de quem recebeu a obra.
2. **Calendário e Agenda de Equipes de Instalação**: Alocação de equipes internas ou parceiras por turno (`MANHA`, `TARDE`, `INTEGRAL`) com prevenção visual de conflitos de agenda.
3. **Emissão da OS em PDF**: Documento para a equipe levar até a obra com termo de entrega e garantia.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-31: Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

> Criação da base estrutural de ordens de serviço e execução em campo pelo instalador via smartphone (PWA), realizando checklist de entrega, registro fotográfico do trabalho e identificação do recebedor da obra.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-31.1**: Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`
- **US-31.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`
- **US-31.3**: Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-31.4**: Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-31.5**: Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`
- **US-31.6**: Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`
- **US-31.7**: Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`
- **US-31.8**: Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`
- **US-31.9**: Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController`
- **US-31.10**: Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`
- **US-31.11**: Criar testes unitários do `ServiceOrderServiceTest`

### 📌 US-32: Visualizar Calendário de Instalações e Prevenção de Conflitos

> Calendário visual interativo com visão diária/semanal de equipes alocadas e detecção de sobreposição de horários.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-32.1**: Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`
- **US-32.2**: Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`
- **US-32.3**: Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController`
- **US-32.4**: Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)
- **US-32.5**: Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`
- **US-32.6**: Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router

### 📌 US-33: Emitir Ordem de Serviço (OS) em PDF

> Emitir a Ordem de Serviço em PDF com via para a equipe técnica e via de aceite do cliente.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-33.1**: Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`
- **US-33.2**: Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`
- **US-33.3**: Criar teste unitário do `ServiceOrderPdfServiceTest`
- **US-33.4**: Adicionar botão "Emitir OS em PDF" no frontend
- **US-33.5**: Documentar endpoints no OpenAPI/Swagger
- **US-33.6**: Adicionar atalho "Instalações & Agenda" no menu do frontend
- **US-33.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 12

---

## 3. Requisitos Funcionais

1. **RF01 - Cadastro de Equipes**: Nome da equipe, líder, membros e tipo (`PROPRIA` / `TERCEIRIZADA`).
2. **RF02 - Turnos de Agendamento**: `MANHA`, `TARDE`, `INTEGRAL`.
3. **RF03 - Máquina de Estados da OS**: `AGENDADA` → `EM_DESLOCAMENTO` → `EM_EXECUCAO` → `CONCLUIDA` (com suporte a `REAGENDADA` e `CANCELADA`).
4. **RF04 - Upload e Armazenamento de Fotos**: Upload de imagens JPG/PNG/WebP de evidência da instalação.
5. **RF05 - Calendário Integrado**: Visualização mensal/semanal de compromissos no frontend com código de cores por status.
6. **RF06 - Emissão em PDF**: Layout OpenPDF A4 com termo de entrega e garantia.

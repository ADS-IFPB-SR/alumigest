# Feature Specification: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes

**Feature**: `009-instalacoes-ordens-servico`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

A etapa final do ciclo de atendimento da Alumiportas consiste no transporte e instalação das esquadrias e vidros na obra do cliente.

Atualmente, o agendamento de instalações e a coordenação das equipes externas ocorrem via WhatsApp ou lousa física, gerando conflitos de horários, atrasos e falta de comprovação de entrega.

Esta sprint entrega:
1. **Ordens de Serviço de Instalação (OS)**: Criação de ordens de serviço (`OS-YYYY-NNNN`) vinculadas ao pedido, listando endereço completo, esquadrias prontas e ferramentas especiais.
2. **Cadastro e Agenda de Equipes de Instalação**: Alocação de equipes internas ou parceiras por turno (`MANHA`, `TARDE`, `INTEGRAL`) com prevenção visual de conflitos de agenda.
3. **Acompanhamento de Campo no PWA**: Atualização de status da OS (`AGENDADA`, `EM_DESLOCAMENTO`, `EM_EXECUCAO`, `CONCLUIDA`, `REAGENDADA`), com upload de fotos do antes/depois e nome de quem recebeu a obra.
4. **Sugestão Automática de Instalação**: Destaque automático no painel quando pedidos com taxa de instalação contratada tiverem sua fabricação concluída.
5. **Emissão da OS em PDF**: Documento para a equipe levar até a obra com termo de entrega e garantia.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-37: Agendar Instalação e Gerar Ordem de Serviço (OS)

> Vincular pedidos prontos a equipes de instalação com agendamento de data, turno, endereço de obra e geração da Ordem de Serviço (OS).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-37.1**: Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`
- **US-37.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`
- **US-37.3**: Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-37.4**: Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-37.5**: Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`
- **US-37.6**: Criar record `ServiceOrderCreateRequest` e `ServiceOrderResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/`
- **US-37.7**: Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`
- **US-37.8**: Implementar serviço `ServiceOrderService.criarOS(ServiceOrderCreateRequest request)` com validação de status do pedido e sugestão automática em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderService.java`
- **US-37.9**: Criar endpoints POST /api/installation/service-orders e GET /api/installation/service-orders no `ServiceOrderController` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/controller/ServiceOrderController.java`
- **US-37.10**: Criar testes unitários do `ServiceOrderServiceTest`

### 📌 US-38: Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

> Instalador acessa a OS no smartphone via PWA, realiza checklist de entrega, tira fotos do trabalho concluído e colhe assinatura do cliente.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-38.1**: Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`
- **US-38.2**: Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`
- **US-38.3**: Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController`
- **US-38.4**: Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`

### 📌 US-39: Visualizar Calendário de Instalações e Prevenção de Conflitos

> Calendário visual interativo com visão diária/semanal de equipes alocadas e detecção de sobreposição de horários.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-39.1**: Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`
- **US-39.2**: Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`
- **US-39.3**: Criar endpoint GET /api/installation/service-orders/calendar no `ServiceOrderController`
- **US-39.4**: Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)
- **US-39.5**: Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`
- **US-39.6**: Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router

### 📌 US-40: Emitir Ordem de Serviço (OS) em PDF

> Emitir a Ordem de Serviço em PDF com via para a equipe técnica e via de aceite do cliente.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-40.1**: Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`
- **US-40.2**: Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`
- **US-40.3**: Criar teste unitário do `ServiceOrderPdfServiceTest`
- **US-40.4**: Adicionar botão "Emitir OS em PDF" no frontend
- **US-40.5**: Documentar endpoints no OpenAPI/Swagger
- **US-40.6**: Adicionar atalho "Instalações & Agenda" no menu do frontend
- **US-40.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 12

## 3. Requisitos Funcionais

1. **RF01 - Cadastro de Equipes**: Nome da equipe, líder, membros e tipo (`PROPRIA` / `TERCEIRIZADA`).
2. **RF02 - Turnos de Agendamento**: `MANHA`, `TARDE`, `INTEGRAL`.
3. **RF03 - Máquina de Estados da OS**: `AGENDADA` → `EM_DESLOCAMENTO` → `EM_EXECUCAO` → `CONCLUIDA` (com suporte a `REAGENDADA` e `CANCELADA`).
4. **RF04 - Upload e Armazenamento de Fotos**: Upload de imagens JPG/PNG/WebP de evidência da instalação.
5. **RF05 - Calendário Integrado**: Visualização mensal/semanal de compromissos no frontend com código de cores por status.
6. **RF06 - Emissão em PDF**: Layout OpenPDF A4 com termo de entrega e garantia.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Equipes e Turnos)**: Cadastro estruturado de equipes + seleção de turno (Manhã, Tarde, Integral).
- **Q2 (Aceite na Obra)**: Nome do recebedor na obra + upload opcional de fotos do serviço concluído via PWA.
- **Q3 (Gatilho da OS)**: Sugestão automática de abertura de OS no painel quando a fábrica concluir um pedido com instalação contratada.
# Especificação Funcional: US-32 — Visualizar Calendário de Instalações e Prevenção de Conflitos

**Identificador**: `US-32`  
**Issue GitHub**: [#157](https://github.com/ADS-IFPB-SR/alumigest/issues/157)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como coordenador de operações e montagens da Alumiportas, desejo gerenciar um calendário visual de instalações (visão mês, semana e dia) com filtros por equipe e validação automática de sobreposição de turnos, assegurando que nenhuma equipe seja alocada simultaneamente em duas obras diferentes e garantindo a pontualidade na entrega dos projetos.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Renderização do Calendário Mensal com Eventos Coloridos**
  - **Dado que** o coordenador acessa a página `InstallationCalendarPage` (`/instalacoes`),
  - **Quando** o calendário carrega os agendamentos do mês vigente,
  - **Então** cada Ordem de Serviço agendada é exibida como um bloco com código da O.S. (`OS-YYYY-NNNN`), nome da equipe e cliente,
  - **E** as cores refletem o status da O.S.:
    - **Azul**: `SCHEDULED` (Agendada)
    - **Amarelo**: `IN_PROGRESS` (Em Andamento)
    - **Verde**: `COMPLETED` (Concluída)
    - **Vermelho**: `BLOCKED` (Com Impedimento)

- [ ] **Cenário 2: Prevenção Automática de Conflito de Equipe no Mesmo Turno**
  - **Dado que** a Equipe Alfa (`teamId = 1`) já possui uma O.S. agendada para `2026-10-20` no turno `MORNING`,
  - **Quando** o coordenador tenta agendar uma segunda O.S. para a mesma equipe, na mesma data e mesmo turno,
  - **Então** o sistema bloqueia o salvamento e retorna erro `TEAM_SCHEDULE_CONFLICT` (HTTP 409),
  - **E** a interface destaca visualmente o conflito, sugerindo horários alternativos ou outra equipe disponível.

- [ ] **Cenário 3: Reagendamento de O.S. via Modal ou Interação Direta**
  - **Dado que** uma instalação precisa ser adiada por solicitação do cliente,
  - **Quando** o coordenador altera a data ou o turno da O.S.,
  - **Então** o sistema valida se a nova data/turno está livre de conflitos,
  - **E** atualiza `scheduledDate` e `shiftType`, registrando o histórico de remarcação.

- [ ] **Cenário 4: Filtros Dinâmicos por Equipe e Região**
  - **Dado que** a empresa possui múltiplas equipes (internas e terceirizadas),
  - **Quando** o coordenador filtra por uma equipe específica no seletor de topo,
  - **Então** o calendário oculta os compromissos das demais equipes, exibindo apenas as instalações do time selecionado.

- [ ] **Cenário 5: Visualização Rápida de Detalhes da O.S. (Popover / Drawer)**
  - **Dado que** o usuário clica sobre um evento no calendário,
  - **Quando** o componente abre o card de detalhes,
  - **Então** exibe endereço completo, telefone de contato do cliente, relação de esquadrias a montar e botão direto para abrir a O.S. completa.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Invariante de Exclusividade de Equipe):** Uma equipe de instalação (`InstallationTeam`) não pode ter mais de uma O.S. ativa no mesmo dia e mesmo turno (`shiftType`).
- **RN-02 (Turnos Válidos):** Turnos permitidos: `MORNING` (Manhã: 07h30 às 12h00), `AFTERNOON` (Tarde: 13h30 às 18h00) e `FULL_DAY` (Integral: ocupa manhã e tarde simultaneamente).
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços com nomes em inglês: `CalendarEventResponse`, `teamId`, `scheduledDate`, `shiftType`, `hasConflict`, `teamName`, `clientName`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/installation/service-orders/calendar?year=2026&month=10&teamId=...` (eventos do mês)
  - `POST /api/v1/installation/service-orders/{id}/schedule` (agendamento com validação de conflito)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `InstallationCalendarPage.tsx` (`/instalacoes`)
  - `InstallationCalendar.tsx` (grid mensal/semanal)
  - `ScheduleConflictDialog.tsx` (modal de alerta de sobreposição)
  - `ServiceOrderQuickViewDrawer.tsx` (gaveta lateral com detalhes do agendamento)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `CalendarServiceTest` validando detecção estrita de conflitos para `MORNING`, `AFTERNOON` e `FULL_DAY`.
- [ ] Teste de integração do endpoint `/calendar` retornando eventos formatados com status e dados da equipe.
- [ ] Validação visual responsiva da grade do calendário em desktop e tablet.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-32.1](issues/US-32.1-criar-record-calendareventresponse-em-backend/issue.md) | Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java` | 🔲 No Backlog |
| [US-32.2](issues/US-32.2-implementar-servico-calendarservice-obtereven/issue.md) | Implementar serviço `CalendarService.obterEventosMes(int month, int year, Long teamId)` | 🔲 No Backlog |
| [US-32.3](issues/US-32.3-criar-endpoint-get-api-installation-service-o/issue.md) | Criar endpoint GET `/api/v1/installation/service-orders/calendar` no `ServiceOrderController` | 🔲 No Backlog |
| [US-32.4](issues/US-32.4-criar-interfaces-typescript-e-servico-axios-i/issue.md) | Criar interfaces TypeScript e serviço Axios (`installationApi.ts`) | 🔲 No Backlog |
| [US-32.5](issues/US-32.5-criar-componente-installationcalendar-no-fron/issue.md) | Criar componente `InstallationCalendar` no frontend com código de cores por status | 🔲 No Backlog |
| [US-32.6](issues/US-32.6-criar-pagina-installationcalendarpage-e-regis/issue.md) | Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-32-calendario-instalacoes`

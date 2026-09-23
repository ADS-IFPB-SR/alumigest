# Feature Specification: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes

**Feature**: `009-instalacoes-ordens-servico`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Reestruturação de Escopo: Foco em Execução de Campo, Calendário e PDF — Padrão BDD Gherkin)  

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

#### 🎯 Objetivo de Negócio
> **Como** instalador de campo da Alumiportas,  
> **Desejo** acessar a Ordem de Serviço pelo smartphone via PWA, atualizar o status do atendimento em tempo real, anexar fotos comprobatórias do serviço concluído e registrar o nome do recebedor na obra,  
> **Para que** a empresa comprove formalmente a entrega das esquadrias, resguarde-se contra contestações e encerre o ciclo de atendimento com agilidade.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Avanço do ciclo de vida da OS em campo**
  - **Dado que** o instalador possui a OS "OS-2026-0030" com status `AGENDADA`
  - **Quando** ele inicia o deslocamento até o local e clica em "Iniciar Deslocamento"
  - **Então** o status da OS passa para `EM_DESLOCAMENTO`
  - **E** ao chegar e começar a montagem, clica em "Iniciar Instalação" passando o status para `EM_EXECUCAO`
  - **E** cada transição de status registra carimbo de data/hora no backend.

- [ ] **Cenário 2: Anexo de fotos de vistoria e comprovação da obra**
  - **Dado que** a OS está com status `EM_EXECUCAO`
  - **Quando** o instalador aciona a câmera do celular no componente `FieldExecutionModal` e envia 2 fotografias (antes e depois)
  - **Então** o backend processa o upload via `POST /api/installation/service-orders/{id}/photos`
  - **E** armazena as imagens associando-as à OS com metadados de upload
  - **E** exibe as miniaturas das fotos anexadas imediatamente no modal.

- [ ] **Cenário 3: Conclusão da OS com identificação do recebedor da obra**
  - **Dado que** a instalação física foi finalizada
  - **Quando** o instalador informa o nome completo e documento (RG ou CPF) da pessoa que recebeu as esquadrias na obra e clica em "Finalizar Instalação"
  - **Então** o backend valida que há pelo menos 1 foto anexada e que o recebedor foi preenchido
  - **E** atualiza o status da OS para `CONCLUIDA`
  - **E** preenche `data_conclusao = LocalDateTime.now()`.

- [ ] **Cenário 4: Reagendamento de atendimento por impedimento no local**
  - **Dado que** a equipe compareceu à obra mas o local não estava liberado para instalação (ex: alvenaria molhada ou ausência do responsável)
  - **Quando** o instalador seleciona a opção "Reagendar", informa a nova data/turno e o motivo
  - **Então** a OS passa para o status `REAGENDADA` com histórico do motivo registrado para consulta do gestor.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Obrigatoriedade de Registro Fotográfico)**: Nenhuma OS pode ser concluída sem que ao menos uma foto comprobatória tenha sido enviada e persistida.
- **RN-02 (Identificação Formal de Aceite)**: A conclusão exige compulsoriamente o preenchimento do nome de quem recebeu a esquadria instalada na obra.
- **RN-03 (Compatibilidade PWA e Modo Responsivo)**: A tela de execução de campo deve ser otimizada para uso em telas sensíveis ao toque de smartphones, com botões amplos e suporte nativo ao seletor de câmera HTML5 (`capture="environment"`).

#### 🔌 Especificação Técnica
- **Backend**:
  - `ServiceOrderStatus` (Enum): `AGENDADA`, `EM_DESLOCAMENTO`, `EM_EXECUCAO`, `CONCLUIDA`, `REAGENDADA`, `CANCELADA`.
  - Entidades: `ServiceOrder`, `InstallationTeam`, `ServiceOrderPhoto`.
  - Migration Flyway `V15__create_service_orders_schema.sql`.
  - `ServiceOrderController`: Endpoints `PATCH /api/installation/service-orders/{id}/status` e `POST /api/installation/service-orders/{id}/photos`.
  - Testes unitários no `ServiceOrderServiceTest`.
- **Frontend**:
  - `FieldExecutionModal.tsx`: Modal interativo para atualização rápida de status, anexo de fotos e assinatura/nome do recebedor.
  - `useServiceOrder.ts`: Hooks React Query para mutação de status e upload multipart.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-31.1**: Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation`
- **US-31.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`
- **US-31.3**: Criar enums `ServiceOrderStatus`, `ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-31.4**: Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/`
- **US-31.5**: Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/`
- **US-31.6**: Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java`
- **US-31.7**: Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse`
- **US-31.8**: Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService`
- **US-31.9**: Criar endpoints `PATCH /api/installation/service-orders/{id}/status` e `POST /api/installation/service-orders/{id}/photos` no `ServiceOrderController`
- **US-31.10**: Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx`
- **US-31.11**: Criar testes unitários do `ServiceOrderServiceTest`

---

### 📌 US-32: Visualizar Calendário de Instalações e Prevenção de Conflitos

#### 🎯 Objetivo de Negócio
> **Como** coordenador de logística e atendimento da Alumiportas,  
> **Desejo** visualizar e gerenciar a agenda de instalações em um calendário interativo com divisão por equipes e turnos (Manhã, Tarde, Integral),  
> **Para que** eu possa distribuir eficientemente a carga de trabalho das equipes, evitar sobreposição de horários no mesmo cliente ou equipe e prevenir atrasos em obras.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Visualização do Calendário de Instalações por Mês e Semana**
  - **Dado que** existem Ordens de Serviço agendadas para diferentes equipes no mês
  - **Quando** o usuário acessa `/instalacoes`
  - **Então** o sistema exibe o componente `InstallationCalendar`
  - **E** cada agendamento é representado por um card colorido conforme seu status (`AGENDADA` em azul, `EM_EXECUCAO` em amarelo/laranja, `CONCLUIDA` em verde)
  - **E** o card exibe o código da OS, cliente, bairro e turno.

- [ ] **Cenário 2: Detecção e alerta visual de conflito de agenda**
  - **Dado que** uma equipe já possui uma OS alocada no turno `MANHA` do dia 25/09/2026
  - **Quando** o gestor tenta agendar outra OS para a mesma equipe no mesmo turno ou no turno `INTEGRAL`
  - **Então** o sistema emite um alerta visual de conflito: "Atenção: A equipe [Nome] já possui atendimento agendado para este turno"
  - **E** oferece a opção de confirmar a sobreposição extraordinária ou selecionar outra equipe disponível.

- [ ] **Cenário 3: Filtragem dinâmica de agendamentos por equipe de trabalho**
  - **Dado que** o gestor deseja visualizar a escala de uma equipe específica
  - **Quando** ele seleciona a equipe no filtro de topo
  - **Então** o calendário oculta os demais eventos e mantém visíveis apenas os compromissos da equipe filtrada.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Turnos de Atendimento)**: Os agendamentos são segmentados em 3 turnos: `MANHA` (08:00 às 12:00), `TARDE` (13:00 às 17:00) e `INTEGRAL` (08:00 às 17:00).
- **RN-02 (Prevenção de Conflito de Turno Integral)**: A alocação de turno `INTEGRAL` bloqueia a disponibilidade da equipe para os turnos `MANHA` e `TARDE` do mesmo dia.
- **RN-03 (Cores por Status)**: Padronização cromática nos eventos do calendário para rápido reconhecimento visual pelo operador.

#### 🔌 Especificação Técnica
- **Backend**:
  - `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`: Retorna lista de `CalendarEventResponse`.
  - `ServiceOrderController`: Endpoint `GET /api/installation/service-orders/calendar`.
- **Frontend**:
  - `InstallationCalendarPage.tsx`: Página central da agenda.
  - `InstallationCalendar.tsx`: Visualização de grade mensal/semanal responsiva.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-32.1**: Criar record `CalendarEventResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/dto/CalendarEventResponse.java`
- **US-32.2**: Implementar serviço `CalendarService.obterEventosMes(int mes, int ano, Long teamId)`
- **US-32.3**: Criar endpoint `GET /api/installation/service-orders/calendar` no `ServiceOrderController`
- **US-32.4**: Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)
- **US-32.5**: Criar componente `InstallationCalendar` no frontend com código de cores por status em `frontend/src/features/installation/components/InstallationCalendar.tsx`
- **US-32.6**: Criar página `InstallationCalendarPage` e registrar rota `/instalacoes` no React Router

---

### 📌 US-33: Emitir Ordem de Serviço (OS) em PDF

#### 🎯 Objetivo de Negócio
> **Como** equipe de instalação e encarregado operacional da Alumiportas,  
> **Desejo** emitir e imprimir a Ordem de Serviço (OS) em documento PDF formatado em folha A4 com os dados da obra, itens a instalar e termo formal de recebimento e garantia,  
> **Para que** a equipe de campo leve uma via impressa física para conferência na obra e colha a assinatura manual do cliente caso necessário.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Emissão do documento de Ordem de Serviço em PDF A4**
  - **Dado que** existe uma OS cadastrada "OS-2026-0030" vinculada a um pedido com 4 esquadrias
  - **Quando** o usuário clica em "Emitir OS em PDF" ou requisita `GET /api/installation/service-orders/{id}/pdf`
  - **Então** o sistema gera e inicia o download de um PDF A4 institucional
  - **E** o documento contém:
    1. Cabeçalho com dados da Alumiportas e código da OS
    2. Dados completos do cliente e endereço exato de entrega/instalação
    3. Equipe designada, data e turno do agendamento
    4. Relação completa das esquadrias (itens, modelos, medidas LxA mm e quantidades)
    5. Campo de observações e recomendações técnicas para a equipe
    6. Termo de Entrega e Garantia com campos para data e assinatura do cliente recebedor.

- [ ] **Cenário 2: Tratamento de requisição para OS inexistente**
  - **Dado que** é solicitada a geração de PDF para uma OS com ID inexistente
  - **Quando** a requisição for processada
  - **Então** o sistema retorna `404 Not Found` com mensagem amigável de erro.

- [ ] **Cenário 3: Experiência de download e impressão no Frontend**
  - **Dado que** o operador está visualizando a listagem ou detalhes de uma OS
  - **Quando** ele clica no botão "Imprimir OS"
  - **Então** o download do arquivo `os-OS-YYYY-NNNN.pdf` é efetuado de forma assíncrona com feedback de toast de sucesso.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Termo de Garantia Integrado)**: A OS em PDF deve obrigatoriamente incluir cláusula padrão de garantia legal de 90 dias sobre vedação e alinhamento de esquadrias.
- **RN-02 (Endereço Completo de Obra)**: O documento deve destacar de forma nítida pontos de referência e telefone de contato do cliente no local.
- **RN-03 (Padrão de Impressão Limpa)**: O layout A4 deve ser estruturado de forma a caber preferencialmente em uma única folha para pedidos comuns de até 6 itens.

#### 🔌 Especificação Técnica
- **Backend**:
  - `ServiceOrderPdfService`: Montagem do layout A4 via OpenPDF com tabelas e molduras.
  - `ServiceOrderController`: Endpoint `GET /api/installation/service-orders/{id}/pdf`.
  - Testes com JUnit 5 validando geração de bytes não vazios e integridade das seções do PDF.
- **Frontend**:
  - Botão de ação "Emitir OS em PDF" integrado em `InstallationCalendarPage.tsx` e modal de detalhes.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-33.1**: Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/installation/service/ServiceOrderPdfService.java`
- **US-33.2**: Adicionar endpoint `GET /api/installation/service-orders/{id}/pdf` no `ServiceOrderController`
- **US-33.3**: Criar teste unitário do `ServiceOrderPdfServiceTest`
- **US-33.4**: Adicionar botão "Emitir OS em PDF" no frontend
- **US-33.5**: Documentar endpoints no OpenAPI/Swagger
- **US-33.6**: Adicionar atalho "Instalações & Agenda" no menu do frontend
- **US-33.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 12

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Execução de OS no PWA | **US-31** | US-31.1 a US-31.9 | US-31.10 | US-31.11 (`ServiceOrderServiceTest`) |
| Calendário de Instalações | **US-32** | US-32.1, US-32.2, US-32.3 | US-32.4, US-32.5, US-32.6 | `InstallationCalendar.test.tsx`, `CalendarServiceTest` |
| Emissão de OS em PDF | **US-33** | US-33.1, US-33.2 | US-33.4, US-33.6 | US-33.3 (`ServiceOrderPdfServiceTest`) |

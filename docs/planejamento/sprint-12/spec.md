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

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Agendamento de Instalação e Geração da OS 🎯 MVP

**Como** Coordenador de Instalações da Alumiportas,
**Quero** agendar a instalação de um pedido concluído selecionando a equipe e a data/turno,
**Para que** a Ordem de Serviço seja gerada e alocada na agenda sem sobreposição de horários.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Agendamento de OS com equipe e turno
  Dado que um pedido "PED-2026-0001" está com status "CONCLUIDO"
  Quando o coordenador agenda para 22/09/2026 (Turno MANHA) com a "Equipe 1 - Carlos e Marcos"
  Então o sistema cria a OS "OS-2026-0001" no status "AGENDADA"
  E a OS aparece no calendário da Equipe 1
```

---

### User Story 2 (P1) — Execução e Conclusão da OS em Campo com Fotos (PWA) 🎯 MVP

**Como** Instalador de Campo,
**Quero** acessar a OS pelo smartphone, marcar "Iniciado" e ao finalizar anexar fotos e registrar o nome de quem recebeu a obra,
**Para que** a entrega técnica seja formalizada digitalmente.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Conclusão da instalação com fotos de evidência
  Dado que a OS "OS-2026-0001" está no status "EM_EXECUCAO"
  Quando o instalador aciona "Concluir Instalação", anexa 2 fotos e informa "Recebido por: Dr. Marcos"
  Então a OS passa para o status "CONCLUIDA"
  E as fotos ficam vinculadas permanentemente ao histórico do pedido
```

---

### User Story 3 (P2) — Calendário Visual de Instalações e Conflitos

**Como** Gerente Operacional,
**Quero** visualizar o calendário de todas as equipes com código de cores por status e alertas de conflito de turno,
**Para que** eu consiga organizar a frota e remanejar equipes rapidamente.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Alerta de conflito de horário na mesma equipe
  Dado que a Equipe 1 já possui uma instalação agendada para 22/09 no Turno MANHA
  Quando o coordenador tenta agendar outra OS para a mesma equipe e turno
  Então o sistema exibe aviso de conflito de agenda sugerindo outro turno ou equipe
```

---

### User Story 4 (P2) — Emissão da Ordem de Serviço em PDF

**Como** Instalador e Cliente,
**Quero** emitir a OS de Instalação em PDF A4 com termo de entrega e garantia,
**Para que** sirva como comprovante impresso de entrega técnica.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Download da OS em PDF
  Dado que uma OS existe
  Quando o usuário clica em "Emitir OS em PDF"
  Então o sistema gera um PDF A4 institucional contendo dados da obra, lista de esquadrias, instruções e espaço para visto
```

---

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
# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 07 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 13 de Outubro de 2026 (Segunda-feira) | **Horário:** 19:30 às 21:15  
**Local:** Reunião Virtual (Google Meet)  
**Redator:** Guilherme Kauã Matos da Silva — Tech Lead  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor & Engenheiro de Software*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor & DevOps*
* **Guilherme Kauã Matos da Silva** — *Tech Lead & Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura do ciclo de desenvolvimento da **Sprint 07** (Período: **13/10/2026 a 27/10/2026** — 14 dias), dando continuidade à **Release 2 (Gestão de Produção & Fábrica)**.
2. Definição e aprovação do Backlog da Sprint 07 no GitHub Projects, totalizando **10 Story Points** de escopo funcional (**27.0 horas estimadas** de desenvolvimento) distribuídos em **11 Fatias Verticais (*Thin Vertical Slices*)** com duração máxima de $\le 4\text{h}$ por tarefa.
3. Especificação técnica e dimensional para emissão de etiquetas adesivas térmicas (100x50mm) por exemplar físico de esquadria (`US-17 #142`), garantindo rastreabilidade no chão de fábrica e identificação clara de medidas, acabamento e vidro.
4. Concepção da esteira fabril visual através do Painel Kanban de Produção (`US-18 #143`) estruturado nas colunas `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO` e `CONCLUIDO`, com cálculo de urgência de prazos (SLA) e transições controladas com gravação de data de conclusão.
5. Estabelecimento da bateria de testes unitários para o motor OpenPDF e testes de integração REST com `MockMvc` para as rotas fabris.

---

## 3. 📋 Detalhamento do Backlog Selecionado (Sprint Backlog)

### 3.1 Visão Consolidada por Histórias de Usuário (PBL)

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Subtarefas / Fatias | Responsáveis Principais |
|---|---|:---:|:---:|:---:|---|
| **`US-17 #142`** | Emitir Etiquetas de Identificação de Peças por Item do Pedido | 5 pts | 9.0h | 4 fatias (US-17.1 a US-17.4) | Italo Jefferson, Guilherme Kauã |
| **`US-18 #143`** | Acompanhar Produção via Painel Kanban de Pedidos de Venda | 5 pts | 18.0h | 7 fatias (US-18.1 a US-18.7) | Maylson Rodrigues, Júlio Kennedy, Gabriel de Souza, Joseph Nichollas, Herbert Carvalho |
| **Total Planejado** | **Sprint Backlog Oficial** | **10 pts** | **27.0h** | **11 Fatias Verticais** | **Equipe Completa** |

---

### 3.2 Detalhamento Técnico das 11 Fatias Verticais (Sprint Issues)

| Subtarefa | Descrição Técnica da Fatia | Tipo / Escopo | Horas | Responsável Principal |
|:---:|---|---|:---:|---|
| **`US-17.1`** | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração sequencial | Backend Core / PDF | 3.0h | Italo Jefferson |
| **`US-17.2`** | Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no `OrderController` retornando documento `application/pdf` com cabeçalhos de download | Backend REST / API | 2.0h | Guilherme Kauã |
| **`US-17.3`** | Criar bateria de testes unitários do `LabelPdfService` validando geração de bytes, contagem de páginas por peças físicas e tratamento de exceções | Testes Unitários | 2.0h | Italo Jefferson |
| **`US-17.4`** | Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) com download via blob e feedback visual | Frontend UI / Ações | 2.0h | Júlio Kennedy |
| **`US-18.1`** | Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição fabril e preenchimento automático de `data_conclusao` | Backend Core / Regras | 3.0h | Gabriel de Souza |
| **`US-18.2`** | Criar hook React Query `useProductionKanban` e serviços Axios de produção (`productionApi.ts`) no frontend com cache reativo | Frontend State / API | 2.0h | Maylson Rodrigues |
| **`US-18.3`** | Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, indicador de prazo (urgência/SLA), contagem de peças e botões de avanço | Frontend UI / Cards | 3.0h | Joseph Nichollas |
| **`US-18.4`** | Criar componente `ProductionKanbanBoard` com colunas de status fabril (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e ações contextuais | Frontend UI / Kanban | 3.0h | Herbert Carvalho |
| **`US-18.5`** | Criar página `ProductionKanbanPage` com filtros de busca por código, cliente, período de entrega e métricas resumidas por estágio | Fatia Vertical Frontend | 3.0h | Maylson Rodrigues |
| **`US-18.6`** | Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend (`Sidebar.tsx`) | Frontend Routing / Nav | 1.0h | Júlio Kennedy |
| **`US-18.7`** | Documentar endpoints no OpenAPI/Swagger e implementar testes unitários e de integração no backend para transições de status fabril | Testes & Docs | 3.0h | Gabriel de Souza |

---

## 4. 🛡️ Acordos de Trabalho e Quality Gates da Sprint 07

1. **Padrão de Branch e PRs**: Branches individuais no padrão `feat/us-XX.Y-slug-resumido`, com PR obrigatório apontando para a branch `develop`.
2. **Qualidade SonarQube & Coverage**: Nenhuma classe de serviço ou controller nova pode ser mergeada sem testes unitários associados (meta de cobertura $\ge 80\%$).
3. **Padrão de Commit**: Seguir rigorosamente o padrão Conventional Commits em português do Brasil (`feat:`, `fix:`, `test:`, `docs:`).
4. **Alinhamento com o PO (Alumiportas)**: As etiquetas de 100x50 mm foram validadas pelo PO como o padrão exato das bobinas adesivas em operação na oficina física.

---

## 5. ✍️ Assinatura e Homologação da Ata

Ata aprovada em consenso por todos os participantes da Sprint Planning.


* **José Guylherme dos Santos Melo** — *Product Owner & Scrum Master*

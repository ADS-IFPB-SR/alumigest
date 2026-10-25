# 📝 ATA DE SPRINT REVIEW & RETROSPECTIVA — SPRINT 07

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Período avaliado:** 13 de outubro a 27 de outubro de 2026 (Consolidação em 25/10/2026)  
**Modalidade:** Híbrida / Alinhamento de Consolidação da Sprint  
**Registro:** Compilação da Sprint Review e Retrospectiva da Equipe  
**Branch de documentação:** `planejamento`  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Papéis

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Scrum Master*
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Avaliar a entrega do incremento da **Sprint 07 — Gestão Fabril (Release 2)**.
2. Analisar a situação final das histórias **US-17 (Etiquetas Térmicas)** e **US-18 (Painel Kanban de Produção)**.
3. Revisar as métricas de esforço planejado vs. realizado, burndown e DoD.
4. Apurar os resultados de testes e homologação técnica (Issue [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514) - `QA-05` e Issue [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474) - `US-17.5`).
5. Consolidar os pontos positivos e oportunidades de melhoria na retrospectiva da equipe.
6. Estabelecer o plano de ação preparatório para a Sprint 08.

---

## 3. 📦 Objetivo da Sprint 07

A **Sprint 07** consolidou a operacionalização da fábrica do AlumiGest (Release 2), conectando os pedidos de venda fechados na Sprint 06 à rotina física do chão de fábrica:

- **US-17 (#142):** Emissão de etiquetas adesivas térmicas de identificação por item e exemplar físico de esquadria, com suporte a layout industrial (100x60mm / 100x50mm), OpenPDF e renderizador nativo térmico BPLB/ZPL.
- **US-18 (#143):** Painel Kanban de acompanhamento da produção fabril com 3 colunas (`WAITING_PRODUCTION`, `IN_PRODUCTION`, `COMPLETED`), movimentação via Drag-and-Drop e botões contextuais, cálculo reativo de SLA/prazos, KPIs superiores e filtros dinâmicos.
- **Sustentação e Qualidade:** Tratamento de mais de 8 defeitos in-sprint, implantação da Merge Queue no CI/CD e garantia de suítes de testes unitários e E2E no Cypress.

---

## 4. 🖥️ Sprint Review — Resultados Apurados

### 4.1 Situação das Histórias e Subtarefas

| História / Demanda | Resultado Apurado | Situação GitHub |
|---|---|:---:|
| **US-17 (#142)** | Todas as subtarefas de desenvolvimento (`US-17.1` a `US-17.4`) e a suíte E2E (`US-17.5` / #474) foram entregues e validadas. Calibração realizada para impressora térmica Elgin L42. | 🟢 **100% Concluída** (PR #509 integrado em `develop`) |
| **US-18 (#143)** | As 7 fatias verticais (`US-18.1` a `US-18.7`) foram implementadas, cobrindo endpoint `PATCH`, hook `useProductionKanban`, card, board, tela e navegação. | 🟢 **100% Concluída** (PRs mesclados em `develop`) |
| **QA-05 (#514)** | Plano de testes integrado, validação de transições de status fabril, bloqueio de cancelados e relatório formal [RET](../003-teste/sprint-07/RET-Relatorio_Execucao_Testes_Sprint07.md). | 🟢 **Homologado** |
| **Defeitos In-Sprint** | Tratamento de 8 bugs identificados durante testes (#484, #485, #486, #487, #492, #493, #498, #500, #501). | 🟢 **Corrigidos & Integrados** |

**Resumo Quantitativo:** 11 fatias verticais planejadas + 1 subtarefa E2E + 1 plano de homologação QA = **100% de conclusão do escopo**.

### 4.2 Incrementos Entregues

1. **Geração e Impressão de Etiquetas Térmicas (US-17):**
   - Serviço OpenPDF com paginação automática por quantidade de peças físicas (`LabelPdfService`).
   - Renderizador nativo térmico em linguagem BPLB (`ThermalLabelBplbRenderer`) e PDF (`ThermalLabelPdfRenderer`).
   - Modal interativo (`ThermalLabelModal.tsx`) na tela de detalhes do pedido com seleção de formato e filtros de download.
   - Bloqueio de emissão de etiquetas para pedidos cancelados (`CANCELLED`) retornando HTTP 422.

2. **Esteira de Produção & Painel Kanban (US-18):**
   - Endpoint `PATCH /api/orders/{id}/production-status` com preenchimento automático de `completion_date` com timezone de Brasília (`America/Sao_Paulo`).
   - Máquina de estados estrita proibindo saltos ilegais de etapas.
   - Interface Kanban reativa com 3 colunas e atualização instantânea de contadores.
   - Cards de produção com indicação visual de urgência de prazo (Verde $>3$ dias, Amarelo $0$ a $3$ dias, Vermelho atrasado), contagem correta de peças e botões de avanço.
   - Filtros dinâmicos na `ProductionKanbanPage.tsx` e inclusão do atalho no `Sidebar.tsx`.

3. **Automação de Testes e CI/CD:**
   - Suíte Cypress E2E para etiquetas térmicas (`us17_5_etiquetas_identificacao_termica.cy.ts`).
   - Suíte Cypress E2E com 7 cenários do painel Kanban (`us18_painel_kanban_producao.cy.ts`).
   - Testes unitários para `ProductionKanbanMetrics` e hook de produção.
   - Ativação da **Merge Queue** no repositório para evitar conflitos concorrentes em `develop`.

---

## 5. 🔄 Retrospectiva da Equipe

### 5.1 O que funcionou muito bem (Pontos Fortes)
* **Comunicação e Alinhamento Contínuo:** A realização consistente das Dailies e o registro no modelo Docs-as-Code permitiram identificar bloqueios rapidamente.
* **Trabalho em Pares e Resolução Ágil de Bugs:** A equipe tratou mais de 8 defeitos in-sprint sem comprometer as metas principais da release.
* **Fatiamento Vertical:** A estratégia de fatias verticais finas ($\le 4\text{h}$) facilitou a integração contínua e a testabilidade das entregas.
* **Qualidade e Cobertura:** Adoção de suítes completas de E2E com Cypress antes do fechamento formal da sprint.

### 5.2 O que pode ser melhorado (Oportunidades de Evolução)
* **Dependência de PRs Base:** No início da segunda semana (19/10), integrantes relataram bloqueios temporários aguardando aprovação e mesclagem de PRs fundamentais.
* **Ambiente de Testes Físicos:** Dificuldade pontual de sincronia para testes físicos na impressora térmica Elgin L42. Recomenda-se manter ambiente mockado de comandos de porta serial/impressora.
* **Complexidade de Drag-and-Drop:** Ajustes finos no DnD na mesma coluna geraram retrabalho que poderia ter sido antecipado na fase de refinamento técnico.

---

## 6. 🎯 Plano de Ação para a Sprint 08

| Ação de Melhoria | Responsável | Prazo |
|---|:---:|:---:|
| Reduzir o tempo de fila de revisão de PRs estruturais para menos de 24h | Tech Lead & Revisores | Sprint 08 |
| Isolar completamente lógica de hardware/impressoras através de emulador/driver mock | Backend Team | Sprint 08 |
| Iniciar o refinamento detalhado da US-47 (Central 360° do Cliente) e venda de partes | PO & Arquitetura | Planejamento 08 |

---

## 7. 📌 Parecer de Conclusão

A **Sprint 07** cumpriu integralmente seu papel de viabilizar a esteira produtiva do AlumiGest, atingindo a homologação técnica da **Release 2**. O incremento foi auditado, coberto por testes automatizados e encontra-se integrado e pronto para implantação.

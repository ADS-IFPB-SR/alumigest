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
| **Bugs de Homologação de Campo (PO)** | 2 defeitos de usabilidade/layout identificados em testes manuais exploratórios pelo PO ([#524](https://github.com/ADS-IFPB-SR/alumigest/issues/524) e [#525](https://github.com/ADS-IFPB-SR/alumigest/issues/525)) registrados formalmente no GitHub Projects. | 🟡 **Abertos / Triados para Fix** |

**Resumo Quantitativo:** 11 fatias verticais planejadas + 1 subtarefa E2E + 1 plano de homologação QA + 10 defeitos mapeados (8 corrigidos in-sprint e 2 triados pelo PO) = **100% de conclusão do escopo da Release 2**.

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

### 5.1 🗣️ Relatos Individuais dos Membros da Equipe

| Integrante | O que foi Bom / Pontos Positivos | O que pode Melhorar / Pontos Negativos |
|---|---|---|
| **Guilherme Kauã** | Bom volume de tasks distribuídas, o que viabilizou maior ritmo de desenvolvimento e conserto de bugs. | Tarefas que ficaram bloqueadas aguardando alguém finalizar uma dependência demorada. |
| **Joseph Nichollas** | — | Pessoas retendo tasks por tempo excessivo bloqueando as demais; bugs documentados que não se reproduziam/existiam; PRs abertos por muito tempo (revisados com alterações pendentes). |
| **Italo Jefferson** | Boa participação geral da equipe; o fato de o protótipo ter sido concebido antes facilitou e acelerou muito a implementação. | Demora na aprovação e merge dos Pull Requests. |
| **Maylson da Silva** | Boa comunicação do time e excelente organização dos cards no quadro. | Tasks que travam umas às outras por dependência direta (sem maior gravidade, mas gera gargalo). |
| **Herbert Carvalho** | Atuação focada na sustentação e correção pontual de defeitos durante a sprint. | Pouca participação nas tarefas centrais de desenvolvimento de features novas. |
| **José Guylherme (PO)** | Testes manuais exploratórios em homologação de campo garantiram a detecção precoce de anomalias reais de layout (#524 e #525) antes da entrada em produção; 100% dos testes automatizados aprovados. | Necessidade de reduzir o tempo de feedback entre revisões de PRs e alinhamento de critérios de bug. |

---

### 5.2 🌟 Síntese dos Pontos Fortes (O que funcionou muito bem)
* **Comunicação, Alinhamento e Organização:** Comunicação fluida da equipe, realização diária de Dailies e excelente organização dos cards no GitHub Projects/ZenHub.
* **Prototipação Prévia como Acelerador:** A elaboração de protótipos prévios reduziu ambiguidades e destravou a codificação das telas e componentes.
* **Bom Volume e Ritmo de Entregas:** Alto volume de fatias verticais concluídas, possibilitando evolução sólida de código novo e resolução ágil de defeitos.
* **Homologação e Testes Exploratórios:** Validação funcional direta pelo PO identificou problemas reais de usabilidade antes do release final.
* **Cobertura Automatizada Robusta:** 1.765 testes automatizados aprovados (882 Backend + 883 Frontend + 11 Cypress E2E), atingindo 100% de sucesso.

---

### 5.3 ⚠️ Síntese das Oportunidades de Evolução (O que pode ser melhorado)
* **Gargalos de Dependência e Retenção de Tarefas:** Tarefas críticas retidas por muito tempo acabaram bloqueando fatias verticais subsequentes de outros desenvolvedores.
* **Fila de Revisão e Ciclo de Vida dos PRs:** Pull Requests ficaram aguardando revisão ou aprovação de correções por tempo excessivo.
* **Triagem e Critérios de Abertura de BUGs:** Relato de apontamentos de bugs que não existiam ou não se reproduziam, demandando tempo desnecessário de análise da equipe.
* **Distribuição de Carga:** Necessidade de balancear melhor a distribuição entre desenvolvimento de novas histórias e tarefas exclusivas de correção de bugs.
* **Validação de Layout em Alta Densidade:** Ausência de scroll vertical no Kanban quando há muitas ordens de serviço acumuladas.

---

## 6. 🎯 Plano de Ação para a Sprint 08

Com base direta nos depoimentos da retrospectiva, a equipe acordou os seguintes compromissos:

| Ação de Melhoria | Origem / Motivação | Responsável | Prazo |
|---|---|:---:|:---:|
| **SLA de Revisão de PRs ($\le 24\text{h}$):** Priorizar a revisão e o tratamento de apontamentos de PRs antes de puxar tarefas novas | Feedbacks de Joseph, Italo e Guilherme Kauã | Tech Lead & Revisores | Sprint 08 |
| **Mitigação de Bloqueios de Tasks:** Desacoplar fatias verticais e sinalizar imediatamente bloqueios na Daily se uma task passar de 24h sem progresso | Feedbacks de Guilherme Kauã, Maylson e Joseph | Scrum Master (Maylson) | Sprint 08 |
| **Critério Estrito para Abertura de BUGs:** Toda issue de bug deve conter passo a passo de reprodução e evidência (vídeo/print) antes da atribuição | Feedback de Joseph Nichollas | PO & Equipe de QA | Sprint 08 |
| **Correção dos Bugs #524 (Sidebar) e #525 (Scroll Kanban):** Eliminar a duplicidade de menu e habilitar scroll independente no Kanban | Homologação do PO | Equipe Frontend | Sprint 08 (Imediato) |
| **Transição de Liderança Ágil:** Maylson assume como Scrum Master oficial e José Guylherme atua dedicado como Product Owner (PO) | Governança da Sprint 08 | Maylson & Guylherme | Sprint 08 |
| **Equilíbrio no Backlog:** Garantir participação de todos os membros nas fatias da US-46 e US-47 | Feedback de Herbert Carvalho | Scrum Master & PO | Sprint 08 |

---

## 7. 📌 Parecer de Conclusão

A **Sprint 07** cumpriu integralmente seu papel de viabilizar a esteira produtiva do AlumiGest, atingindo a homologação técnica da **Release 2**. O incremento foi auditado, coberto por testes automatizados e encontra-se integrado e pronto para implantação.

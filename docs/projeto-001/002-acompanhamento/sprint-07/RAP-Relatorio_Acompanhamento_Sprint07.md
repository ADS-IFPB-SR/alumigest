# 📊 RAP — Relatório de Acompanhamento — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (14 dias) — **🟢 Concluída (100% Entregue em 25/10/2026)** |
| **Scrum Master / PO** | José Guylherme dos Santos Melo — Product Owner & Scrum Master |
| **Tech Lead** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 1.0 (Homologado com Dados Reais do GitHub Projects) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📊 Resumo Executivo

A **Sprint 07** compreendeu o período de **13/10/2026 a 27/10/2026**, totalizando **15 Story Points** distribuídos entre as demandas da esteira fabril (**US-17** e **US-18**), subtarefas de testes automatizados e o plano de homologação integrada (**QA-05 / Issue [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514)**).

Foram entregues com sucesso **100% dos Story Points planejados (taxa de conclusão de 100%)**, consolidando o marco da **Release 2 (Gestão de Produção & Fábrica)** do AlumiGest. O ciclo operacional conecta com fidelidade os pedidos de venda formalizados na Sprint 06 à identificação física das esquadrias por etiqueta adesiva térmica e ao acompanhamento dinâmico das etapas construtivas no painel Kanban.

Durante a iteração, a equipe absorveu e solucionou **8 defeitos técnicos e de usabilidade (BUGs)** em paralelo ao escopo planejado, mantendo o índice de qualidade e estabilizando as suítes E2E no Cypress.

---

## 2. 📋 Entregas Realizadas vs. Planejadas

| Demanda / Subtarefa | Escopo / Módulo | Story Points | Horas Estimadas | Executor Real (GitHub) | PR no GitHub | Status de Entrega | Evidência Técnica |
|---|---|:---:|:---:|---|---|:---:|---|
| **`US-17.1`** | Serviço `LabelPdfService` via OpenPDF | 1 pt | 3.0h | **Italo Jefferson** | PR #448 / #463 | ✅ **Entregue** | Layout térmico 100x60mm, paginação por peça física e fração de folhas |
| **`US-17.2`** | Endpoint `GET /api/orders/{id}/labels-pdf` | 1 pt | 2.0h | **Guilherme Kauã** | PR #449 / #465 | ✅ **Entregue** | Resposta HTTP 200 `application/pdf` com cabeçalho de download |
| **`US-17.3`** | Testes unitários do `LabelPdfService` | 1 pt | 2.0h | **Italo Jefferson** | PR #448 / #463 | ✅ **Entregue** | Validação de geração de bytes e totalização de páginas |
| **`US-17.4`** | Botão "Imprimir Etiquetas" na UI | 1 pt | 2.0h | **Júlio Kennedy** | PR #451 / #470 | ✅ **Entregue** | `OrderDetailPage.tsx`, modal de formatos e feedback de loading |
| **`US-17.5`** (#474) | Testes E2E Cypress de Etiquetas Térmicas | 1 pt | 3.0h | **Italo Jefferson** | PR #474 | ✅ **Entregue** | 4 cenários E2E aprovados em `us17_5_etiquetas_identificacao_termica.cy.ts` |
| **`US-18.1`** | Endpoint `PATCH` de status fabril | 1 pt | 3.0h | **José Guylherme** | PR #452 / #472 | ✅ **Entregue** | Máquina de estados e gravação de `completion_date` com timezone SP |
| **`US-18.2`** | Hook React Query `useProductionKanban` | 1 pt | 2.0h | **Gabriel Souza** *(Testes: Italo J.)* | PR #453 / #488 / #507 | ✅ **Entregue** | Gerenciamento de estado, cache e invalidação reativa |
| **`US-18.3`** | Componente `OrderProductionCard` | 1 pt | 3.0h | **Maylson Rodrigues** | PR #454 / #471 | ✅ **Entregue** | Card com contagem real de peças, tags e badges de SLA (urgência) |
| **`US-18.4`** | Componente `ProductionKanbanBoard` | 1 pt | 3.0h | **Júlio Kennedy** | PR #455 / #482 | ✅ **Entregue** | Quadro 3 colunas, DnD e ações contextuais de avanço |
| **`US-18.5`** | Página `ProductionKanbanPage` com filtros | 1 pt | 3.0h | **Joseph Nichollas** | PR #456 / #505 | ✅ **Entregue** | Rota `/producao`, busca instantânea por cliente, código e período |
| **`US-18.6`** | Navegação e atalho no `Sidebar.tsx` | 1 pt | 1.0h | **Guilherme Kauã** | PR #457 / #508 | ✅ **Entregue** | Rota integrada e badge de navegação lateral |
| **`US-18.7`** | OpenAPI e testes de transição fabril | 1 pt | 3.0h | **Maylson Rodrigues** *(Italo J.)* | PR #481 | ✅ **Entregue** | Contrato Swagger e testes MockMvc no backend |
| **`QA-05`** (#514) | Homologação Integrada da Gestão Fabril | 3 pts | 5.0h | **Equipe AlumiGest** | Issue #514 | ✅ **Entregue** | Relatório formal de testes [RET](../../projeto-001/003-teste/sprint-07/RET-Relatorio_Execucao_Testes_Sprint07.md) homologado |
| **Total** | **Iteração Sprint 07** | **15 pts** | **~35.0h** | **Equipe Completa** | — | 🟢 **100% Entregue** | **Release 2 homologada com sucesso** |

---

## 3. 🐞 Defeitos e Impedimentos Tratados na Sprint

1. **BUG #484 (Corrigido):** Backend permitia emissão de etiquetas para ordens canceladas. Corrigido com validação estrita retornando HTTP 422.
2. **BUG #485 (Corrigido):** Falha ao desserializar payload de erro retornado em formato Blob no frontend. Corrigido via PR #491.
3. **BUG #486 (Corrigido):** Divergência na ordenação das peças na listagem vs. etiquetas físicas. Corrigido via PR #494.
4. **BUG #487 (Corrigido):** Botão "Baixar PDF" no `ThermalLabelModal` ignorava os filtros ativos de peças. Corrigido via PR #497.
5. **BUG #492 / #493 (Corrigidos):** Problemas de formatação e quebra de linha nas dimensões da etiqueta para impressora Elgin L42. Corrigidos com implementação do renderizador BPLB via PR #495.
6. **BUG #498 (Corrigido):** Drag-and-drop de card na mesma coluna do Kanban disparava requisição PUT redundante gerando erro 422. Corrigido com guarda condicional no frontend.
7. **BUG #500 (Corrigido):** Card de produção exibia o número de linhas de itens em vez do somatório total de peças físicas da ordem. Corrigido com cálculo ponderado no card.
8. **BUG #501 (Corrigido):** Badge visual "Atrasado" permanecia visível para ordens já concluídas (`COMPLETED`). Corrigido no `OrderProductionCard.tsx`.

---

## 4. 📈 Indicadores de Produtividade da Sprint 07

* **Story Points Planejados:** 15 pts
* **Story Points Concluídos:** 15 pts (**Taxa de Conclusão: 100%**)
* **Horas Estimadas Totais:** ~35.0h
* **Fatias Verticais Entregues:** 11 fatias + 1 task E2E + 1 plano QA
* **Bugs Resolvidos In-Sprint:** 8 (#484, #485, #486, #487, #492, #493, #498, #500, #501)
* **Homologação QA:** Issue [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514) (QA-05) aprovada com 100% dos testes E2E e unitários.
* **Release:** Release 2 (v2.0.0 — Gestão Fabril) homologada.

---

## 5. 🎯 Avaliação do Burndown e Conclusão

O gráfico de burndown da Sprint 07 ([BRD-Burndown_Sprint07.md](BRD-Burndown_Sprint07.md)) demonstrou trajetória linear e sustentável:
- A primeira semana (13/10 a 16/10) cobriu o scaffolding do backend e a esteira de etiquetas térmicas.
- A segunda semana (19/10 a 23/10) concentrou a entrega da US-18, refinamentos de UI do Kanban e o tratamento dos bugs da impressora térmica.
- A estabilização final (24/10 a 25/10) garantiu a execução de todas as suítes automatizadas de teste e a documentação completa dos artefatos de governança.

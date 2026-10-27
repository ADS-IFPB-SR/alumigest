# BRD — Burndown Chart — Sprint 07 (Concluída)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (14 dias) — **Situação em 23/10/2026 (D11 — Concluída)** |
| **Fonte dos Dados** | GitHub Projects / ZenHub Board (`label:sprint-07`) |
| **Total de Story Points Planejados** | 10 pts (US-17: 5 pts + US-18: 5 pts) |
| **Total de Horas Estimadas** | 27.0h (11 Fatias Verticais) |
| **Pontos Concluídos** | 10 pts (US-17: 5 pts + US-18: 5 pts — 100% Entregue) |
| **Pontos Restantes** | 0 pts (0.0h restantes) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📈 Gráfico e Evolução da Queima de Pontos

O ciclo da Sprint 07 compreendeu 14 dias com foco inicial na emissão de etiquetas técnicas (US-17) e no Painel Kanban fabril (US-18), com entrega de 100% dos pontos em D11:

```
Story Points Restantes
10 | * (13/10 - Início com 10 pts: US-17 e US-18)
 9 |   *
 8 |     * * (US-17.1 e US-17.2: Backend OpenPDF e REST implementados)
 7 |         *
 6 |           * (US-17.3 e US-17.4: Testes unitários e botão no frontend)
 5 |             * * * (21/10 - D09: US-17 concluída e integrada)
 3 |                   * (22/10 - D10: US-18.1 a US-18.4 concluídas)
 0 |                     * (23/10 - D11: US-18.5 a US-18.7 concluídas e integradas no GitHub)
 0 +-------------------------------------------------
     D1  D3  D5  D7  D9  D11 D13 D14 (Dias da Sprint)
```
*(Legenda: `*` histórico real de queima até conclusão em D11)*

---

## 2. 📋 Histórico Diário de Queima (Burndown Diário)

| Data | Dia | Pontos Restantes | Horas Restantes | Itens Concluídos / Marcos da Sprint |
|:---:|:---:|:---:|:---:|:---|
| 13/10 | D01 | 10 pts | 27.0h | Início da Sprint 07: Planning oficial e refinamento das 11 fatias verticais |
| 14/10 | D02 | 10 pts | 25.0h | Abertura dos branches da US-17; correção do status `CREATED` e transição fabril (PR #461) |
| 15/10 | D03 | 8 pts | 22.0h | **`US-17.1` concluída:** Motor OpenPDF gerando etiquetas no tamanho térmico (PR #463); ordenação O.S. (PR #464) |
| 16/10 | D04 | 7 pts | 20.0h | **`US-17.2` concluída:** Endpoint `GET /api/orders/{orderId}/labels-pdf` (PR #465); rotas legadas e aliases (PR #466, #469) |
| 17/10 | D05 | 6 pts | 18.0h | **`US-17.3` e `US-17.4` concluídas:** Testes unitários e botão na UI (PR #470); endpoint `PATCH /production-status` (PR #472) |
| 19/10 | D07 | 5 pts | 18.0h | **US-17 tecnicamente integrada (5 pts):** Homologação em fábrica e abertura dos bugs de etiquetas (#483 a #487); Kanban Board UI (PR #482) |
| 20/10 | D08 | 5 pts | 16.0h | Resolução in-sprint dos bugs #485 (PR #491) e #486 (PR #494); correções de endereço e pagamento (PR #479, #480); canal OUTRO (PR #489); abertura dos bugs térmicos #492 e #493 |
| 21/10 | D09 | 5 pts | 14.0h | PR #495 em revisão de código; avanço na esteira do Kanban de produção |
| 22/10 | D10 | 3 pts | 6.0h | **`US-18.1`, `US-18.2`, `US-18.3` e `US-18.4` concluídas:** endpoint de status, hook TanStack Query, cards de produção e quadro Kanban com colunas fabris |
| 23/10 | D11 | **0 pts** | **0.0h** | **🟢 Conclusão Técnica das Fatias da Sprint 07:** `US-18.5` (página Kanban e filtros), `US-18.6` (rota e menu lateral PR #508) e `US-18.7` (OpenAPI e testes) concluídas e mescladas. US-17 integrada via PR #509 e US-18 100% entregue no GitHub |
| 26/10 | D14 | **0 pts** | **0.0h** | **Homologação Integrada (QA-05 / #514):** Testes manuais exploratórios conduzidos pelo PO (José Guylherme) validando orçamentos, O.S., etiquetas e Kanban. Identificação e registro formal dos bugs de usabilidade/layout [#524](https://github.com/ADS-IFPB-SR/alumigest/issues/524) e [#525](https://github.com/ADS-IFPB-SR/alumigest/issues/525) no GitHub Projects |

---

## 3. 🐞 BUGs Registrados na Sprint 07

Durante o ciclo de desenvolvimento e a etapa de homologação exploratória conduzida pelo PO, foram registrados e gerenciados os seguintes bugs no GitHub Projects:

| Issue | Título / Descrição Resumida | Severidade | Origem / Descoberta | Status |
|:---:|---|:---:|:---:|:---:|
| **#484** | Ausência de validação de cancelamento na emissão de etiquetas | 🔴 Alta | Testes Unitários/Integrados | ✅ Corrigido (PR #491) |
| **#485** | Falha de desserialização de erro Blob na exportação térmica | 🟡 Média | Testes Frontend | ✅ Corrigido (PR #491) |
| **#486** | Ordenação de peças divergente na listagem vs. etiquetas | 🟡 Média | Testes de Integração | ✅ Corrigido (PR #494) |
| **#487** | Botão Baixar PDF ignorava filtros ativos de itens | 🟡 Média | Validação UI | ✅ Corrigido (PR #497) |
| **#492 / #493** | Ajustes de dimensão nominal e quebra de texto térmica BPLB | 🟡 Média | Testes Elgin L42 | ✅ Corrigido (PR #495) |
| **#498** | Drag-and-drop na mesma coluna gerava requisição redundante e erro 422 | 🟡 Média | Testes de Interação | ✅ Corrigido (PR #506) |
| **#500** | Card do Kanban exibia linhas de itens em vez do total de peças físicas | 🟡 Média | Testes de UI | ✅ Corrigido (PR #507) |
| **#501** | Badge 'Atrasado' permanecia visível para pedidos concluídos | 🟡 Média | Testes de UI | ✅ Corrigido (PR #507) |
| **#524** | Duplicidade de item Kanban na barra lateral (Sidebar) com rota legada `/kanban` | 🟢 Baixa | Homologação Manual (PO) | 🟡 Aberto no GitHub (#524) |
| **#525** | Painel Kanban sem rolagem vertical (scroll), ocultando O.S. inferiores | 🟡 Média | Homologação Manual (PO) | 🟡 Aberto no GitHub (#525) |

---

## 4. 🎯 Análise de Ritmo, Velocidade e Fechamento do Ciclo

* **Velocidade Efetiva:** 10 Story Points entregues em 11 dias de sprint (~0.91 pts/dia), finalizando antecipadamente em relação ao período máximo de 14 dias (D14).
* **Carga de Sustentação & Resolução de BUGs:** Além das 11 fatias verticais planejadas, a equipe solucionou 8 bugs de campo e sustentação in-sprint, e o PO registrou formalmente mais 2 defeitos de usabilidade/layout (#524 e #525) para resolução prioritária no início da Sprint 08.
* **Resultado Final:** 100% das User Stories **US-17** e **US-18** homologadas com suíte de 1.765 testes aprovados (100% sucesso), habilitando com segurança a transição para a Sprint 08 da Release 2.

---

*Burndown oficial consolidado — Fechamento da Sprint 07 e Homologação de QA em 26/10/2026 (D14)*

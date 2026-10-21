# BRD — Burndown Chart — Sprint 07 (Em Andamento)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (14 dias) — **Situação em 21/10/2026 (D09)** |
| **Fonte dos Dados** | GitHub Projects / ZenHub Board (`label:sprint-07`) |
| **Total de Story Points Planejados** | 10 pts (US-17: 5 pts + US-18: 5 pts) |
| **Total de Horas Estimadas** | 27.0h (11 Fatias Verticais) |
| **Pontos Concluídos (até D09)** | 5 pts (US-17 fatias técnicas concluídas, em validação de bugs #492/#493) |
| **Pontos Restantes** | 5 pts (US-18 Kanban em andamento) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📈 Gráfico e Evolução da Queima de Pontos

O ciclo da Sprint 07 compreende 14 dias com foco inicial na emissão de etiquetas técnicas (US-17) e no Painel Kanban fabril (US-18):

```
Story Points Restantes
10 | * (13/10 - Início com 10 pts: US-17 e US-18)
 9 |   *
 8 |     * * (US-17.1 e US-17.2: Backend OpenPDF e REST implementados)
 7 |         *
 6 |           * (US-17.3 e US-17.4: Testes unitários e botão no frontend)
 5 |             * * * (21/10 - D09: US-17 concluída; US-18 em desenvolvimento ativo)
 4 |                   . (Projeção: US-18.1 a US-18.4)
 2 |                     . (Projeção: US-18.5 e US-18.6)
 0 +-------------------------------------------------
     D1  D3  D5  D7  D9  D11 D13 D14 (Dias da Sprint)
```
*(Legenda: `*` histórico real até D09 | `.` projeção até D14)*

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
| 21/10 | D09 | 5 pts | 14.0h | **Situação Atual:** US-18 em desenvolvimento; PR #495 em revisão de código |
| 23/10 | D11 | *(3 pts)* | *(8.0h)* | *Projeção:* Conclusão dos componentes visuais do Kanban (`US-18.3` a `US-18.5`) |
| 26/10 | D13 | *(1 pt)* | *(3.0h)* | *Projeção:* Testes de integração, Swagger e rota `/producao` (`US-18.6` e `US-18.7`) |
| 27/10 | D14 | *(0 pts)* | *(0.0h)* | *Projeção:* Fechamento da sprint, Review, Retrospectiva e homologação da Release 2 |

---

## 3. 🎯 Análise de Ritmo, Velocidade e Carga Extra de Sustentação

* **Velocidade Parcial das User Stories (até D09):** 5 Story Points de novas funcionalidades entregues em 9 dias de sprint (~0.55 pts/dia).
* **Carga de Trabalho Extrabacklog (Bugs e Débitos):** A equipe absorveu um volume substancial de correções não estimadas originalmente no backlog:
  * **7 Bugs de Campo da US-17:** #483, #484, #485 (fechada no PR #491), #486 (fechada no PR #494), #487, #492 e #493;
  * **8+ PRs de Estabilização da Release 2:** Tratamento de canal `OUTRO` (PR #489), separação de aliases de rotas (PR #466 e #469), blindagem contra reajuste futuro (#478), e tratamento de UI no endereço e resumo financeiro (PR #479, #480).
* **Projeção de Cumprimento do Escopo:** Apesar do expressivo desvio de esforço para blindagem de bugs, o Kanban (US-18) avançou de forma paralela no frontend e backend, mantendo a estimativa viável para homologação integral da Release 2 até 27/10/2026.

---

*Burndown em acompanhamento — Atualizado em 21/10/2026 (D09 da Sprint 07)*

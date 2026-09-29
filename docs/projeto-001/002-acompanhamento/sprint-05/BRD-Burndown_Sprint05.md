# BRD — Burndown Chart — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica de Oficina (US-11) e Homologação da Release 1 (US-12) |
| **Período** | 15/09/2026 a 28/09/2026 (14 dias) |
| **Fonte dos Dados** | GitHub Projects / ZenHub Board (`label:sprint-05`) |
| **Total de Story Points** | ~36 pts (4 pts herdados da S04 + 30 pts planejados na S05) |
| **Pontos Concluídos na Sprint** | ~30 pts (~83%) — US-09, US-10 e US-11 entregues |
| **Pontos em Observação** | 6 pts (BUGs #348 e #349 abertos ao final da sprint) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📈 Gráfico e Evolução da Queima de Pontos

O ciclo da Sprint 05 compreendeu 14 dias com foco inicial no fechamento da US-09 e na geração de PDFs, evoluindo para o motor vetorial de usinagem da Via Técnica e encerrando com ciclos intensos de correção de BUGs:

```
Story Points Restantes
36 | * (15/09 - Início com 36 pts: 4 pts S04 + 32 pts S05)
32 |   *
28 |     * * (Fechamento US-09 #133: 4 pts entregues — QA-02 homologado)
20 |         * * (US-10 #134 concluída: PDF Comercial e WhatsApp entregues)
10 |               * * (US-11 #135: Motor vetorial de usinagem implementado)
 8 |                   * (BUGs #342-#347 corrigidos in-sprint)
 6 |                       * (28/09 - Fim da Sprint: #348 e #349 em observação)
 0 +-------------------------------------------------
     D1  D3  D5  D7  D9  D11 D13 D14 (Dias da Sprint)
```

---

## 2. 📋 Histórico Diário de Queima (Burndown Diário)

| Data | Dia | Pontos Restantes | Itens Concluídos / Marcos da Sprint |
|:---:|:---:|:---:|:---|
| 15/09 | D01 | 36 pts | Início da Sprint 05: fechamento do saldo de 4 pts da US-09 e refinamento do backlog |
| 17/09 | D03 | 32 pts | Integração da `BudgetDetailPage` e `BudgetStatusBadge`; QA-02 (#72) validado |
| 19/09 | D05 | 28 pts | **`US-09 #133` fechada (4 pts):** Wizard, transições de status e QA-02 homologados |
| 21/09 | D07 | 20 pts | **`US-10 #134` concluída (8 pts):** PDF Comercial OpenPDF e resumo WhatsApp (`BudgetPdfService.gerarResumoWhatsApp`) |
| 23/09 | D09 | 14 pts | **`US-10 #134` 100% concluída (5 pts adicionais):** `BudgetDetailPage` com toolbar de ações, download de PDF e integração completa |
| 25/09 | D11 | 8 pts | **`US-11 #135` concluída (6 pts):** Motor vetorial de usinagem (`BudgetPdfDrawingHelper`) com furações cotadas e puxadores dimensionados |
| 27/09 | D13 | 8 pts | **BUGs #342-#347 corrigidos:** Usinagem multifolhas, encoding de arquivo, i18n, margens de canvas e sigla da checklist |
| 28/09 | D14 | 6 pts | **Encerramento da Sprint 05:** ~30 pts entregues (~83%). QA-04 (#340) homologado. BUGs #348 e #349 registrados e em observação para próxima sprint. |

---

## 3. 🎯 Análise de Desempenho e Velocidade da Equipe

* **Velocidade da Sprint 05:** ~30 Story Points entregues em 14 dias (média de ~2.1 pts/dia).
* **Taxa de Conclusão:** ~83% do planejado, com entrega integral das 3 User Stories principais (US-09, US-10 e US-11) e homologação da Release 1.
* **Destino do Saldo:** Os 6 pts remanescentes correspondem a melhorias e BUGs da Via Técnica (#348 e #349) — inconsistência de contagem de furos e ausência de cotas milimétricas reais — que serão incorporados ao backlog da próxima Sprint ou tratados como melhoria incremental pós-release.

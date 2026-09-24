# BRD — Burndown Chart — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube |
| **Período** | 01/09/2026 a 14/09/2026 (14 dias) |
| **Fonte dos Dados** | GitHub Projects / ZenHub Board (`has:parent-issue sprint:"Sprint 4"`) |
| **Total de Story Points** | 50 pts |
| **Pontos Concluídos na Sprint** | 44 pts (88%) |
| **Pontos Transferidos para S05** | 6 pts (Parte da US-09 e diluição da US-12) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📈 Gráfico e Evolução da Queima de Pontos

O ciclo de desenvolvimento da Sprint 04 compreendeu 14 dias com foco inicial em refatoração e qualidade de código, seguido pela implementação do motor de descontos e condições comerciais:

```
Story Points Restantes
50 | * (01/09 - Início com 50 pts)
45 |   *
40 |     * * (Conclusão quality #245)
35 |         *
30 |           * * (Conclusão US-05 #126 - Templates)
20 |               * * (Conclusão US-46 #172 - Budget V2)
10 |                   * * (Avanço maciço da US-09 #133)
 6 |                       * (14/09 - Fim da Sprint: 44 pts entregues / 6 pts para S05)
 0 +-------------------------------------------------
     D1  D3  D5  D7  D9  D11 D13 D14 (Dias da Sprint)
```

---

## 2. 📋 Histórico Diário de Queima (Burndown Diário)

| Data | Dia | Pontos Restantes | Itens Concluídos / Marcos da Sprint |
|:---:|:---:|:---:|:---|
| 01/09 | D01 | 50 pts | Início da Sprint 04 e refinamento do backlog (5 demandas principais) |
| 03/09 | D03 | 45 pts | Início das refatorações e exclusão de DTOs nas métricas de cobertura |
| 05/09 | D05 | 40 pts | **`quality #245` concluída (5 pts):** Conformidade SonarLint e pipeline verde |
| 07/09 | D07 | 35 pts | Resolução do BUG-021 e início das integrações de templates SVG |
| 09/09 | D09 | 30 pts | **`US-05 #126` concluída (5 pts):** 10 modelos canônicos e Studio CAD |
| 11/09 | D11 | 24 pts | **`US-46 #172` concluída (6 pts):** Arquitetura Budget V2 consolidada |
| 13/09 | D13 | 10 pts | Entrega do cálculo de descontos em %/R$ e condições na `US-09` |
| 14/09 | D14 | 6 pts | **Encerramento da Sprint 04:** 44 pts entregues (88%). Deliberada a diluição da `US-12 #136` (2 pts) e transferência dos 4 pts finais da `US-09` para a Sprint 05. |

---

## 3. 🎯 Análise de Desempenho e Velocidade da Equipe

* **Velocidade da Sprint 04:** 44 Story Points entregues em 14 dias (média de ~3.1 pts/dia).
* **Taxa de Conclusão:** 88% do planejado, mantendo alto padrão de qualidade com Quality Gate aprovado e zero vulnerabilidades.
* **Destino do Saldo:** O saldo de 6 pts remanescentes foi incorporado ao backlog da **Sprint 05**, permitindo a entrega contínua sem quebra de ritmo.

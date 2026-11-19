# BRD — Burndown Chart — Sprint 08 (Concluída)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (`US-46`) e Central 360° do Cliente (`US-47`) |
| **Período** | 27/10/2026 a 09/11/2026 (14 dias) — **Concluída em 09/11/2026 (D14)** |
| **Fonte dos Dados** | Histórico Git de PRs Integrados em `develop` e `release/v0.8.0` |
| **Total de Story Points Planejados** | 26 pts (`US-46`: 13 pts + `US-47`: 13 pts) |
| **Total de Horas Estimadas Iniciais** | 92.0h (8 fatias base expandidas para 12 fatias verticais entregues) |
| **Pontos Concluídos** | 26 pts (**100% Entregue**) |
| **Pontos Restantes** | 0 pts |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📈 Evolução da Queima de Pontos

```text
Story Points Restantes
26 | * (27/10 - D01: Início com US-46 e US-47)
24 |     * * (02-03/11 - D07/D08: US-46.2, US-46.1 e US-47.1 integradas)
16 |         * (04-06/11 - D09/D11: US-46.3, US-47.2, US-47.3 e US-46.5 integradas)
 6 |             * (07-08/11 - D12/D13: US-47.4, US-47.6, US-47.5 e US-46.6 integradas)
 0 |               * (09/11 - D14: US-46.4 e US-47 consolidadas — 100% concluído)
 0 +-----------------------------------------------------------------
     D01    D05    D08    D11    D13    D14 (Dias da Sprint)
```

---

## 2. 📋 Histórico de Marcos e Entregas (GitHub PRs)

| Data | Dia | Pontos Restantes | Marcos e PRs Integrados |
|:---:|:---:|:---:|:---|
| 27/10 | D01 | 26 pts | Sprint 08 Planning e abertura das branches base `feat/us-46-venda-de-partes` e `feat/us-47-painel-360-clientes` |
| 02/11 | D07 | 22 pts | `US-46.2` (`PR #538` — Alumínio) e correção `fix/order-list-null-orcamento` (`PR #536`) integrados |
| 03/11 | D08 | 16 pts | `US-46.1` (`PR #542` — Ferragens/`V23`), `US-47.1` (`PR #545` — Hub Base/Orçamentos) e fixes `#524`, `#525`, `#500`, `#510`, `#515–#519` |
| 04/11 | D09 | 12 pts | `US-46.3` (`PR #543` — Vidros/Películas) e fix 404 (`PR #549`) integrados |
| 06/11 | D11 | 8 pts | `US-47.2` (`PR #552` — Aba O.S.), `US-47.3` (`PR #553` — Ficha Técnica A4) e matriz QA (`PR #557`) integrados |
| 07/11 | D12 | 4 pts | `US-46.5` (`PR #561`), `US-47.4` (`PR #560`) e `US-47.6` (`PR #559` — Edição Cadastral) integrados |
| 08/11 | D13 | 2 pts | `US-47.5` (`PR #563` — E2E Hub 360°) e reabertura/ciclo O.S. (`PR #537`) integrados |
| 09/11 | D14 | **0 pts** | **`US-46.6` (`PR #564`), `US-46.4` (`PR #565` — PDF A4 PartSale) e `US-47` (`PR #567`) concluídos (100%)** |

---

*Burndown consolidado com evidências reais de integração da Sprint 08.*

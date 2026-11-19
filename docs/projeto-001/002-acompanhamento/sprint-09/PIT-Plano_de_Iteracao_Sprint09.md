# PIT — Plano de Iteração — Sprint 09

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 09 — Reserva e Baixa Automática de Estoque (`US-21`) & Posição com Kardex (`US-22`) |
| **Período** | 10/11/2026 a 23/11/2026 (14 dias) — **🔄 Em Andamento** |
| **Scrum Master** | Júlio Kennedy dos Santos Silva |
| **Product Owner (PO)** | José Guylherme dos Santos Melo |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Versão** | 1.0 (Alinhado com `docs/planejamento/sprint-09/`) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 09

Implementar o **Módulo de Estoque e Almoxarifado** alinhado à realidade **Make-to-Order** da Alumiportas:
1. **US-21 (#146 — 8 pts):** Reserva automática não bloqueante na aprovação da O.S., indicador visual de déficit no Kanban Fabril, baixa física definitiva em `COMPLETED`, estorno automático em cancelamentos, lançamentos manuais/perdas e blindagem de concorrência (`@Lock(PESSIMISTIC_WRITE)`).
2. **US-22 (#147 — 5 pts):** Unificação da visão de saldos (Físico, Reservado, Disponível) e badges Make-to-Order nas 4 abas do Catálogo (`/catalogo`), gaveta lateral de extrato Kardex (`KardexDrawer.tsx`), entrada de compras com documento livre/custo unitário e faixa de avisos fabris no Kanban.

---

## 2. 📋 Backlog da Sprint 09 (12 Tarefas — 13 Story Points / 42.5h)

| Subtarefa | Issue GitHub | Escopo | Pontos | Horas | Situação Observada (Branches S09) |
|:---:|:---:|---|:---:|:---:|---|
| **`US-21.1`** | [#571](https://github.com/ADS-IFPB-SR/alumigest/issues/571) | Setup base backend/frontend `stock` | 1 pt | 2.5h | 🟢 Integrada na `feat/us-21` (`PR #592`) |
| **`US-21.2`** | [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572) | Schema Flyway (`V26` no merge), entidades JPA e Lock Pessimista | 1 pt | 3.0h | 🟢 Integrada na `feat/us-21` (`PR #596` — ajustar `V25` ➔ `V26`) |
| **`US-21.3`** | [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573) | Motor de reserva automática Make-to-Order | 2 pts | 3.5h | 🟢 Integrada na `feat/us-21` (`PR #602`) |
| **`US-21.4`** | [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574) | Indicador visual Make-to-Order no card do Kanban | 1 pt | 2.5h | 🔄 Em revisão na branch `feat/us-21.4` (`PR #599`) |
| **`US-21.5`** | [#575](https://github.com/ADS-IFPB-SR/alumigest/issues/575) | Baixa física definitiva em `COMPLETED` | 1 pt | 3.0h | 🔵 Planejada / A integrar |
| **`US-21.6`** | [#576](https://github.com/ADS-IFPB-SR/alumigest/issues/576) | Estorno automático de reservas em cancelamento | 1 pt | 2.5h | 🔵 Planejada / A integrar |
| **`US-21.7`** | [#577](https://github.com/ADS-IFPB-SR/alumigest/issues/577) | Endpoint movimentações manuais & `ScrapLossModal` | 1 pt | 3.5h | 🔄 Em revisão na branch `feat/us-21.7` |
| **`US-21.8`** | [#578](https://github.com/ADS-IFPB-SR/alumigest/issues/578) | Testes de concorrência, E2E e OpenAPI | 1 pt | 3.5h | 🔄 Em revisão na branch `test/us-21.8` |
| **`US-22.1`** | [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587) | Saldos e badges nas 4 abas do catálogo + `GET /api/v1/stock` | 2 pts | 6.0h | 🟢 Integrada na `feat/us-22` (`PR #601`) |
| **`US-22.2`** | [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589) | Gaveta lateral `KardexDrawer.tsx` & extrato ordenado | 1 pt | 4.5h | 🔄 Em revisão na branch `feat/us-22.2` |
| **`US-22.3`** | [#590](https://github.com/ADS-IFPB-SR/alumigest/issues/590) | Modal de entrada de compras (documento livre + custo) | 1 pt | 4.5h | 🔵 Planejada |
| **`US-22.4`** | [#591](https://github.com/ADS-IFPB-SR/alumigest/issues/591) | Rota `/catalogo`, menu lateral e guia visual no Kanban | 1 pt | 3.5h | 🔵 Planejada |

---

## 3. 🛡️ Riscos Ativos Mapeados

* **R19 — Colisão de Versão Flyway (`V25` vs `V26`):** A `release/v0.8.0` já utilizou `V25__set_default_order_status_created.sql`, enquanto as branches da Sprint 09 criaram provisoriamente `V25__create_stock_schema.sql`. Mitigação obrigatória: renomear a migration de estoque para **`V26__create_stock_schema.sql`** antes do merge em `develop`.
* **R20 — Divergência entre sub-branches de `feat/us-21` e `feat/us-22`:** Alinhar/rebasear as sub-branches (`us-21.4`, `us-21.7`, `us-22.2`) sobre a versão mais recente de `feat/us-21` após o `PR #602` (remoção/uso de `OrderMaterialsReservationEvent`).

---
*Plano de Iteração oficial da Sprint 09 — AlumiGest — Em conformidade com Docs-as-Code.*

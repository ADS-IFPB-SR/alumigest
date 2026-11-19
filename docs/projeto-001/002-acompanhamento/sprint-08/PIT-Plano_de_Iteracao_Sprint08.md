# PIT — Plano de Iteração — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (`US-46`) e Central 360° do Cliente (`US-47`) |
| **Período** | 27/10/2026 a 09/11/2026 (14 dias) — **🟢 Concluída (100% Entregue)** |
| **Scrum Master** | Maylson da Silva Rodrigues |
| **Product Owner (PO)** | José Guylherme dos Santos Melo |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Versão** | 2.0 (Consolidado com Fechamento Real e PRs Integrados em `develop`/`release/v0.8.0`) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 08

Expandir a frente comercial e de atendimento ao cliente da **Release 2**, integrando a venda direta de insumos fracionados à visão unificada de clientes e produção:

1. **US-46 (#477) — Módulo de Venda Avulsa de Partes (13 pts):** Cotação e venda direta de vidros ($m^2$ com piso mínimo de $0,25\text{ m}^2$), perfis de alumínio (metro linear com fator de perda e limite de barra de $6000\text{ mm}$), películas ($m^2$ com perda de bobina) e ferragens por unidade (`UN`), incluindo seed de `Cliente Balcão` e exportação em PDF A4 agrupado.
2. **US-47 (#496) — Central 360° do Cliente (13 pts):** Layout mestre-detalhe (`/clientes`) com Hero Card, 3 KPIs agregados, gestão de orçamentos (PDF/WhatsApp), gestão de O.S. com detalhamento de esquadrias em milímetros, edição cadastral, emissão de Ficha Técnica A4 de Corte e etiquetas térmicas 100×60mm.
3. **Estabilização Pós-Sprint 07:** Correção dos bugs de campo `#524` (duplicidade no menu Kanban) e `#525` (scroll vertical no Kanban), além da unificação da suíte Cypress E2E na pipeline CI/CD.

---

## 2. 📋 Backlog Executado da Sprint 08

| Subtarefa | Issue GitHub | Descrição Técnica da Fatia Vertical | Executor Principal | PR Integrado | Status |
|:---:|:---:|---|---|:---:|:---:|
| **`US-46.1`** | [#527](https://github.com/ADS-IFPB-SR/alumigest/issues/527) | Schema `V23`, `PartCalculatorFactory`, `HardwarePartCalculator` e UI inicial de venda avulsa | Italo Jefferson / Equipe | PR #542 | 🟢 Concluído |
| **`US-46.2`** | [#528](https://github.com/ADS-IFPB-SR/alumigest/issues/528) | `AluminumProfilePartCalculator` (metro linear até 6000mm e perda) e `AluminumItemFields.tsx` | Guilherme Kauã | PR #538 | 🟢 Concluído |
| **`US-46.3`** | [#529](https://github.com/ADS-IFPB-SR/alumigest/issues/529) | `GlassPartCalculator`, `FilmPartCalculator`, `PartSaleValidationService` e campos UI | Gabriel de Souza / Júlio K. | PR #543, #549 | 🟢 Concluído |
| **`US-46.4`** | [#530](https://github.com/ADS-IFPB-SR/alumigest/issues/530) | Emissão de PDF A4 agrupado por categorias (`PartSalePdfService`) e exportação | Júlio Kennedy / Italo J. | PR #565 | 🟢 Concluído |
| **`US-46.5`** | [#551](https://github.com/ADS-IFPB-SR/alumigest/issues/551) | Listagem de materiais por categoria (`MaterialController`), `MaterialAutocomplete` e `V24` (`Cliente Balcão`) | Italo Jefferson | PR #561 | 🟢 Concluído |
| **`US-46.6`** | [#555](https://github.com/ADS-IFPB-SR/alumigest/issues/555) | Suíte E2E Cypress (`us46_venda_avulsa_*.cy.ts`), `TestCleanupController` e matriz QA | Maylson R. / Joseph N. | PR #557, #564 | 🟢 Concluído |
| **`US-47.1`** | [#531](https://github.com/ADS-IFPB-SR/alumigest/issues/531) | `ClientHubController` (`/dashboard`, `/budgets`), `CustomerHubPage`, Hero Card e aba Orçamentos | Joseph Nichollas | PR #545 | 🟢 Concluído |
| **`US-47.2`** | [#532](https://github.com/ADS-IFPB-SR/alumigest/issues/532) | Endpoint `/orders`, `CustomerOrdersTab.tsx` e detalhamento de esquadrias em mm | Guilherme Kauã / Italo J. | PR #552 | 🟢 Concluído |
| **`US-47.3`** | [#533](https://github.com/ADS-IFPB-SR/alumigest/issues/533) | Ficha Técnica A4 (`ProductionSheetService`, `ProductionSheetPdfService`, estratégias Suprema/Fallback) | Herbert C. / Maylson / Italo J. | PR #553 | 🟢 Concluído |
| **`US-47.4`** | [#534](https://github.com/ADS-IFPB-SR/alumigest/issues/534) | Integração do `ThermalLabelModal` (100×60mm Elgin L42) na Central 360° | José Guylherme | PR #560 | 🟢 Concluído |
| **`US-47.5`** | [#556](https://github.com/ADS-IFPB-SR/alumigest/issues/556) | Suíte Cypress `us47_hub_360_cliente.cy.ts` (12 cenários) e `ClientHubControllerIntegrationTest` | Joseph Nichollas | PR #563 | 🟢 Concluído |
| **`US-47.6`** | [#558](https://github.com/ADS-IFPB-SR/alumigest/issues/558) | Modal de edição cadastral rápida do cliente no Hub 360° (`EditCustomerModal.tsx`) | Maylson Rodrigues | PR #559 | 🟢 Concluído |

---

## 3. 🐞 Correções e Sustentação Absorvidas In-Sprint

* **#524 (`PR #544`):** Remoção da duplicidade do item Kanban na barra lateral (`Sidebar.tsx`).
* **#525 (`PR #540`):** Habilitação de rolagem vertical independente nas colunas do Painel Kanban.
* **#500 / #510 (`PR #539`, `#541`):** Refinamento da contagem física de peças no card de produção e numeração de itens em etiquetas térmicas.
* **#515 / #516 / #519 / #536 / #537 (`PR #536`, `#537`, `#547`):** Correções no ciclo de vida de ordens, reabertura de orçamento após cancelamento da O.S. e tratamento de `orcamentoId` nulo na listagem.
* **CI/CD (`PR #568`):** Execução nativa da suíte Cypress E2E com service containers PostgreSQL no GitHub Actions.
* **Modo Escuro & Flyway (`PR #597`, `release/v0.8.0`):** Contraste semântico M3 e prevenção de colisão Flyway renomeando `V22__set_default_order_status_created.sql` para `V25`.

---
*Plano de Iteração oficial da Sprint 08 — AlumiGest — Registrado em conformidade com Docs-as-Code.*

# 📊 RAP — Relatório de Acompanhamento — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (`US-46`) e Central 360° do Cliente (`US-47`) |
| **Período** | 27/10/2026 a 09/11/2026 (14 dias — **🟢 100% Entregue em 09/11/2026**, estabilizada em `release/v0.8.0` até 15/11) |
| **Scrum Master** | Maylson da Silva Rodrigues |
| **Product Owner (PO)** | José Guylherme dos Santos Melo |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Versão** | 1.0 (Consolidado com Histórico Real do GitHub e Baseline `B-ALG-v0.8.0-S08-01`) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📊 Resumo Executivo

A **Sprint 08** entregou integralmente as histórias **`US-46 #477`** e **`US-47 #496`**, totalizando **26 Story Points** distribuídos em **12 fatias verticais** (`US-46.1` a `US-46.6` e `US-47.1` a `US-47.6`), além das correções operacionais e de pipeline integradas até a `release/v0.8.0`.

* **Taxa de Conclusão do Escopo Planejado:** **100%** (26/26 pts).
* **Qualidade & Testes:** **1.025 testes Vitest** (122 suítes), **40 testes de backend** nas suítes principais da sprint + testes de estratégia de corte (`SupremaSlidingWindowCalculatorTest`, `DefaultFrameCalculatorTest`, `ProductionSheetServiceTest`, `ProductionSheetPdfServiceTest`) e **16 cenários E2E Cypress** homologados (`us46_venda_avulsa_visual.cy.ts` + `us47_hub_360_cliente.cy.ts`), além de `us46_venda_avulsa_partes.cy.ts` e `us46_lista_vendas_avulsas.cy.ts`.

---

## 2. 📋 Entregas Realizadas vs. Planejadas

| Demanda / Subtarefa | Escopo / Módulo | PR no GitHub | Status de Entrega | Evidência Técnica Principal |
|---|---|:---:|:---:|---|
| **`US-46.1`** (#527) | Venda Avulsa — Ferragens & Schema `V23` | PR #542 | ✅ **Entregue** | `tb_part_sales`, `tb_part_sale_items`, `PartCalculatorFactory`, `HardwarePartCalculator` |
| **`US-46.2`** (#528) | Venda Avulsa — Perfis de Alumínio | PR #538 | ✅ **Entregue** | `AluminumProfilePartCalculator` (até `6000 mm` + perda) e `AluminumItemFields.tsx` |
| **`US-46.3`** (#529) | Venda Avulsa — Vidros e Películas | PR #543, #549 | ✅ **Entregue** | `GlassPartCalculator` (piso `0,25 m²`), `FilmPartCalculator` e `PartSaleValidationService` |
| **`US-46.4`** (#530) | Venda Avulsa — Exportação PDF A4 | PR #565 | ✅ **Entregue** | `PartSalePdfService` (OpenPDF agrupado por categoria) e `GET /api/v1/part-sales/{id}/pdf` |
| **`US-46.5`** (#551) | Seletor de Materiais & Cliente Balcão | PR #561 | ✅ **Entregue** | `GET /api/v1/materials?category=`, `MaterialAutocomplete` e seed `V24` |
| **`US-46.6`** (#555) | QA, Matriz e E2E Venda Avulsa | PR #557, #564 | ✅ **Entregue** | `casos-de-teste-us46-venda-avulsa.md` e suítes Cypress `us46_*.cy.ts` |
| **`US-47.1`** (#531) | Hub 360° Base, KPIs & Orçamentos | PR #545 | ✅ **Entregue** | `ClientHubController`, `CustomerHubPage`, `CustomerHeroCard`, `CustomerBudgetsTab` |
| **`US-47.2`** (#532) | Aba de O.S. & Esquadrias em mm | PR #552 | ✅ **Entregue** | `GET /api/v1/clients/{id}/orders` e `CustomerOrdersTab` com medidas nominais |
| **`US-47.3`** (#533) | Ficha Técnica A4 de Corte | PR #553 | ✅ **Entregue** | `ProductionSheetService`, `ProductionSheetPdfService`, `SupremaSlidingWindowCalculator`, `DefaultFrameCalculator` |
| **`US-47.4`** (#534) | Etiquetas Térmicas no Hub 360° | PR #560 | ✅ **Entregue** | Integração `ThermalLabelModal` na aba de O.S. do Hub |
| **`US-47.5`** (#556) | E2E Cypress & Integração Hub 360° | PR #563 | ✅ **Entregue** | `us47_hub_360_cliente.cy.ts` (12 cenários) e `ClientHubControllerIntegrationTest` |
| **`US-47.6`** (#558) | Edição Cadastral no Hub 360° | PR #559 | ✅ **Entregue** | `EditCustomerModal.tsx` com validação Zod |

---

## 3. 🐞 Defeitos e Melhorias Tratados na Sprint

1. **BUG-041 (`V24`):** Persistência com `Cliente Balcão` padrão corrigida via migration `V24__seed_default_walk_in_client.sql` e `resolveClient` defensivo.
2. **BUG-042 (`PR #561`):** Transparência na precificação de perfis de alumínio na venda avulsa sem markup surpresa no checkout.
3. **BUG-043 (`PR #561`):** Remoção de badge de preço redundante no dropdown de materiais.
4. **BUG-044 (`PR #564`):** Isolamento de massa E2E com exclusão em cascata via `TestCleanupController`.
5. **BUG-045 (`PR #563`):** Ajuste de `ClientHubControllerIntegrationTest` para `orcamentoId` obrigatório e `OffsetDateTime`.
6. **Correções pós-Sprint 07 e Infra (`#524`, `#525`, `#568`, `#597`):** Menu duplicado removido, scroll vertical no Kanban, E2E em containers na CI e ajuste de contraste M3 em modo escuro.

---

## 4. 📈 Indicadores Consolidados da Sprint 08

* **Story Points Planejados / Concluídos:** **26 pts / 26 pts (100%)**.
* **Sub-tarefas Entregues:** **12 fatias verticais** (`6` da US-46 + `6` da US-47).
* **Baseline Gerada:** `B-ALG-v0.8.0-S08-01` (branch `release/v0.8.0`, com `V22__add_valor_mao_de_obra_to_orders.sql` e `V25__set_default_order_status_created.sql`).

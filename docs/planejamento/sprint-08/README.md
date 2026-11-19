# 📌 Sprint 08 — Venda Avulsa de Partes e Central 360° do Cliente

**Período Oficial da Sprint 08**: 27/10/2026 a 09/11/2026 (Baseline `B-ALG-v0.8.0-S08-01` concluída e integrada em `release/v0.8.0`)  
**Status**: 🟢 Concluída (100% Entregue)  
**Product Owner (PO)**: José Guylherme dos Santos Melo  
**Scrum Master**: Maylson da Silva Rodrigues  
**Equipe de Desenvolvimento**: Guilherme Kauã, Italo Jefferson, Joseph Nichollas, Júlio Kennedy, Herbert Carvalho, Gabriel de Souza  
**Escopo Oficial Entregue**: **US-46** (6 fatias verticais) e **US-47** (6 fatias verticais) + correções pós-Sprint 07 (`#524`, `#525`, `#536`, `#537`, `#539`, `#540`, `#541`, `#544`, `#547`)  

Esta pasta registra o pacote de engenharia executado na **Sprint 08** do projeto **AlumiGest**, estruturado em **Fatias Verticais (*Thin Vertical Slices*)** funcionais e testáveis de ponta a ponta (BD, Backend, Frontend e QA em cada sub-tarefa), blindadas com padrões de **baixo acoplamento**:
- **US-46**: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas).
- **US-47**: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica A4 e Etiquetas.

---

## 🛡️ Padrões de Desacoplamento Aplicados na Entrega

1. **Backend US-46 — Factory + Strategy Pattern (`PartCalculatorFactory`):**
   - Interface `PartItemCalculator`, fábrica `PartCalculatorFactory` e estratégias isoladas `HardwarePartCalculator`, `AluminumProfilePartCalculator`, `GlassPartCalculator` e `FilmPartCalculator`.
2. **Frontend US-46 — Composição Especializada (`ItemFields`):**
   - `PartSaleFormPage.tsx` e `PartSaleMaterialForm.tsx` delegam medidas e badges para `HardwareItemFields`, `AluminumItemFields`, `GlassItemFields` e `FilmItemFields`, com seletor inteligente `MaterialAutocomplete.tsx` (`US-46.5`).
3. **Fullstack US-47 — Arquitetura Shell + Abas e Modais Modulares:**
   - `CustomerHubPage.tsx` coordena `CustomerMasterSidebar.tsx`, `CustomerHeroCard.tsx`, `CustomerKpiGrid.tsx`, `CustomerBudgetsTab.tsx`, `CustomerOrdersTab.tsx`, `EditCustomerModal.tsx` (`US-47.6`) e os modais/fluxos de Ficha Técnica A4 (`ProductionSheetService` / `DefaultFrameCalculator` / `SupremaSlidingWindowCalculator`) e `ThermalLabelModal.tsx`.

---

## 🗺️ Mapa de Histórias e Fatiamento Vertical Entregue (Sprint Backlog)

### 📦 US-46: Módulo de Venda Avulsa de Partes e Insumos
**Issue GitHub**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477) | **Prioridade**: P1 (Comercial / Venda Direta)  
**Branch Base**: `develop` | **Integração**: `develop` / `release/v0.8.0`

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Escopo & PR Integrado | Tipo | Status |
|---|:---:|---|---|:---:|:---:|
| **[US-46.1](../backlog/US-46-venda-de-partes/issues/US-46.1-venda-avulsa-ferragens-unidade/issue.md)** | [#527](https://github.com/ADS-IFPB-SR/alumigest/issues/527) | Venda Avulsa de Ferragens por Unidade | `V23`, `PartItemCalculator`, `PartCalculatorFactory`, `HardwarePartCalculator` e UI (`PR #542`) | Fullstack | 🟢 Concluída |
| **[US-46.2](../backlog/US-46-venda-de-partes/issues/US-46.2-venda-perfis-aluminio-metro-linear/issue.md)** | [#528](https://github.com/ADS-IFPB-SR/alumigest/issues/528) | Venda de Perfis de Alumínio em Metro Linear | `AluminumProfilePartCalculator.java` e `AluminumItemFields.tsx` (`PR #538`) | Fullstack | 🟢 Concluída |
| **[US-46.3](../backlog/US-46-venda-de-partes/issues/US-46.3-venda-vidros-peliculas-metro-quadrado/issue.md)** | [#529](https://github.com/ADS-IFPB-SR/alumigest/issues/529) | Venda de Vidros e Películas em m² | `GlassPartCalculator.java`, `FilmPartCalculator.java`, `PartSaleValidationService` e UI (`PR #543`, `#549`) | Fullstack | 🟢 Concluída |
| **[US-46.4](../backlog/US-46-venda-de-partes/issues/US-46.4-geracao-exportacao-orcamento-pedido-pdf/issue.md)** | [#530](https://github.com/ADS-IFPB-SR/alumigest/issues/530) | Emissão e Exportação do Orçamento em PDF A4 | `PartSalePdfService.java` (OpenPDF) e exportação via blob (`PR #565`) | Fullstack | 🟢 Concluída |
| **US-46.5** | [#551](https://github.com/ADS-IFPB-SR/alumigest/issues/551) | Listagem de Tipo de Material no Seletor & Cliente Balcão | `GET /api/v1/materials?category=`, `V24` (`Cliente Balcão`), `MaterialAutocomplete` (`PR #561`) | Fullstack | 🟢 Concluída |
| **US-46.6** | [#555](https://github.com/ADS-IFPB-SR/alumigest/issues/555) | Suíte de Testes E2E, Integração e Matriz de Casos | Specs Cypress `us46_venda_avulsa_*.cy.ts` e `TestCleanupController` (`PR #557`, `#564`) | QA / E2E | 🟢 Concluída |

---

### 📦 US-47: Central 360° do Cliente com Gestão Unificada
**Issue GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496) | **Prioridade**: P1 (Atendimento & Gestão Unificada)  
**Branch Base**: `develop` | **Branch Integrada**: `feat/us-47-painel-360-clientes` (`PR #567`)

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Escopo & PR Integrado | Tipo | Status |
|---|:---:|---|---|:---:|:---:|
| **[US-47.1](../backlog/US-47-painel-360-clientes/issues/US-47.1-hub-base-kpis-gestao-orcamentos-comerciais/issue.md)** | [#531](https://github.com/ADS-IFPB-SR/alumigest/issues/531) | Hub 360° Base, KPIs e Gestão de Orçamentos | `ClientHubController`, `CustomerHubPage`, `CustomerHeroCard`, `CustomerBudgetsTab` (`PR #545`) | Fullstack | 🟢 Concluída |
| **[US-47.2](../backlog/US-47-painel-360-clientes/issues/US-47.2-gestao-ordens-servico-detalhamento-esquadrias/issue.md)** | [#532](https://github.com/ADS-IFPB-SR/alumigest/issues/532) | Gestão de Ordens de Serviço (O.S.) e Esquadrias | Endpoint `/orders`, `CustomerOrdersTab.tsx` e detalhamento de medidas em mm (`PR #552`) | Fullstack | 🟢 Concluída |
| **[US-47.3](../backlog/US-47-painel-360-clientes/issues/US-47.3-emissao-ficha-tecnica-a4-producao-corte/issue.md)** | [#533](https://github.com/ADS-IFPB-SR/alumigest/issues/533) | Emissão da Ficha Técnica A4 de Produção | `ProductionSheetService`, `ProductionSheetPdfService`, `SupremaSlidingWindowCalculator`, `DefaultFrameCalculator` (`PR #553`) | Fullstack | 🟢 Concluída |
| **[US-47.4](../backlog/US-47-painel-360-clientes/issues/US-47.4-impressao-etiquetas-termicas-hub-360/issue.md)** | [#534](https://github.com/ADS-IFPB-SR/alumigest/issues/534) | Impressão de Etiquetas Térmicas (100×60mm) no Hub | Integração com `ThermalLabelModal.tsx` no Hub 360° (`PR #560`) | Fullstack / UI | 🟢 Concluída |
| **US-47.5** | [#556](https://github.com/ADS-IFPB-SR/alumigest/issues/556) | Suíte E2E Cypress, Integração Backend & TEA/RET | `us47_hub_360_cliente.cy.ts` (12 cenários) e `ClientHubControllerIntegrationTest` (`PR #563`) | QA / E2E | 🟢 Concluída |
| **US-47.6** | [#558](https://github.com/ADS-IFPB-SR/alumigest/issues/558) | Edição de Dados Cadastrais do Cliente no Hub 360° | `EditCustomerModal.tsx` com validação Zod (`PR #559`) | Fullstack / UI | 🟢 Concluída |

---

## 🔗 Documentos de Referência e Fechamento

- 📑 **Especificação Funcional da Sprint**: [spec.md](spec.md)
- 📝 **Atas de Planejamento e Review**: [ATA-Sprint_08_Planning.md](../../projeto-001/001-atas-reuniao/ATA-Sprint_08_Planning.md) | [ATA-Sprint_08_Review_e_Retrospective.md](../../projeto-001/001-atas-reuniao/ATA-Sprint_08_Review_e_Retrospective.md)
- 📊 **Acompanhamento (PIT, RAP, BRD)**: [sprint-08/](../../projeto-001/002-acompanhamento/sprint-08/)
- 🧪 **Tríade Documental de Testes**: [TEA](../../projeto-001/003-teste/sprint-08/TEA-Testes_de_Aceitacao_Sprint08.md) | [RTM](../../projeto-001/003-teste/sprint-08/RTM-Roteiro_de_Testes_Manuais_Sprint08.md) | [RET](../../projeto-001/003-teste/sprint-08/RET-Relatorio_Execucao_Testes_Sprint08.md)
- 📦 **Especificações Detalhadas do Backlog**:
  - [US-46 — Venda de Partes](../backlog/US-46-venda-de-partes/spec.md)
  - [US-47 — Central 360° do Cliente](../backlog/US-47-painel-360-clientes/spec.md)

# RET — Relatório de Execução de Testes — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 07 |
| **Versão da Baseline** | B-ALG-v0.7.0-S07-01 |
| **Data de Fechamento** | 26/10/2026 |
| **Responsável QA** | Jose Guylherme (GMSantos20) / Equipe de Engenharia AlumiGest |
| **Task de QA / Referência** | [QA-05 (#514)](https://github.com/ADS-IFPB-SR/alumigest/issues/514) |
| **Branch de Homologação** | `QA/qa-05-homologacao-gestao-fabril` |

---

## 1. 🎯 Resumo Executivo da Qualidade

A Sprint 07 contemplou a entrega e homologação integrada do módulo de **Gestão Fabril & Produção (Release 2)**, composto pelas seguintes histórias de usuário:
- **US-17 (#142):** *Emissão e Impressão de Etiquetas Adesivas Térmicas de Identificação de Peças (PDF A4, BPLB e ZPL)*.
- **US-18 (#143):** *Acompanhamento da Produção via Painel Kanban Interativo de Ordens de Serviço (O.S.)*.

A suíte completa de testes automatizados (unitários, integração e E2E) foi executada e homologada com **100% de taxa de sucesso**. Adicionalmente, foram realizados testes manuais e exploratórios completos sobre o fluxo fabril, resultando na identificação e abertura formal de 2 novos bugs de layout/usabilidade pelo PO.

* **Status do Quality Gate (SonarQube):** ✅ **APROVADO (OK)**
* **Taxa de Sucesso dos Testes:** `100%` (Zero falhas na baseline final)
* **Total de Testes Automatizados:** **1.765 testes aprovados** (882 Backend + 883 Frontend)
* **Cobertura de Código (New Code):**
  - **Backend (JaCoCo):** `91.8%` de cobertura de linhas
  - **Frontend (Vitest):** `82.8%` de cobertura de linhas

---

## 2. 📊 Consolidação da Pirâmide de Testes

| Camada / Tipo | Framework | Testes Executados | Passaram | Falharam | Cobertura (% Linhas) |
|---|---|:---:|:---:|:---:|:---:|
| **Testes Unitários e Integração Backend** | Spring Boot Test + JUnit 5 + Mockito + Testcontainers | 882 | 882 | 0 | 91.8% |
| **Testes de Componentes e Hooks Frontend** | Vitest + React Testing Library | 883 | 883 | 0 | 82.8% |
| **Testes E2E (End-to-End)** | Cypress (`us17_5_etiquetas_identificacao_termica.cy.ts`, `us18_painel_kanban_producao.cy.ts`) | 11 | 11 | 0 | Homologado |
| **TOTAL CONSOLIDADO** | — | **1.765** | **1.765** | **0** | **≥ 87.3%** |

---

## 3. 🗺️ Matriz de Rastreabilidade por User Story da Sprint 07

| User Story / Escopo | Módulo | Suítes e Testes Automatizados Homologados | Status |
|---|---|---|:---:|
| **US-17 (#142)** | Backend / Etiquetas | `LabelPdfServiceTest`, `ThermalLabelDataResolverTest`, `ThermalLabelBplbRendererTest`, `OrderControllerTest` | ✅ Aprovado |
| **US-17 (#142)** | Frontend / Etiquetas | `ThermalLabelModal.test.tsx`, `OrderDetailHeader.test.tsx`, `thermalLabels.test.ts`, `leafDeduction.test.ts` | ✅ Aprovado |
| **US-17.5 (#494)** | E2E Cypress | `us17_5_etiquetas_identificacao_termica.cy.ts` (Modal, formatos PDF/BPLB/ZPL, bloqueio para canceladas) | ✅ Aprovado |
| **US-18 (#143)** | Backend / Kanban | `OrderProductionStatusTest`, `OrderStatusTest`, `OrderControllerIntegrationTest`, `OrderOpenApiTest` | ✅ Aprovado |
| **US-18 (#143)** | Frontend / Kanban | `ProductionKanbanBoard.test.tsx`, `OrderProductionCard.test.tsx`, `ProductionKanbanMetrics.test.tsx`, `useProductionKanban.test.tsx`, `ProductionKanbanPage.test.tsx` | ✅ Aprovado |
| **US-18.7 (#458)** | E2E Cypress | `us18_painel_kanban_producao.cy.ts` (Arrasto Drag & Drop, avanço contextual, SLAs e filtros) | ✅ Aprovado |
| **QA-05 (#514)** | Homologação Integrada | Validação exploratória manual de conversão de orçamento, emissão de etiquetas e movimentação fabril | ✅ Aprovado |

---

## 4. 🐞 Defeitos Identificados na Homologação Manual (Bugs Registrados pelo PO)

Durante as sessões de teste exploratório e homologação funcional conduzidas pelo PO (José Guylherme) na branch `QA/qa-05-homologacao-gestao-fabril`, foram identificados e formalizados os seguintes defeitos:

### 1. Issue #524: Duplicidade de item Kanban na barra lateral (Sidebar) com rota legada `/kanban`
* **Severidade:** 🟢 Baixa (Usabilidade / Menu)
* **Link GitHub:** [#524](https://github.com/ADS-IFPB-SR/alumigest/issues/524)
* **Comportamento Observado:** O menu lateral exibe duas entradas de Kanban: a entrada legada "Kanban" apontando para `/kanban` (tela simplificada) e a entrada correta "Produção (Kanban)" apontando para `/production/kanban`.
* **Ação Corretiva:** Remover o item duplicado em `frontend/src/components/layout/Sidebar.tsx`.

### 2. Issue #525: Painel Kanban sem rolagem vertical (scroll), ocultando ordens de serviço inferiores nas colunas
* **Severidade:** 🟡 Média (Layout / Usabilidade)
* **Link GitHub:** [#525](https://github.com/ADS-IFPB-SR/alumigest/issues/525)
* **Comportamento Observado:** Quando uma coluna possui muitos pedidos, os cards excedem o limite da janela e ficam cortados, sem permitir rolagem com scroll do mouse.
* **Ação Corretiva:** Adicionar classes utilitárias de overflow vertical independente nas colunas (`overflow-y-auto`) em `ProductionKanbanBoard.tsx`.

---

## 5. 🛡️ Parecer Final de Homologação

A Release 2 (Gestão Fabril) cumpriu integralmente todos os requisitos funcionais, critérios de aceitação e metas de cobertura estipulados para a Sprint 07. Os dois defeitos de layout e usabilidade relatados pelo PO não bloqueiam o fechamento da sprint e foram devidamente triados no GitHub Projects para solução imediata no início da Sprint 08.

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

A suíte completa de testes automatizados (unitários, integração e E2E) foi executada e homologada com **100% de taxa de sucesso**. Adicionalmente, foram realizados testes manuais e exploratórios completos sobre o fluxo fabril, resultando na identificação e abertura formal de 2 novos bugs de layout/usabilidade.

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

## 4. 🐞 Defeitos Identificados na Homologação Manual (Bugs Registrados)

Durante as sessões de teste exploratório e homologação funcional conduzidas pelo QA na branch `QA/qa-05-homologacao-gestao-fabril`, foram identificados e formalizados os seguintes defeitos:

| Issue | Título do Bug | Severidade | Módulo | Descrição do Impacto |
|:---:|---|:---:|:---:|---|
| **[#524](https://github.com/ADS-IFPB-SR/alumigest/issues/524)** | Duplicidade de item Kanban na barra lateral (Sidebar) com rota legada `/kanban` | 🟡 Média (P3) | Frontend / Layout | Dois links de Kanban são renderizados simultaneamente na Sidebar (`/kanban` genérico e `/producao`), gerando ambiguidade e poluição visual. |
| **[#525](https://github.com/ADS-IFPB-SR/alumigest/issues/525)** | Painel Kanban sem rolagem vertical (scroll), ocultando ordens de serviço inferiores nas colunas | 🔴 Alta (P2) | Frontend / Kanban | Em telas com resolução padrão, o cabeçalho e filtros consomem a altura da viewport e os cards inferiores ficam cortados sem responder ao scroll do mouse. |

### Defeitos In-Sprint Tratados e Validados:
- **BUG-484 (#484):** Bloqueio de download de etiquetas térmicas em pedidos cancelados (HTTP 422).
- **BUG-485 (#485):** Tratamento de erro binário Blob no download de etiquetas.
- **BUG-487 (#487):** Filtro de peças selecionadas no modal térmico refletido no arquivo gerado.
- **BUG-492 / BUG-493 (#495):** Impressão BPLB silenciosa para Elgin L42 e dedução de folhas por tipologia.
- **BUG-498 (#498):** Prevenção de erro 422 em eventos Drag & Drop soltos na mesma coluna (no-op).
- **BUG-500 (#500):** Exibição da quantidade real de peças físicas no card em vez do número de linhas.
- **BUG-501 (#501):** Supressão de badge "Atrasado" para pedidos concluídos (`COMPLETED`).

---

## 5. 🖥️ Evidências de Execução Automatizada

### 5.1 Backend (`mvn test`):
```text
[INFO] Results:
[INFO] 
[INFO] Tests run: 882, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  01:21 min
[INFO] Finished at: 2026-10-26T21:41:04-03:00
```

### 5.2 Frontend (`npm test`):
```text
 ✓ src/__tests__/features/production/OrderProductionCard.test.tsx (17 tests) 282ms
 ✓ src/__tests__/features/production/ProductionKanbanBoard.test.tsx (15 tests) 447ms
 ✓ src/__tests__/features/production/ProductionKanbanMetrics.test.tsx (4 tests) 97ms
 ✓ src/__tests__/pages/ProductionKanbanPage.test.tsx (12 tests) 1545ms
 ✓ src/__tests__/features/production/deadlineUtils.test.ts (13 tests) 29ms
 ✓ src/__tests__/features/production/productionApi.test.ts (5 tests) 18ms
 ✓ src/__tests__/features/production/useProductionKanban.test.tsx (22 tests) 2575ms

 Test Files  7 passed (7)
      Tests  88 passed (88)
   Duration  27.90s
```

---

## 6. 🏁 Parecer Formal de Homologação (QA)

Considerando que:
1. Todas as suítes de testes unitários e de integração de backend e frontend atingiram **100% de aprovação** com coberturas acima do limiar do Quality Gate ($\ge 80\%$);
2. Os cenários de aceitação funcionais de etiquetas térmicas e quadro Kanban foram satisfeitos de ponta a ponta;
3. As falhas residuais de layout e rolagem foram devidamente isoladas, reportadas e rastreadas através das issues **#524** e **#525** sem impedir a esteira fabril básica;

O responsável de QA emite parecer **FAVORÁVEL À HOMOLOGAÇÃO DA SPRINT 07**, recomendando a aplicação dos fixes pontuais das issues #524 e #525 antes da release final.

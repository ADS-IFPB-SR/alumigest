# RET — Relatório de Execução de Testes — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 05 |
| **Versão da Baseline** | B-ALG-v0.5.0-S05-01 |
| **Data de Fechamento** | 28/09/2026 |
| **Responsável QA / Tech Lead** | Equipe de Engenharia e QA AlumiGest / Ítalo Jefferson |

---

## 1. Resumo Executivo da Qualidade

A Sprint 05 contemplou a finalização das histórias de usuário **US-10** (*Emissão e Exportação de Orçamento em PDF Comercial e WhatsApp*) e **US-11** (*Emissão de Orçamento em PDF — Via Técnica de Oficina sob Sigilo Comercial*), além dos refinamentos de persistência e validação da **US-09** (*Descontos e Condições Comerciais*).

A suíte completa de testes automatizados unitários, de integração e ponta a ponta (E2E) foi executada e validada com 100% de taxa de sucesso.

* **Status do Quality Gate (SonarQube):** ✅ **APROVADO (PASSED)**
* **Cobertura Global no Código Novo:** `≥ 80.0%` (Atende a meta estrita do Quality Gate)
* **Taxa de Sucesso dos Testes:** `100%` (Zero falhas na baseline final)
* **Total de Testes Automatizados:** **1.153 testes aprovados** (555 Backend + 598 Frontend)

---

## 2. Consolidação da Pirâmide de Testes

| Camada / Tipo | Framework | Testes Executados | Passaram | Falharam | Cobertura (% New Code) |
|---|---|:---:|:---:|:---:|:---:|
| **Testes Unitários e Integração Backend** | Spring Boot Test + JUnit 5 + Mockito | 555 | 555 | 0 | ≥ 82.5% |
| **Testes de Componentes e Hooks Frontend** | Vitest + React Testing Library (76 arquivos) | 598 | 598 | 0 | ≥ 80.8% |
| **Testes E2E (End-to-End)** | Cypress (`qa03_e2e_journey.cy.ts`, `technical_pdf_journey.cy.ts`) | 8 | 8 | 0 | N/A |
| **TOTAL CONSOLIDADO** | — | **1.161** | **1.161** | **0** | **≥ 81.6%** |

---

## 3. Matriz de Rastreabilidade de Testes por User Story da Sprint 05

| User Story / Escopo | Módulo | Suítes e Testes Automatizados Implementados | Status |
|---|---|---|:---:|
| **US-09 (#133 / PR #293, #332)** | Backend / Budgets | `BudgetServiceTest`, `BudgetRepositoryTest`, `BudgetMapperTest`, `BudgetControllerTest` | ✅ Aprovado |
| **US-09 (#133 / PR #293, #332)** | Frontend / Budgets | `BudgetEditor.test.tsx`, `BudgetFinancialSummary.test.tsx`, `discountSchema.test.ts`, `useBudgets.test.tsx` | ✅ Aprovado |
| **US-10 (#134 / PRs #294-#331)** | Backend / PDF Comercial | `BudgetPdfServiceTest`, `BudgetPdfDrawingHelperTest`, `BudgetControllerTest` | ✅ Aprovado |
| **US-10 (#134 / PRs #294-#331)** | Frontend / WhatsApp & PDF | `BudgetDetailPage.test.tsx`, `WhatsAppSummaryModal.test.tsx`, `whatsappHelper.test.ts`, `budgetsApi.test.ts` | ✅ Aprovado |
| **US-11 (#135 / PRs #321-#352)** | Backend / PDF Técnico | `BudgetTechnicalPdfServiceTest`, `TechnicalMachiningResolverTest`, `BudgetPdfDrawingHelperTest` | ✅ Aprovado |
| **US-11 (#135 / PRs #321-#352)** | Frontend / Via Técnica | `BudgetDetailActions.test.tsx`, `BudgetRomaneioView.test.tsx`, `budgetsApi.test.ts` | ✅ Aprovado |
| **QA-03 (#73 / PR #330)** | E2E Integrado | `qa03_e2e_journey.cy.ts` e `qa03_e2e_journey.test.tsx` (Insumo ➔ Produto ➔ Orçamento ➔ PDF Comercial) | ✅ Aprovado |
| **QA-04 (#340 / PR #341)** | E2E Ficha Técnica | `technical_pdf_journey.cy.ts` e `RTE-QA-04-Relatorio_Testes_Ficha_Tecnica_Oficina.md` | ✅ Aprovado |

---

## 4. Métricas de Qualidade do SonarQube

| Métrica | Limite Exigido | Valor Atingido na Sprint 05 | Status |
|---|---|---|:---:|
| **New Bugs** | 0 | 0 | ✅ Aprovado |
| **New Vulnerabilities** | 0 | 0 | ✅ Aprovado |
| **Security Hotspots** | 100% revisados | 100% revisados (0 pendentes) | ✅ Aprovado |
| **Blocker / Critical Code Smells** | 0 | 0 | ✅ Aprovado |
| **Duplicação de Código (New Code)** | < 3.0% | 0.8% | ✅ Aprovado |
| **Cobertura de Linhas (New Code)** | ≥ 80.0% | **≥ 81.6%** | ✅ Aprovado |

---

## 5. Evidências de Execução Local

### 5.1 Backend (`.\mvnw.cmd test`):
```text
[INFO] Results:
[INFO] 
[INFO] Tests run: 555, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 35.787 s
```

### 5.2 Frontend (`npm test`):
```text
 Test Files 76 passed (76)
 Tests 598 passed (598)
 Duration 42.04s
```

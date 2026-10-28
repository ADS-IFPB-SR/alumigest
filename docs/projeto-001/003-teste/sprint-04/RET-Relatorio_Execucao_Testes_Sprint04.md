# 🧪 RET — Relatório de Execução de Testes — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos (US-09) e SonarQube |
| **Versão da Baseline** | `B-ALG-v0.4.0-S04-01` |
| **Planejamento BDD** | [`TEA-Testes_de_Aceitacao_Sprint04.md`](./TEA-Testes_de_Aceitacao_Sprint04.md) |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint04.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint04.md) |
| **Ata de Review & Retrospectiva** | [`ATA-Sprint_04_Review.md`](../../001-atas-reuniao/ATA-Sprint_04_Review.md) |
| **Período** | 01/09/2026 a 14/09/2026 |
| **QA Responsável** | Herbert Carvalho dos Santos / Equipe de QA AlumiGest |
| **Status Geral** | 🟢 **100% DOS TESTES AUTOMATIZADOS APROVADOS (88% Story Points Concluídos)** |

---

## 1. 🎯 Resumo Executivo da Qualidade

A Sprint 04 consolidou avanços estruturais decisivos para a precisão operacional do AlumiGest:
* **Taxa de Sucesso dos Testes:** `100%` (Zero falhas na suíte automatizada).
* **Story Points Entregues:** `44 / 50 pts` (88% de taxa de conclusão; os 6 pts remanescentes foram reprogramados para a Sprint 05 junto à diluição da US-12).
* **Quality Gate SonarQube:** ✅ **APROVADO (PASSED)** — Eliminação de ruídos no JaCoCo pós-exclusão de DTOs e Mappers.
* **Resolução de Não-Conformidade Crítica:** Eliminação definitiva do descarte atômico de itens em orçamentos (resolução do BUG-022 / Issue #300 via Budget V2).

---

## 2. 📋 Consolidação da Pirâmide de Testes (Sprint 04)

| Camada / Tipo de Teste | Frameworks / Ferramentas | Testes Executados | Passaram | Falharam | Cobertura (% Linhas) | Tempo Médio |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Testes Unitários Backend** | JUnit 5, Mockito | 186 | 186 | 0 | 87.2% | ~18s |
| **Testes de Integração Backend** | Spring Boot Test, MockMvc, H2 | 34 | 34 | 0 | 84.0% | ~22s |
| **Testes de Componentes Frontend** | Vitest, Testing Library, happy-dom | 52 | 52 | 0 | 85.6% | ~6s |
| **Testes de Aceitação BDD** | Gherkin / Cenários Homologados | 10 | 10 | 0 | 100% | Manual / E2E |
| **TOTAL CONSOLIDADO** | — | **282** | **282** | **0** | **≥ 85.8%** | **~46s** |

---

## 3. 🧩 Matriz de Rastreabilidade por User Story da Sprint 04

| User Story / Demanda | Módulo / Escopo | Classes de Teste Automatizadas | Status |
|---|---|---|:---:|
| **US-05 (Issue #126)** | Studio CAD SVG / Templates | `WindowSvgPreview.test.tsx`, `TemplateValidator.test.ts`, `CategoryRequirementsSelector.test.tsx` | 🟢 Aprovado |
| **US-46 (Issue #172)** | Orçamentos Budget V2 | `BudgetIntegrationTest`, `BudgetServiceTest`, `BudgetItemServiceTest`, `BudgetCascadeTest` | 🟢 Aprovado |
| **US-09 (Issue #133)** | Motor de Descontos e Frete | `PricingCalculatorTest`, `BudgetPricingServiceTest` | 🟢 Aprovado |
| **Quality (Issue #245)** | Saneamento SonarQube | Pipeline CI GitHub Actions, JaCoCo Coverage Segregation | 🟢 Aprovado |

---

## 4. 📊 Métricas de Qualidade do SonarQube

| Métrica | Limite Exigido | Valor Atingido na Sprint 04 | Status |
|---|---|---|:---:|
| **New Bugs** | 0 | 0 | ✅ Aprovado |
| **New Vulnerabilities** | 0 | 0 | ✅ Aprovado |
| **Security Hotspots** | 100% revisados | 100% revisados (0 pendentes) | ✅ Aprovado |
| **Blocker / Critical Code Smells** | 0 | 0 | ✅ Aprovado |
| **Duplicação de Código (New Code)** | < 3.0% | 1.8% | ✅ Aprovado |
| **Cobertura de Linhas (New Code)** | ≥ 80.0% | **85.8%** | ✅ Aprovado |

---

*Relatório de Testes homologado pela Equipe AlumiGest — Sprint 04 — Setembro/2026*

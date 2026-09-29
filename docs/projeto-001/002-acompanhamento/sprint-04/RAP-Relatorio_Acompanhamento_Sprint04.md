# RAP — Relatório de Acompanhamento — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube |
| **Período** | 01/09/2026 a 14/09/2026 (14 dias) |
| **Gerente da Sprint (LP)** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 2.0 (Homologado com Dados Reais do GitHub Projects) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📊 Resumo Executivo

A Sprint 04 compreendeu o período de **01/09/2026 a 14/09/2026**, totalizando **50 Story Points planejados** distribuídos em 5 demandas estratégicas.

Foram entregues com sucesso **44 Story Points (~88% de taxa de conclusão)**, correspondendo à conclusão integral da refatoração de templates SVG (`US-05 #126`), refatoração do motor de orçamentos V2 (`US-46 #172`), saneamento de débitos técnicos no SonarQube (`quality #245`) e a maior parcela funcional do motor de descontos e condições comerciais (`US-09 #133`).

A demanda `US-12 #136` (Homologação Integrada da Release 1 — 2 pts) **não foi executada isoladamente na Sprint 04**, tendo sido deliberada a sua **diluição entre as User Stories US-09 e US-10 no ciclo da Sprint 05**.

---

## 2. 📋 Entregas Realizadas vs. Planejadas

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Status de Entrega | Evidência Técnica |
|---|---|:---:|:---:|:---:|---|
| **quality #245** | Resolução de débitos técnicos e conformidade com SonarQube | 5 pts | 9.0h | ✅ **100% Entregue** (5/5 tarefas) | Exclusão de DTOs, conformidade com regras SonarLint e build verde |
| **US-05 #126** | Refatorar Produtos com Templates Paramétricos de Esquadrias | 5 pts | 17.0h | ✅ **100% Entregue** (9/9 tarefas) | 10 modelos canônicos em SVG, Studio CAD e `CategoryRequirementsSelector` |
| **US-46 #172** | Refatoração do Módulo de Orçamentos (Budget V2) | 6 pts | 18.5h | ✅ **100% Entregue** (6/6 tarefas) | Nova arquitetura de serviços desacoplados e tipagens estritas |
| **US-09 #133** | Aplicar Descontos e Condições Comerciais no Orçamento | 32 pts | 31.0h | 🟡 **Parcialmente Entregue** (28 pts) | Motor de cálculo de descontos em %/R$ e condições de pagamento implementados no backend; fechamento de UI migrado para a S05 |
| **US-12 #136** | Homologação Integrada e Validação da Release 1 (v1.0.0) | 2 pts | 5.0h | ⏸️ **Replanejada para S05** (0 pts) | Não executada; critérios de aceitação diluídos na US-09 e US-10 da Sprint 05 |
| **Total** | **Iteração Sprint 04** | **50 pts** | **80.5h** | 🟢 **44 pts Entregues (88%)** | **61 de 63 subtarefas tratadas no board** |

---

## 3. 🐞 Defeitos e Impedimentos Tratados na Sprint

1. **BUG-021 (Resolvido na Sprint 04):** Perda de insumos da ficha técnica em produtos estáticos e ocultação de templates na categoria janela (Issue #235). Corrigido na branch `fix/products-static-items-and-window-category`.
2. **BUG-022 / Issue #300 (Mapeado e Tratado):** Descarte silencioso de itens ao criar orçamento via `POST /api/budgets` por ausência da lista `items` no record `BudgetCreateRequest`. Corrigido com adição do campo com `@Valid` e processamento automático no `BudgetService.create`.

---

## 4. 📈 Indicadores de Produtividade da Sprint 04

* **Story Points Planejados:** 50 pts
* **Story Points Concluídos:** 44 pts (Taxa de Conclusão: 88%)
* **Story Points Não Realizados / Replanejados:** 6 pts (4 pts remanescentes da US-09 + 2 pts da US-12)
* **Horas Estimadas Totais:** 80.5h
* **Qualidade Estática SonarQube:** Rating A em Confiabilidade e Segurança; zero vulnerabilidades; Quality Gate aprovado.

---

## 5. 🚀 Decisões de Transição para a Sprint 05

Em alinhamento entre o Product Owner e a equipe técnica:
1. **US-09 (Finalização):** O fechamento da interface de orçamentos e detalhes de visualização é integrado com a US-10.
2. **Diluição da US-12:** A homologação da Release 1 passa a ser executada como Definition of Done (DoD) incremental das US-09 e US-10 durante a Sprint 05, garantindo que o software chegue homologado e testado sem etapa intermediária de congelamento.

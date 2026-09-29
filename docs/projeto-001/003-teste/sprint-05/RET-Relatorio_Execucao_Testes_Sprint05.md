# 🧪 RET — Relatório de Execução de Testes — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica de Oficina (US-11) e Homologação da Release 1 |
| **Período** | 15/09/2026 a 28/09/2026 |
| **QA Responsável** | Herbert Carvalho dos Santos / Joseph Cavalcante / Equipe AlumiGest |
| **Status Geral** | 🟢 **QA-02 (Orçamentos): APROVADO** \| 🟢 **QA-04 (Via Técnica): APROVADO** \| 🟡 **BUGs #348/#349: Em Observação** |

---

## 1. 🎯 Escopo dos Testes da Sprint 05

A Sprint 05 concentrou os esforços de qualidade na validação da **Release 1 (v1.0.0)** do AlumiGest, cobrindo:
1. **QA-02 (#72) — Módulo de Orçamentos (US-09):** Validação completa do fluxo de criação de orçamentos, cálculo automático, edição, transições de status e visualização comercial via `BudgetDetailPage`.
2. **QA-04 (#340) — Via Técnica de Oficina (US-11):** Validação do motor vetorial de usinagem, sigilo comercial estrito, motor OpenPDF, layouts de Ficha Técnica e fluxo de download.
3. **Correção de 6 BUGs in-sprint:** Issues #342–#347 identificadas e corrigidas durante a própria sprint durante validação da Via Técnica.
4. **Testes de Integração Backend:** Suíte expandida cobrindo `BudgetPdfService`, `BudgetPdfDrawingHelper` e `TechnicalMachiningResolver`.

---

## 2. 📋 Resultados dos Planos de Teste Executados

| Plano de Teste | Issue GitHub | Escopo | Status | Detalhes |
|---|:---:|---|:---:|---|
| **QA-02** | [#72](https://github.com/ADS-IFPB-SR/alumigest/issues/72) | Módulo de Orçamentos ponta a ponta (API REST + Motor + Frontend) | 🟢 **APROVADO** | Ver [RTE-QA-02](RTE-QA-02-Relatorio_Testes_Orcamentos.md) |
| **QA-04** | [#340](https://github.com/ADS-IFPB-SR/alumigest/issues/340) | Via Técnica de Oficina (PDF, sigilo comercial, motor vetorial, E2E) | 🟢 **APROVADO** | Ver [RTE-QA-04](RTE-QA-04-Relatorio_Testes_Via_Tecnica.md) |

---

## 3. 🐛 BUGs Identificados e Tratados na Sprint 05

| BUG ID | Issue | Descrição Resumida | Severidade | Status | Resolução |
|:---:|:---:|:---|:---:|:---:|:---|
| BUG-023 | [#342](https://github.com/ADS-IFPB-SR/alumigest/issues/342) | Motor de usinagem desenha moldura genérica para todas as tipologias | 🔴 Alta | ✅ Corrigido | `TechnicalMachiningFrameRenderer` refatorado com suporte multifolhas |
| BUG-024 | [#343](https://github.com/ADS-IFPB-SR/alumigest/issues/343) | Nome do arquivo PDF corrompido com encoding MIME literal | 🔴 Alta | ✅ Corrigido | `ContentDisposition` sem charset forçado; `extractFilenameFromContentDisposition` no frontend |
| BUG-025 | [#344](https://github.com/ADS-IFPB-SR/alumigest/issues/344) | Termos em inglês no PDF técnico (`TUBULAR`, `RIGHT`, `AWNING_WINDOW`) | 🟡 Média | ✅ Corrigido | Dicionário de tradução pt-BR em `FormatadorValoresPdf` |
| BUG-026 | [#345](https://github.com/ADS-IFPB-SR/alumigest/issues/345) | Cota e rótulo do puxador cortados na margem lateral | 🔴 Alta | ✅ Corrigido | Canvas redimensionado para $126 \times 96$ pt com margens assimétricas |
| BUG-027 | [#346](https://github.com/ADS-IFPB-SR/alumigest/issues/346) | Sigla ambígua "Mont." no checklist de produção | 🟢 Baixa | ✅ Corrigido | Expandido para "Montagem" com ajuste tipográfico |
| BUG-028 | [#347](https://github.com/ADS-IFPB-SR/alumigest/issues/347) | Esquema de usinagem de folha única para esquadrias correr 2F/4F | 🔴 Alta | ✅ Corrigido | Divisão geométrica multifolhas no `TechnicalMachiningFrameRenderer` |
| BUG-029 | [#348](https://github.com/ADS-IFPB-SR/alumigest/issues/348) | Inconsistência entre texto (3 furos) e desenho técnico (2 furos) | 🟡 Média | ⏳ Em Observação | Chave `holesCount` vs `holeCount` no fallback de `BudgetPdfService` |
| BUG-030 | [#349](https://github.com/ADS-IFPB-SR/alumigest/issues/349) | Falta de cotas milimétricas reais e linha divisória cortando puxador duplo | 🟡 Média | ⏳ Em Observação | `TechnicalMachiningResolver` sem cálculo de posições absolutas em mm |

---

## 4. 🔍 Qualidade de Código (SonarQube / SonarLint)

* **Quality Gate:** ✅ Aprovado nos PRs de US-10 e US-11.
* **Cobertura em New Code:** ≥ 80% em `BudgetPdfService`, `BudgetPdfDrawingHelper` e `TechnicalMachiningResolver`.
* **Vulnerabilidades:** Zero vulnerabilidades SAST identificadas.
* **Protocolo SonarLint Pré-PR:** Mantido conforme `.agents/rules/qualidade-sonarlint.md`.

---

## 5. 📊 Resumo Executivo de QA da Sprint 05

```
┌──────────────────────────────────────────────────────────────────┐
│                 RESULTADO DOS TESTES SPRINT 05                   │
├──────────────────────────────────────────────────────────────────┤
│ QA-02 (Módulo de Orçamentos):  APROVADO (100% cenários)          │
│ QA-04 (Via Técnica de Oficina): APROVADO (100% cenários)         │
│ BUGs Corrigidos In-Sprint: 6 (#342–#347)                         │
│ BUGs Em Observação Pós-Sprint: 2 (#348–#349)                     │
│ Quality Gate SonarQube: APROVADO                                 │
│ Release 1 (v1.0.0): HOMOLOGADA E ENTREGUE                        │
└──────────────────────────────────────────────────────────────────┘
```

---

*Relatório de Testes homologado pelo QA / Equipe AlumiGest — Sprint 05 — 28/09/2026*


# PIT — Plano de Iteração — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica de Oficina (US-11) e Homologação da Release 1 (US-12) |
| **Período** | 15/09/2026 a 28/09/2026 (14 dias) |
| **Gerente da Sprint (LP)** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 1.0 (Alinhado com o GitHub Projects — label `sprint-05`) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 05

Entregar a **Release 1 (v1.0.0)** do AlumiGest, consolidando o fechamento das funcionalidades comerciais pendentes da Sprint 04 e implementando as vias de emissão de documentos (PDF e WhatsApp):

1. **Fechamento da US-09 (#133) — Descontos e Condições Comerciais:** Integração ponta a ponta da UI de orçamentos, validação E2E do wizard, transições de status e emissão de propostas comerciais (4 pts remanescentes da Sprint 04).
2. **US-10 (#134) — PDF Via Comercial e WhatsApp:** Implementação completa do motor OpenPDF para geração de proposta comercial estilizada e do resumo de WhatsApp com emojis e totalizadores (13 pts).
3. **US-11 (#135) — PDF Via Técnica de Oficina:** Motor vetorial de usinagem com furações cotadas em mm, puxadores dimensionados, ficha de checklist fabril e sigilo comercial estrito — sem valores monetários (13 pts).
4. **US-12 (#136) — Homologação Integrada da Release 1:** Critérios de aceitação e DoD absorvidos como Definition of Done incremental das US-09 e US-10. QA-02 e QA-04 executados e homologados (diluído / sem pontos isolados).
5. **Resolução de BUGs da Sprint 05:** Correção de inconsistências identificadas durante a validação da Via Técnica — incluindo esquema de usinagem multifolhas, siglas ambíguas, encoding de nomes de arquivo, termos em inglês e cotas de furação.

---

## 2. 📋 Backlog da Sprint 05 (Quadro Oficial GitHub Projects)

| Issue / Demanda | Descrição da Entrega | Story Points | Horas Estimadas | Subtarefas | Status Real da Sprint 05 |
|---|---|:---:|:---:|:---:|:---:|
| **US-09 #133** (fechamento) | Integração final da UI de orçamentos, wizard e transições de status | 4 pts | 8.0h | ✅ Concluídas | 🟢 **100% Concluído** *(fechamento do saldo da S04)* |
| **US-10 #134** | PDF Via Comercial (OpenPDF) e Resumo WhatsApp | 13 pts | 30.0h | ✅ Concluídas | 🟢 **100% Concluído** |
| **US-11 #135** | PDF Via Técnica de Oficina com motor vetorial de usinagem | 13 pts | 35.0h | ✅ Concluídas | 🟢 **100% Concluído** *(com BUGs identificados e corrigidos in-sprint)* |
| **US-12 #136** | Homologação Integrada da Release 1 (v1.0.0) — DoD diluído | — | — | QA-02 e QA-04 ✅ | 🟢 **Homologada** *(DoD incorporado nas US-09, US-10 e US-11)* |
| **BUGs Sprint 05** | Correção de 6+ bugs da Via Técnica (encoding, multifolhas, i18n, cotas) | 6 pts | 10.0h | ✅ Corrigidos | 🟡 **Maioria Corrigida** *(#348, #349 em observação)* |
| **Total Planejado** | **4 Demandas Principais + BUGs** | **~36 pts** | **~83.0h** | — | 🟢 **Release 1 Entregue** |

---

## 3. 🔄 Escopo Migrado da Sprint 04 e Contexto

* **US-09 (4 pts remanescentes):** A etapa final de integração da interface de orçamentos (BudgetDetailPage, transições de status e validação E2E via QA-02) foi concluída no início da Sprint 05 em integração com a US-10.
* **Diluição da US-12 (Homologação):** Os critérios de aceite da Release 1 foram executados como DoD incremental das US-09 (QA-02 — Issue #72) e US-11 (QA-04 — Issue #340), garantindo entrega validada e homologada sem etapa de congelamento.

---

## 4. 🐞 BUGs Tratados na Sprint 05

| Issue | Título | Status |
|---|---|:---:|
| **#342** | Motor de usinagem renderiza moldura genérica para todas as tipologias (Giro 2F, Basculante, Gaveta) | ✅ Corrigido |
| **#343** | Nome do arquivo PDF baixado corrompido com encoding MIME literal (`=_UTF-8_Q_..._=`) | ✅ Corrigido |
| **#344** | Termos em inglês exibidos nos badges de puxador, posição e tipologia no PDF técnico | ✅ Corrigido |
| **#345** | Cota e rótulo do puxador cortados na margem lateral do esquema técnico | ✅ Corrigido |
| **#346** | Sigla ambígua "Mont." no checklist de produção da Ficha Técnica | ✅ Corrigido |
| **#347** | Esquema técnico de usinagem desenha folha única para esquadrias de correr 2F/4F | ✅ Corrigido |
| **#348** | Inconsistência entre texto de furação (3 furos) e desenho técnico (2 furos) na Ficha Técnica | ⏳ Em Observação |
| **#349** | Falta de cotas milimétricas reais de furação e linha divisória cortando texto do puxador duplo | ⏳ Em Observação |

---

## 5. 🛡️ Riscos e Mitigações Registrados na Sprint 05

* **Risco R11 (Vazamento de Dados Comerciais na Oficina):** Mitigado com sigilo comercial estrito na Via Técnica — ausência absoluta de `R$`, preços, subtotais e descontos validada por regex no PDF extraído.
* **Risco R14 (Encoding de Nomes de Arquivo PDF):** Corrigido no Backend (`ContentDisposition` sem charset forçado) e no Frontend (função utilitária `extractFilenameFromContentDisposition` em `budgetsApi.ts`).
* **Risco R15 (Inconsistência no Esquema de Usinagem Multifolhas):** Corrigido no `TechnicalMachiningFrameRenderer` com suporte a `SWING_2F`, `SLIDING_2F/4F`, `AWNING_WINDOW`, `DRAWER` e `FIXED`.

---

*Plano de Iteração elaborado com dados reais do quadro de acompanhamento da Sprint 05 — Versão 1.0 — 29/09/2026*

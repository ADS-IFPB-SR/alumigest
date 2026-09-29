# RAP — Relatório de Acompanhamento — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica de Oficina (US-11) e Homologação da Release 1 (US-12) |
| **Período** | 15/09/2026 a 28/09/2026 (14 dias) |
| **Gerente da Sprint (LP)** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 1.0 (Homologado com Dados Reais do GitHub Projects) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 📊 Resumo Executivo

A Sprint 05 compreendeu o período de **15/09/2026 a 28/09/2026**, totalizando **~36 Story Points planejados** distribuídos entre o saldo migrado da Sprint 04 (4 pts) e as novas demandas estratégicas (32 pts).

Foram entregues com sucesso **~30 Story Points (~83% de taxa de conclusão)**, correspondendo ao fechamento integral da US-09 (Descontos e Condições Comerciais), à implementação completa da US-10 (PDF Via Comercial e WhatsApp) e à US-11 (PDF Via Técnica de Oficina com motor vetorial de usinagem).

A **Release 1 (v1.0.0)** foi homologada no encerramento da sprint, com QA-02 (#72) e QA-04 (#340) executados com sucesso, validando o fluxo ponta a ponta de criação de orçamentos, emissão de PDFs e envio via WhatsApp.

Foram identificados e corrigidos **6 BUGs críticos** da Via Técnica durante a própria sprint, com 2 itens de melhoria (#348 e #349) registrados em observação para tratamento pós-release.

---

## 2. 📋 Entregas Realizadas vs. Planejadas

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Status de Entrega | Evidência Técnica |
|---|---|:---:|:---:|:---:|---|
| **US-09 #133** (fechamento) | Integração final da UI de orçamentos e transições de status | 4 pts | 8.0h | ✅ **100% Entregue** | `BudgetDetailPage.tsx`, `BudgetStatusBadge`, QA-02 (#72) homologado com 100% dos cenários aprovados |
| **US-10 #134** | Emitir e Exportar Orçamento em PDF — Via Comercial e WhatsApp | 13 pts | 30.0h | ✅ **100% Entregue** | Motor OpenPDF (`BudgetPdfService`), resumo WhatsApp com emojis e i18n, download de PDF sem re-renderização de tela |
| **US-11 #135** | Emitir Orçamento em PDF — Via Técnica de Oficina | 13 pts | 35.0h | ✅ **100% Entregue** *(com BUGs tratados in-sprint)* | Motor vetorial `BudgetPdfDrawingHelper` com usinagem por tipologia, furações em `Color.RED` e puxadores cotados; Ficha Técnica com sigilo comercial estrito; QA-04 (#340) homologado |
| **US-12 #136** | Homologação Integrada da Release 1 (v1.0.0) | — | — | ✅ **Homologada como DoD** | Critérios da Release 1 executados via QA-02 e QA-04; fluxo E2E validado: Orçamento → PDF Comercial → Via Técnica → WhatsApp |
| **BUGs #342–#347** | Correções in-sprint da Via Técnica (encoding, multifolhas, i18n, canvas) | 6 pts | 10.0h | ✅ **Corrigidos** | Branches `fix/342`, `feat/us-11-*`; 6 issues fechadas como `completed` |
| **BUGs #348–#349** | Cotas milimétricas de furação e texto puxador duplo cortado | — | — | ⏳ **Em Observação** | Issues abertas ao final da sprint; sem impacto bloqueante na Release 1 |
| **Total** | **Iteração Sprint 05** | **~36 pts** | **~83.0h** | 🟢 **~30 pts Entregues (~83%)** | **Release 1 homologada e entregue** |

---

## 3. 🐞 Defeitos e Impedimentos Tratados na Sprint

1. **BUG #342 (Corrigido):** Motor de usinagem técnico (`TechnicalMachiningFrameRenderer`) renderizava moldura genérica de folha única para todas as tipologias. Corrigido com suporte a `SWING_2F`, `SLIDING_2F/4F`, `AWNING_WINDOW`, `DRAWER` e `FIXED`. Branch: `fix/342-esquema-usinagem-correr-multifolhas`.
2. **BUG #343 (Corrigido):** Nome do arquivo PDF corrompido com encoding MIME literal (`=_UTF-8_Q_..._=`). Corrigido no Backend (`ContentDisposition` sem charset UTF-8 forçado) e no Frontend (função `extractFilenameFromContentDisposition` em `budgetsApi.ts`).
3. **BUG #344 (Corrigido):** Termos técnicos em inglês (`TUBULAR`, `RIGHT`, `AWNING_WINDOW`) exibidos nos badges de puxador e tipologia. Corrigido com dicionário de tradução centralizado no `FormatadorValoresPdf`.
4. **BUG #345 (Corrigido):** Rótulo do puxador cortado na margem lateral. Corrigido com redimensionamento do canvas de $105 \times 105$ pt para $126 \times 96$ pt e margens assimétricas com fallback de quebra de linha.
5. **BUG #346 (Corrigido):** Sigla ambígua "Mont." no checklist de produção da Ficha Técnica expandida para "Montagem" com ajuste tipográfico.
6. **BUG #347 (Corrigido):** Esquema técnico de usinagem desenhava moldura de folha única para esquadrias de correr 2F/4F. Corrigido no `TechnicalMachiningFrameRenderer`.
7. **BUG #348 (Em Observação):** Inconsistência entre texto de furação (3 furos no card) e desenho técnico (2 furos no canvas) — chave `holesCount` x `holeCount` no fallback de `BudgetPdfService`.
8. **BUG #349 (Em Observação):** Falta de cotas milimétricas reais de furação e linha divisória central cortando o rótulo do puxador duplo (`SWING_DOOR_2F`).

---

## 4. 📈 Indicadores de Produtividade da Sprint 05

* **Story Points Planejados:** ~36 pts
* **Story Points Concluídos:** ~30 pts (Taxa de Conclusão: ~83%)
* **Story Points em Observação:** 6 pts (BUGs #348 e #349 sem impacto bloqueante)
* **Horas Estimadas Totais:** ~83.0h
* **BUGs Resolvidos In-Sprint:** 6 (#342–#347)
* **QAs Homologados:** QA-02 (#72) — Módulo de Orçamentos; QA-04 (#340) — Via Técnica de Oficina
* **Release Entregue:** Release 1 (v1.0.0) — Fluxo completo: Orçamento → PDF Comercial → Via Técnica → WhatsApp

---

## 5. 🚀 Decisões de Transição para a Sprint 06

Em alinhamento entre o Product Owner e a equipe técnica:
1. **BUGs #348 e #349 (Melhoria da Via Técnica):** A inconsistência de contagem de furos e a ausência de cotas milimétricas reais serão tratadas como melhoria incremental na Sprint 06, sem bloquear o aceite da Release 1.
2. **BUGs UX (#333, #335, #336, #337, #338):** Issues de melhoria de UX e validação de entradas (duplicação de mão de obra, modal WhatsApp coberto por SVG, telefone do cliente ausente) identificadas durante a Sprint 05 serão priorizadas no backlog da Sprint 06.
3. **Continuidade da Release 1:** O ciclo de sustentação e monitoramento via Spring Boot Actuator (US-45) e a gestão de pedidos serão os focos estratégicos da próxima sprint.

---

*Relatório de Acompanhamento elaborado com dados reais do quadro de acompanhamento da Sprint 05 — Versão 1.0 — 29/09/2026*

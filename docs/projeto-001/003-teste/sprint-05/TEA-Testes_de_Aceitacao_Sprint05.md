# 🧪 TEA — Testes de Aceitação e Cenários BDD — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica (US-11) e Release 1 |
| **Versão da Baseline** | `B-ALG-v1.0.0-S05-01` (Release 1) |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint05.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint05.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint05.md`](./RET-Relatorio_Execucao_Testes_Sprint05.md) |
| **Relatórios de Apoio QA** | [`RTE-QA-02`](./RTE-QA-02-Relatorio_Testes_Orcamentos.md) \| [`RTE-QA-04`](./RTE-QA-04-Relatorio_Testes_Via_Tecnica.md) |
| **Status Global** | 🟢 Homologado e Automatizado (Release 1 Aprovada para Produção) |
| **Data de Homologação** | 28/09/2026 |

---

## 1. Visão Geral e Estratégia de Testes da Sprint 05

A Sprint 05 consolidou a homologação oficial da **Release 1 (v1.0.0)** do AlumiGest, abrangendo:
1. **QA-02 (Issue #72) — Módulo de Orçamentos:** Validação ponta a ponta do fluxo comercial (Wizard, criação multi-itens, transições de status `DRAFT` ➔ `SENT` ➔ `APPROVED` e recálculo reativo no `BudgetItemCard`).
2. **QA-04 (Issue #340) — Via Técnica de Oficina (US-11):** Geração do PDF técnico institucional com **sigilo comercial estrito** (ausência absoluta de valores monetários `R$`), motor vetorial de usinagem e desenhos cotados.
3. **Resolução de 6 Defeitos In-Sprint:** Correção das Issues #342 a #347 (molduras multifolhas, encoding MIME de download de PDF, tradução para pt-BR e cotas de puxador).

---

## 2. Matriz Canônica BDD / E2E por História de Usuário

### US-09: Módulo de Orçamentos e Transições de Status (QA-02 / Issue #72)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 01 | Criação Completa com Código Sequencial Anual | `BudgetControllerTest` / `BudgetServiceTest` | Teste de Integração Spring Boot | Cliente ativo e esquadrias configuradas | Envia requisição `POST /api/budgets` | Gera código sequencial anual `ORC-YYYY-NNN` (ex: `ORC-2026-0001`) com status `DRAFT` | ✅ Passou |
| 02 | Aplicação de Área Mínima de Faturamento ($0,25 m^2$) | `BudgetQuantityServiceTest` | Teste Unitário Matemático | Esquadria com dimensões nominais de $300 \times 400\text{ mm}$ ($0,12 m^2$) | Motor calcula área de faturamento | Aplica piso automático de $0,25 m^2$ conforme norma técnica | ✅ Passou |
| 03 | Transição de Ciclo de Vida `DRAFT → SENT → APPROVED` | `BudgetServiceTest` | Teste de Máquina de Estados | Orçamento em estado `DRAFT` | Dispara ações sucessivas de envio e aprovação do cliente | Atualiza status persistido e bloqueia edições de itens pós-aprovação | ✅ Passou |
| 04 | Romaneio de Peças e Lista de Corte | `BudgetDetailViewTest.tsx` | Vitest / Testing Library | Orçamento aberto na tela de detalhes | Acessa a aba "Romaneio de Peças" | Exibe lista quantitativa de corte de perfis e área de vidro multiplicada pela quantidade de itens | ✅ Passou |

---

### US-11: Emissão de PDF — Via Técnica de Oficina (QA-04 / Issue #340)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 05 | Emissão da Via Técnica com Sucesso | `BudgetPdfServiceTest` | Teste de Geração OpenPDF | Orçamento aprovado existente | Dispara `GET /api/budgets/{id}/pdf/tecnico` | Retorna HTTP 200, `application/pdf` e nome `ORC-YYYY-NNN-tecnico.pdf` sem encoding MIME corrompido | ✅ Passou |
| 06 | Sigilo Comercial Estrito (Zero Valores Financeiros) | `PdfSecurityExtractorTest` | Validação Textual com iText / Regex | PDF técnico gerado via backend | Varre o documento buscando regex `/R\$/` e padrões monetários | Zero ocorrências de preços ou subtotais; apenas cotas e unidades físicas | ✅ Passou |
| 07 | Badge Oficial de Oficina no Cabeçalho | `BudgetPdfServiceTest` | Asserção Estrutural de Layout | Qualquer página do PDF gerado | Inspeciona cabeçalho | Badge obrigatório presente: `VIA TÉCNICA - USO INTERNO / OFICINA` | ✅ Passou |
| 08 | Motor Vetorial com Cotagem de Usinagem e Puxador | `TechnicalMachiningResolverTest` | Teste Vetorial de Desenho | Esquadria multifolha com puxador e 3 furações | Renderiza o bloco de usinagem | Furações plotadas em vermelho com cotas e puxador dimensionado sem corte de margem | ✅ Passou |
| 09 | Bloqueio de Emissão para Proposta Cancelada | `BudgetPdfControllerTest` | Validação de Domínio Spring MVC | Orçamento no status `CANCELLED` | Tenta emitir via técnica | Retorna HTTP 422 Unprocessable Entity com mensagem de bloqueio | ✅ Passou |

---

## 3. Rastreabilidade com os Requisitos do Sistema

| Cenário TEA | Requisito Funcional (RF) | Regra de Negócio (RN) | Issue GitHub / PR |
|:---:|:---:|:---:|:---:|
| 01 – 04 | `RF-009` (Módulo de Orçamentos) | `RN-ORC01` (Cálculo) / `RN-ORC04` (Estados) | Issue #72 / Issue #133 |
| 05 – 09 | `RF-012` (Via Técnica de Produção) | `RN-PDF01` (Sigilo Comercial) / `RN-CAD03` (Usinagem) | Issue #340 / Issue #135 |
| 05 (Hotfix) | `RNF-002` (Compatibilidade MIME) | RFC 5987 / Content-Disposition | Issues #342 a #347 |

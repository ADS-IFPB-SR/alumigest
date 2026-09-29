# 🧪 RTE — Relatório Técnico de Execução — QA-04 (Via Técnica de Oficina)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Documento** | Relatório Técnico de Execução de Testes — Via Técnica de Oficina |
| **Demanda / Issue** | [Issue #340](https://github.com/ADS-IFPB-SR/alumigest/issues/340) — `test(qa): QA-04 - Plano de Teste e Validação E2E da Via Técnica de Oficina (US-11)` |
| **Issue Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF — Via Técnica de Oficina` |
| **Sprint** | 05 — PDF Via Técnica de Oficina (US-11) |
| **Período de Validação** | 22/09/2026 a 28/09/2026 |
| **QA Responsável** | Joseph Cavalcante / Gabriel Santos / Equipe AlumiGest |
| **Ambiente de Testes** | Local DEV (`http://localhost:5173` / `http://localhost:8081`) e CI GitHub Actions |
| **Status Geral** | 🟢 **APROVADO** — Cenários principais homologados \| 🟡 BUGs #348/#349 em observação |

---

## 1. 🎯 Objetivo e Contexto

Este relatório formaliza a execução do plano de teste **QA-04**, validando o fluxo completo de emissão da **Via Técnica de Oficina (Ficha Técnica de Chão de Fábrica)**, incluindo:
1. **API de Emissão:** Endpoints `GET /api/budgets/{id}/pdf/tecnico` e `/api/orcamentos/{id}/pdf/tecnico`.
2. **Motor Vetorial de Usinagem (`BudgetPdfDrawingHelper`):** Renderização por tipologia, furações cotadas e puxadores dimensionados.
3. **Sigilo Comercial Estrito:** Ausência absoluta de valores financeiros na Via Técnica.
4. **Frontend (`BudgetDetailPage`):** Botão "Via Técnica", feedback de carregamento e tratamento de erros.
5. **BUGs identificados e corrigidos in-sprint (#342–#347).**

---

## 2. 📋 Cenários Backend — API REST e Motor OpenPDF

### 2.1 Endpoints e Respostas HTTP

| ID | Cenário | Endpoint | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **BE-PDF-T-01** | Emissão da Via Técnica com sucesso | `GET /api/budgets/{id}/pdf/tecnico` | HTTP 200, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="ORC-2026-0002-tecnico.pdf"` | 🟢 Aprovado |
| **BE-PDF-T-02** | Endpoint alternativo `/api/orcamentos` | `GET /api/orcamentos/{id}/pdf/tecnico` | Mesmo comportamento do endpoint principal | 🟢 Aprovado |
| **BE-PDF-T-03** | Orçamento inexistente | `GET /api/budgets/99999/pdf/tecnico` | HTTP 404 `Not Found` | 🟢 Aprovado |
| **BE-PDF-T-04** | Orçamento cancelado | `GET /api/budgets/{id-cancelado}/pdf/tecnico` | HTTP 422 `Unprocessable Entity` | 🟢 Aprovado |
| **BE-PDF-T-05** | Nome do arquivo sem encoding corrompido | Download do PDF | Arquivo salvo como `ORC-2026-0002-tecnico.pdf` sem encoding MIME literal | 🟢 Aprovado *(após correção BUG-024)* |

### 2.2 Sigilo Comercial — Ausência de Valores Financeiros

| ID | Validação | Método | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **BE-PDF-T-06** | Ausência de `R$` no PDF técnico | Extração de texto via `PdfTextExtractor` (iTextSharp) + regex `/R\$/` | Nenhuma ocorrência encontrada em 5 PDFs distintos testados | 🟢 Aprovado |
| **BE-PDF-T-07** | Ausência de preços unitários e subtotais | Regex de valores monetários `\d{1,3}(\.\d{3})*,\d{2}` | Ausência confirmada; apenas medidas em mm e áreas em m² | 🟢 Aprovado |
| **BE-PDF-T-08** | Badge "VIA TÉCNICA - USO INTERNO / OFICINA" | Texto extraído do PDF | Badge presente no cabeçalho de todas as páginas | 🟢 Aprovado |

### 2.3 Motor Vetorial de Usinagem — Validação por Tipologia

| ID | Tipologia | Canvas e Elementos Técnicos | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **BE-PDF-T-09** | `SWING_DOOR_1F` (Giro 1 Folha) | 1 folha, arco de abertura, dobradiças à esquerda, puxador na lateral móvel | Motor renderiza corretamente | 🟢 Aprovado |
| **BE-PDF-T-10** | `SWING_DOOR_2F` (Giro 2 Folhas) | 2 folhas divididas, puxadores duplos centrais | Motor renderiza corretamente *(após correção BUG-023)* | 🟢 Aprovado |
| **BE-PDF-T-11** | `SLIDING_DOOR_2F` (Correr 2 Folhas) | 2 caixilhos proporcionais, setas de deslizamento | Motor renderiza divisão bifolha *(após correção BUG-028)* | 🟢 Aprovado |
| **BE-PDF-T-12** | `SLIDING_DOOR_4F` (Correr 4 Folhas) | 4 caixilhos proporcionais | Motor renderiza divisão de 4 folhas corretamente | 🟢 Aprovado |
| **BE-PDF-T-13** | `AWNING_WINDOW` (Maxim-Ar) | Folha com projeção vertical, fecho concha inferior | Motor renderiza tipologia de basculante | 🟢 Aprovado |
| **BE-PDF-T-14** | Furações em vermelho com cotas | Círculos `Color.RED` com linhas-guia pontilhadas e rótulos de cota | Furações plotadas nas coordenadas corretas | 🟢 Aprovado |
| **BE-PDF-T-15** | Puxador cotado na folha | Rótulo com comprimento (ex: `Puxador (25cm)`) posicionado na folha | Puxador com cota legível sem corte de margem *(após BUG-026)* | 🟢 Aprovado |
| **BE-PDF-T-16** | Labels em português — tipologia e puxador | Badges: `Tubular`, `Direita`, `Janela Maxim-Ar` | Traduções aplicadas corretamente *(após BUG-025)* | 🟢 Aprovado |

---

## 3. 📋 Cenários Frontend — `BudgetDetailPage` e Botão "Via Técnica"

| ID | Cenário | Procedimento | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **FE-PDF-T-01** | Botão "Via Técnica" renderizado | Acessar `BudgetDetailPage` de orçamento ativo | Botão `[data-testid="btn-download-pdf-tecnico"]` visível na toolbar de ações | 🟢 Aprovado |
| **FE-PDF-T-02** | Download disparado sem reload | Clicar em "Via Técnica" | `budgetsApi.downloadPdfTecnico` executado; arquivo baixado sem recarregar a página | 🟢 Aprovado |
| **FE-PDF-T-03** | Feedback de carregamento (spinner) | Clicar e observar durante o processamento | Ícone `animate-spin`, texto "Gerando..." e botão `disabled` durante o carregamento | 🟢 Aprovado |
| **FE-PDF-T-04** | Toast de sucesso | Após download completo | Toast: "PDF da Ficha Técnica baixado com sucesso!" exibido corretamente | 🟢 Aprovado |
| **FE-PDF-T-05** | Orçamento cancelado — botão desabilitado | Acessar `BudgetDetailPage` de orçamento `CANCELLED` | Botão desabilitado com cursor `not-allowed` e tooltip explicativo | 🟢 Aprovado |
| **FE-PDF-T-06** | Tratamento de erro do backend | Simular falha HTTP 500 | Toast de erro amigável exibido sem crash da aplicação | 🟢 Aprovado |

---

## 4. 🐛 BUGs Identificados e Tratados Durante o QA-04

| BUG ID | Issue | Descrição | Status |
|:---:|:---:|:---|:---:|
| BUG-023 | [#342](https://github.com/ADS-IFPB-SR/alumigest/issues/342) | Moldura genérica para todas as tipologias — corrigido no `TechnicalMachiningFrameRenderer` | ✅ Resolvido antes da homologação |
| BUG-024 | [#343](https://github.com/ADS-IFPB-SR/alumigest/issues/343) | Encoding MIME corrompido no nome do arquivo | ✅ Resolvido antes da homologação |
| BUG-025 | [#344](https://github.com/ADS-IFPB-SR/alumigest/issues/344) | Termos em inglês no PDF técnico | ✅ Resolvido antes da homologação |
| BUG-026 | [#345](https://github.com/ADS-IFPB-SR/alumigest/issues/345) | Rótulo do puxador cortado na margem | ✅ Resolvido antes da homologação |
| BUG-027 | [#346](https://github.com/ADS-IFPB-SR/alumigest/issues/346) | Sigla "Mont." ambígua no checklist | ✅ Resolvido antes da homologação |
| BUG-028 | [#347](https://github.com/ADS-IFPB-SR/alumigest/issues/347) | Folha única para esquadrias de correr 2F/4F | ✅ Resolvido antes da homologação |
| BUG-029 | [#348](https://github.com/ADS-IFPB-SR/alumigest/issues/348) | Inconsistência de contagem de furos (texto vs. desenho) | ⏳ Em Observação — sem impacto bloqueante |
| BUG-030 | [#349](https://github.com/ADS-IFPB-SR/alumigest/issues/349) | Cotas milimétricas de furação ausentes e linha cortando puxador duplo | ⏳ Em Observação — sem impacto bloqueante |

---

## 5. 📊 Resumo Executivo QA-04

```
┌──────────────────────────────────────────────────────────────────┐
│          RESULTADO — QA-04 VIA TÉCNICA DE OFICINA (US-11)        │
├──────────────────────────────────────────────────────────────────┤
│ Cenários Backend (API + PDF + Usinagem): 16/16 APROVADOS (100%) │
│ Cenários Frontend (UI + Download):        6/6 APROVADOS (100%)  │
│ BUGs Corrigidos Antes da Homologação:     6 (#342–#347)          │
│ BUGs Em Observação (não bloqueantes):     2 (#348, #349)         │
│ Sigilo Comercial: VALIDADO (zero R$ no PDF técnico)              │
│ Homologação:       ✅ APROVADO — Via Técnica homologada          │
└──────────────────────────────────────────────────────────────────┘
```

---

*Relatório QA-04 homologado pela Equipe AlumiGest — Sprint 05 — 28/09/2026*


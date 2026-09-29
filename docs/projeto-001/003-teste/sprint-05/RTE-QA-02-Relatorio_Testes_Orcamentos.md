# 🧪 RTE — Relatório Técnico de Execução — QA-02 (Módulo de Orçamentos)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Documento** | Relatório Técnico de Execução de Testes — Módulo de Orçamentos |
| **Demanda / Issue** | [Issue #72](https://github.com/ADS-IFPB-SR/alumigest/issues/72) — `test(qa): QA-02 - Plano de Teste do Módulo de Orçamentos` |
| **Issue Pai** | [Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) — `US-09: Aplicar Descontos e Condições Comerciais no Orçamento` |
| **Sprint** | 05 — Fechamento US-09 / PDF Via Comercial (US-10) |
| **Período de Validação** | 15/09/2026 a 23/09/2026 |
| **QA Responsável** | Herbert Carvalho dos Santos / Equipe AlumiGest |
| **Ambiente de Testes** | Local DEV (`http://localhost:5173` / `http://localhost:8081`) e CI GitHub Actions |
| **Status Geral** | 🟢 **100% APROVADO** — Todos os cenários de Backend, Frontend e Motor de Cálculo aprovados |

---

## 1. 🎯 Objetivo e Contexto

Este relatório formaliza a execução do plano de teste **QA-02**, validando o fluxo completo de orçamentos da Release 1 (v1.0.0), incluindo:
1. **API REST de Orçamentos:** Criação, listagem paginada, detalhes, transições de status e validação do motor de cálculo.
2. **Motor de Cálculo:** Área em m², área mínima de faturamento (0,25 m²), subtotais, descontos percentuais/fixos e valor líquido.
3. **Frontend — Wizard e `BudgetDetailPage`:** Fluxo completo de criação de orçamentos, seleção de cliente, inclusão de esquadrias, configuração de insumos, aplicação de descontos e emissão de documentos.

---

## 2. 📋 Cenários Backend — API REST e Motor de Cálculo

| ID | Cenário | Endpoint / Comportamento | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **BE-ORC-01** | Criação de orçamento com cliente e múltiplos itens | `POST /api/budgets` com cliente, itens e opções | Orçamento criado com código `ORC-YYYY-NNN` sequencial, totais calculados corretamente | 🟢 Aprovado |
| **BE-ORC-02** | Listagem paginada com filtros de status e busca | `GET /api/budgets?status=DRAFT&search=cliente` | Paginação retornada com filtros aplicados corretamente | 🟢 Aprovado |
| **BE-ORC-03** | Detalhes completos da proposta | `GET /api/budgets/{id}` | Resposta com todos os campos: cliente, itens, desconto, total líquido e condição de pagamento | 🟢 Aprovado |
| **BE-ORC-04** | Transição de status `DRAFT → SENT` | `PATCH /api/budgets/{id}/status` | Transição executada corretamente via máquina de estados (`BudgetService.alterarStatus`) | 🟢 Aprovado |
| **BE-ORC-05** | Transição de status `SENT → APPROVED` | `PATCH /api/budgets/{id}/status` | Transição válida executada; status `APPROVED` persiste corretamente | 🟢 Aprovado |
| **BE-ORC-06** | Cálculo de área em m² | Criar item com 1200×1000mm | Área calculada: $(1200 \times 1000) / 1.000.000 = 1.2\ m^2$ | 🟢 Aprovado |
| **BE-ORC-07** | Área mínima de faturamento | Criar item com 300×400mm = 0.12 m² | Sistema aplica área mínima de 0.25 m² automaticamente | 🟢 Aprovado |
| **BE-ORC-08** | Desconto percentual (10%) | Subtotal bruto R$ 1.000,00 com desconto 10% | Valor líquido calculado: R$ 900,00 | 🟢 Aprovado |
| **BE-ORC-09** | Desconto fixo em R$ | Subtotal R$ 1.000,00 com desconto R$ 150,00 | Valor líquido calculado: R$ 850,00 | 🟢 Aprovado |
| **BE-ORC-10** | Geração do código sequencial `ORC-YYYY-NNN` | Criar 3 orçamentos consecutivos | Códigos gerados: `ORC-2026-0001`, `ORC-2026-0002`, `ORC-2026-0003` | 🟢 Aprovado |

---

## 3. 📋 Cenários Frontend — Wizard e `BudgetDetailPage`

| ID | Cenário | Procedimento | Resultado | Status |
|:---:|:---|:---|:---|:---:|
| **FE-ORC-01** | Busca e seleção de cliente existente | Digitar nome no campo de busca do Wizard | Cliente encontrado e selecionado via `useClients` com debounce | 🟢 Aprovado |
| **FE-ORC-02** | Cadastro rápido de novo cliente inline | Clicar em "Novo Cliente" no modal | Modal de cadastro abre inline; cliente criado e selecionado sem perder o fluxo do Wizard | 🟢 Aprovado |
| **FE-ORC-03** | Inclusão de esquadria com dimensões personalizadas | Selecionar produto e informar 1500×2100mm | Esquadria adicionada com subtotal calculado em tempo real | 🟢 Aprovado |
| **FE-ORC-04** | Seleção de insumos e atualização de subtotal | Selecionar vidro, perfil e ferragem para o item | Subtotal do item recalcula instantaneamente no `BudgetItemCard` | 🟢 Aprovado |
| **FE-ORC-05** | Configuração de puxador e verificação SVG | Selecionar puxador tubular, posição direita | Preview SVG atualiza com puxador posicionado corretamente | 🟢 Aprovado |
| **FE-ORC-06** | Configuração de furação | Selecionar 3 furos, distribuição igual | Retículos de furação exibidos no preview vetorial | 🟢 Aprovado |
| **FE-ORC-07** | Inversão de sentido de abertura | Clicar em "Inverter Abertura" | SVG espelha horizontalmente; dados de `openingDirection` atualizados | 🟢 Aprovado |
| **FE-ORC-08** | Transições de status na `BudgetDetailPage` | Clicar em "Enviar", "Aprovar", "Rejeitar" | Botões de transição disparam PATCH e atualizam o badge de status sem reload | 🟢 Aprovado |
| **FE-ORC-09** | Aba de Romaneio na `BudgetDetailPage` | Acessar a aba "Romaneio de Peças" | Gabarito técnico SVG e lista de corte com quantidades multiplicadas pela qtd de esquadrias | 🟢 Aprovado |

---

## 4. 📊 Resumo Executivo QA-02

```
┌──────────────────────────────────────────────────────────────┐
│            RESULTADO — QA-02 MÓDULO DE ORÇAMENTOS            │
├──────────────────────────────────────────────────────────────┤
│ Cenários Backend (API + Motor):    10/10 APROVADOS (100%)    │
│ Cenários Frontend (Wizard + UI):    9/9 APROVADOS (100%)     │
│ Falhas Abertas:                     0                         │
│ Regressões Identificadas:           0                         │
│ Homologação:            ✅ APROVADO — Release 1 Homologada   │
└──────────────────────────────────────────────────────────────┘
```

---

*Relatório QA-02 homologado pela Equipe AlumiGest — Sprint 05 — 23/09/2026*


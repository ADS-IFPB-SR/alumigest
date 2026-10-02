# 📋 Lista de Tarefas (Tasks) — Sprint 05 — Conclusão de Orçamentos, Emissão de PDFs e Transição para Pedidos

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

> ℹ️ **Status Consolidado da Sprint 05 (15/09/2026 a 28/09/2026)**:  
> - **US-09 (Parte 2: US-09.20 a US-09.40)**: 🟢 **Concluída** (Validade de 15 dias, descontos no frontend, listagem e filtros).  
> - **US-10 (US-10.1 a US-10.10)**: 🟢 **Concluída** (Emissão de PDF Comercial e resumo WhatsApp).  
> - **US-11 (US-11.1 a US-11.5)**: 🟢 **Concluída** (Emissão de PDF Técnico de Oficina sob sigilo comercial via PR #322).  
> - **US-13 a US-16 (Pedidos de Venda)**: 🔵 **Planejadas** (Transição para a Release 2).

---

## 📦 US-09 (Parte 2): Conclusão de Descontos Comerciais, Validade e Listagem Paginada
**Status**: 🟢 Concluída na Sprint 05 ([Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) / PRs #275, #292, #293)

| ID | Tarefa | Status |
|---|---|:---:|
| **US-09.20** | Criar `BudgetService` com lógica de criação e validade de 15 dias corridos (PR #275) | ✅ Concluída |
| **US-09.21** | Implementar método `adicionarItem()` no `BudgetService` com recálculo automático | ✅ Concluída |
| **US-09.22** | Implementar método `aplicarDesconto()` com cálculo bidirecional (% e R$) e limites | ✅ Concluída |
| **US-09.23** | Implementar método `alterarStatus()` no `BudgetService` com máquina de estados | ✅ Concluída |
| **US-09.24** | Implementar método `listar()` no `BudgetService` com paginação e filtros (PR #280) | ✅ Concluída |
| **US-09.25** | Estender `BudgetController` com endpoints de desconto (`PUT /discount`) e itens avulsos | ✅ Concluída |
| **US-09.26** | Criar testes unitários do `BudgetService` com JUnit 5 | ✅ Concluída |
| **US-09.27** | Criar testes de integração do `BudgetController` com H2 | ✅ Concluída |
| **US-09.28** | Criar interfaces TypeScript (Budget, BudgetItem, DiscountRequest) no frontend | ✅ Concluída |
| **US-09.29** | Criar schemas Zod de validação (budgetCreateSchema, discountSchema) | ✅ Concluída |
| **US-09.30** | Criar serviço de API Axios (createBudget, listBudgets, getBudget, applyDiscount) | ✅ Concluída |
| **US-09.31** | Criar custom hooks React Query (useBudgets, useApplyDiscount) | ✅ Concluída |
| **US-09.32** | Criar componente `BudgetStatusBadge` com badge visual de `EXPIRED` | ✅ Concluída |
| **US-09.33** | Criar componente `BudgetForm` com react-hook-form + zod | ✅ Concluída |
| **US-09.34** | Criar componente `BudgetItemForm` para adição de itens ao orçamento | ✅ Concluída |
| **US-09.35** | Criar componente `BudgetItemsTable` exibindo itens e valores | ✅ Concluída |
| **US-09.36** | Criar componente `DiscountPanel` para concessão de descontos e validade | ✅ Concluída |
| **US-09.37** | Criar componente `BudgetSummaryCard` com totais brutos, descontos e valor líquido | ✅ Concluída |
| **US-09.38** | Criar página `BudgetCreatePage` e sincronizar condições comerciais (PR #292) | ✅ Concluída |
| **US-09.39** | Criar página `BudgetListPage` com listagem paginada e filtros dinâmicos | ✅ Concluída |
| **US-09.40** | Configurar rotas `/orcamentos` no React Router com testes de integração (PR #293) | ✅ Concluída |

---

## 📦 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp
**Status**: 🟢 Concluída na Sprint 05 ([Issue #134](https://github.com/ADS-IFPB-SR/alumigest/issues/134) / PRs #294 a #313)

| ID | Tarefa | Status |
|---|---|:---:|
| **US-10.1** | Criar `BudgetPdfService` com método `gerarPdfComercial(Budget)` usando OpenPDF com cabeçalho institucional | ✅ Concluída |
| **US-10.2** | Implementar paginação automática no PDF comercial com rodapé "Página X de Y" e repetição de cabeçalho | ✅ Concluída |
| **US-10.3** | Implementar método `gerarResumoWhatsApp(Budget)` retornando texto com formatação comercial | ✅ Concluída |
| **US-10.4** | Adicionar endpoint `GET /api/budgets/{id}/pdf` no `BudgetController` | ✅ Concluída |
| **US-10.5** | Adicionar endpoint `GET /api/budgets/{id}/whatsapp-summary` no `BudgetController` | ✅ Concluída |
| **US-10.6** | Criar testes unitários de geração de PDF comercial no `BudgetPdfServiceTest` | ✅ Concluída |
| **US-10.7** | Criar testes do endpoint de resumo WhatsApp no `BudgetControllerTest` | ✅ Concluída |
| **US-10.8** | Adicionar funções de download de PDF comercial e resumo WhatsApp na API do frontend | ✅ Concluída |
| **US-10.9** | Criar visualização de orçamento na `BudgetDetailPage` com botões "Emitir PDF Comercial" e WhatsApp | ✅ Concluída |
| **US-10.10** | Implementar cópia para área de transferência (Clipboard API) com feedback visual de toast | ✅ Concluída |

---

## 📦 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (Sigilo Comercial)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) / PR #322)

| ID | Tarefa | Status |
|---|---|:---:|
| **US-11.1** | Implementar método `gerarPdfTecnico(Budget)` no `BudgetPdfService` com OpenPDF sob estrito sigilo comercial (zero R$) | ✅ Concluída |
| **US-11.2** | Adicionar endpoint `GET /api/budgets/{id}/technical-pdf` no `BudgetController` com bloqueio para status cancelado | ✅ Concluída |
| **US-11.3** | Criar testes unitários e de integração validando ausência de termos monetários (R$, valor, preço, total) | ✅ Concluída |
| **US-11.4** | Adicionar botão "Via Técnica" na `BudgetDetailPage` com feedback visual `isPending` e download direto | ✅ Concluída |
| **US-11.5** | Criar testes no frontend com Vitest cobrindo fluxo de emissão da ficha técnica de oficina | ✅ Concluída |

### 🐞 Bugs e Não-Conformidades da US-11 (Quadro Kanban / Backlog de Correções)
Documento de detalhamento técnico: [`../../projeto-001/003-teste/sprint-05/RBD-Registro_de_Bugs_US11_Sprint05.md`](../../projeto-001/003-teste/sprint-05/RBD-Registro_de_Bugs_US11_Sprint05.md)

| ID | Issue | Card Kanban | Camada | Severidade | Status Kanban |
|:---:|:---:|---|:---:|:---:|:---:|
| **BUG-034** | [#383](https://github.com/ADS-IFPB-SR/alumigest/issues/383) | [BUG-034] Prevenção de NPE por quantidade nula no cabeçalho do PDF técnico | Backend / PDF | 🔴 P2 (Alta) | 📋 Ready |
| **BUG-035** | [#384](https://github.com/ADS-IFPB-SR/alumigest/issues/384) | [BUG-035] Correção de "• Tipo: NONE" e fallback de puxador inexistente na Ficha Técnica | Backend / PDF & I18N | 🟡 P3 (Média) | 📋 Ready |
| **BUG-036** | [#385](https://github.com/ADS-IFPB-SR/alumigest/issues/385) | [BUG-036] Tratamento de erro Blob em downloadPdfTecnico no Frontend | Frontend / API & Hooks | 🟡 P3 (Média) | 📋 Ready |
| **BUG-037** | [#386](https://github.com/ADS-IFPB-SR/alumigest/issues/386) | [BUG-037] Adicionar alias de rota /technical-pdf no BudgetController | Backend / Controller | 🟢 P4 (Baixa) | 📋 Ready |

---

## 📦 Transição para Sprint 06 (Pedidos de Venda)

As tarefas das User Stories de Pedidos de Venda (**US-13, US-14, US-15 e US-16**) pertencem oficialmente à **[Sprint 06](../sprint-06/tasks.md)** (período de **29/09/2026 a 12/10/2026**), onde foram estruturadas e detalhadas com checklists executáveis.


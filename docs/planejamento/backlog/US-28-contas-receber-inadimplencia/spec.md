# Especificação Funcional: US-28 — Controlar Contas a Receber, Vencimentos e Inadimplência

**Identificador**: `US-28`  
**Issue GitHub**: [#153](https://github.com/ADS-IFPB-SR/alumigest/issues/153)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Painel financeiro de contas a receber com cálculo de inadimplência, filtros por cliente e alertas de atraso.

---

## 📋 Sub-Tarefas / Issues Vinculadas (5 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-28.1-implementar-metodo-listar-pageable-status-cli/issue.md) | Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO` | 🔲 No Backlog |
| [US](issues/US-28.2-criar-endpoint-get-api-finance-receivables-no/issue.md) | Criar endpoint GET /api/finance/receivables no `AccountReceivableController` | 🔲 No Backlog |
| [US](issues/US-28.3-criar-interfaces-typescript-e-servico-axios-r/issue.md) | Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts` | 🔲 No Backlog |
| [US](issues/US-28.4-criar-componente-receivablestable-com-badges-/issue.md) | Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx` | 🔲 No Backlog |
| [US](issues/US-28.5-criar-pagina-receivablespage-e-registrar-rota/issue.md) | Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

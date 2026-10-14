# [US-18.5] Criar página `ProductionKanbanPage` com filtros de busca por código, cliente, período de entrega e métricas resumidas por estágio

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.5`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Fatia Vertical Frontend`
- **Arquivo / Alvo Principal**: `frontend/src/features/production/pages/ProductionKanbanPage.tsx`
- **Labels Sugeridas**: `release-2`, `production`, `frontend`, `react`, `typescript`, `tailwind`, `page`

---

## 🎯 Objetivo & Descrição

Criar a página principal `ProductionKanbanPage`, integrando a barra de filtros superiores, métricas resumidas de produção no topo e o quadro Kanban (`ProductionKanbanBoard`).

A página deve oferecer:
1. Barra de ferramentas com input de busca textual com debounce (filtro por código do pedido ou nome do cliente);
2. Filtro de urgência (Todos, Atrasados, Entrega Esta Semana);
3. Cards rápidos de KPI no topo (Total de Pedidos em Produção, Pedidos Críticos/Atrasados, Concluídos Hoje);
4. Botão de atualização manual (Refresh) para recarregar o quadro sob demanda.

---

## 🛠️ Checklist de Implementação

- [ ] Criar `frontend/src/features/production/pages/ProductionKanbanPage.tsx`
- [ ] Criar componente de filtros `frontend/src/features/production/components/ProductionFilters.tsx`
- [ ] Implementar cards de métricas no topo com contadores sumarizados
- [ ] Integrar hook `useProductionKanban` passando os filtros selecionados
- [ ] Adicionar botão de refresh manual acionando `refetch()` do React Query
- [ ] Tratar estados de loading (skeletons para as colunas) e erro de conexão com a API

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend compila sem erros (`npm run build`).
2. [ ] **Usabilidade**: Filtros rápidos e reativos sem travamentos na interface.
3. [ ] **Qualidade de UI/UX**: Design premium, cards com sombra sutil e alinhamento com a identidade do AlumiGest.
4. [ ] **Valor Funcional**: Encarregado de fábrica consegue filtrar e gerenciar pedidos de forma fluida.
5. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
6. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

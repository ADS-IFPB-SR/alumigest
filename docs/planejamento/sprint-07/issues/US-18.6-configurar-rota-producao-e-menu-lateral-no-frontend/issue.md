# [US-18.6] Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend (`Sidebar.tsx`)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.6`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Frontend Routing / Navegação`
- **Arquivo / Alvo Principal**: `frontend/src/routes/AppRoutes.tsx` e `frontend/src/components/layout/Sidebar.tsx`
- **Labels Sugeridas**: `release-2`, `production`, `frontend`, `react`, `routing`, `sidebar`

---

## 🎯 Objetivo & Descrição

Configurar a rota oficial `/producao` no roteador do React Router da aplicação apontando para o componente `ProductionKanbanPage` e incluir o link de navegação "Produção (Kanban)" no menu lateral (`Sidebar.tsx`), sob a seção de operações da fábrica.

O atalho deve utilizar um ícone semântico da biblioteca `lucide-react` (ex: `Columns3` ou `LayoutGrid`) e destacar visualmente quando a rota atual for ativa.

---

## 🛠️ Checklist de Implementação

- [ ] Importar `ProductionKanbanPage` com lazy loading ou import direto em `AppRoutes.tsx`
- [ ] Mapear rota `<Route path="/producao" element={<ProductionKanbanPage />} />` dentro do layout autenticado
- [ ] No `Sidebar.tsx`, adicionar o item "Produção (Kanban)" com rota `/producao`
- [ ] Selecionar ícone semântico (`Columns3` ou `Kanban`)
- [ ] Verificar estilo de estado ativo (*active state*) quando o usuário navegar para a página de produção
- [ ] Testar navegação entre as telas de Pedidos, Orçamentos e Produção

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend compila sem erros (`npm run build`).
2. [ ] **Navegação**: Acesso direto via URL `/producao` e clique no menu lateral funcionam perfeitamente.
3. [ ] **UI/UX**: Destaque visual consistente no menu lateral.
4. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
5. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

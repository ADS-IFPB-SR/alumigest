# [US-18.4] Criar componente `ProductionKanbanBoard` com colunas de status fabril (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e ações contextuais

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.4`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Frontend UI / Kanban`
- **Arquivo / Alvo Principal**: `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- **Labels Sugeridas**: `release-2`, `production`, `frontend`, `react`, `typescript`, `tailwind`, `kanban`

---

## 🎯 Objetivo & Descrição

Desenvolver o componente principal de visualização em colunas `ProductionKanbanBoard`. O componente organiza os cards distribuídos em 3 colunas de produção:
1. **Aguardando Produção** (`AGUARDANDO_PRODUCAO`): Pedidos convertidos aguardando início de corte e separação;
2. **Em Produção** (`EM_PRODUCAO`): Pedidos em processo de fabricação e montagem na serralheria;
3. **Concluído** (`CONCLUIDO`): Pedidos com esquadrias finalizadas, prontos para expedição e instalação.

Cada coluna deve possuir um cabeçalho fixo com badge numérico contendo a contagem de pedidos, estilização em tema neutro moderno com rolagem independente e estado vazio (*empty state*) elegante.

---

## 🛠️ Checklist de Implementação

- [ ] Criar `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- [ ] Implementar agrupamento de pedidos por status a partir da lista fornecida pelo hook
- [ ] Criar cabeçalhos estilizados para cada uma das 3 colunas fabris com contadores numéricos
- [ ] Renderizar a lista de `OrderProductionCard` dentro de cada coluna correspondente
- [ ] Implementar *empty states* quando uma coluna não tiver pedidos (ex: "Nenhum pedido aguardando produção")
- [ ] Garantir layout responsivo (colunas lado a lado no desktop e empilhamento ou rolagem horizontal no mobile/tablet)

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend compila sem erros (`npm run build`).
2. [ ] **Responsividade**: Layout utilizável em monitores de escritório e tablets de oficina.
3. [ ] **Qualidade de UI/UX**: Altura ajustada, rolagem suave e contraste visual adequado.
4. [ ] **Valor Funcional**: Distribuição correta de pedidos nas 3 colunas com contadores precisos.
5. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
6. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

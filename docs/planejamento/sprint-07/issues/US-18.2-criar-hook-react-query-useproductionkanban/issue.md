# [US-18.2] Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.2`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Frontend State / API`
- **Arquivo / Alvo Principal**: `frontend/src/features/production/hooks/useProductionKanban.ts` e `services/productionApi.ts`
- **Labels Sugeridas**: `release-2`, `production`, `frontend`, `react`, `typescript`, `react-query`

---

## 🎯 Objetivo & Descrição

Estruturar o consumo de dados de produção no frontend através da biblioteca **TanStack React Query** e serviços Axios dedicados.

O hook deve permitir:
1. Buscar os pedidos em estágios fabris (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`);
2. Fornecer mutação (`useMutation`) para alteração de status via `PATCH /api/orders/{id}/production-status`;
3. Realizar invalidação inteligente de cache (`queryClient.invalidateQueries`) para atualização reativa instantânea do quadro Kanban após qualquer movimentação de card.

---

## 🛠️ Checklist de Implementação

- [ ] Criar arquivo `frontend/src/features/production/services/productionApi.ts` com métodos `getProductionOrders()` e `updateProductionStatus(id, status)`
- [ ] Criar tipagens TypeScript em `frontend/src/features/production/types/production.ts`
- [ ] Criar hook `useProductionKanban` em `frontend/src/features/production/hooks/useProductionKanban.ts`
- [ ] Implementar mutação com callbacks `onSuccess` disparando toast de confirmação e invalidando as queries relevantes
- [ ] Adicionar suporte a parâmetros de filtro (busca textual e filtro de atraso)

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend compila sem erros (`npm run build`).
2. [ ] **Tipagem Estrita**: Interfaces TypeScript para todas as respostas da API de produção.
3. [ ] **Qualidade de Código**: Sem uso de `any`, hooks desacoplados e reutilizáveis.
4. [ ] **Valor Funcional**: Requisições de busca e mutação operam com sucesso contra o backend.
5. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
6. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🔌 **Contrato de API**: [contracts/api-production.md](../../contracts/api-production.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

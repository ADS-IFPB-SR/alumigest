# [US-15.2] Reabertura de Orçamento após Cancelamento de Pedido

## 🎯 Objetivo & Valor de Negócio

Permitir que o vendedor reabra uma proposta comercial vinculada a um pedido cancelado (transicionando o orçamento de APPROVED de volta para DRAFT), liberando itens e descontos para renegociação sem precisar digitar o orçamento novamente.

---

## 📝 Escopo Técnico

- **Backend**:
  - Ajuste no `BudgetService.validateStatusTransition`: autorizar a transição `APPROVED ➔ DRAFT` exclusivamente quando o pedido de venda vinculado estiver com status `CANCELADO` (ou se for chamada do método `reabrirOrcamento`).
  - Método `reabrirOrcamento(UUID budgetId)` no `BudgetService` e endpoint `POST /api/budgets/{id}/reopen` no `BudgetController`.
- **Frontend**:
  - Na `BudgetDetailPage.tsx`, se o orçamento estiver `APPROVED` e o pedido vinculado estiver `CANCELADO`, exibir botão em destaque 'Reabrir Orçamento para Edição'.
  - Ação dispara chamada de reabertura, exibe toast de sucesso e recarrega os dados do orçamento como `DRAFT` editável.

---

## 🛠️ Checklist de Implementação

- [ ] Expandir a máquina de estados do `BudgetService` para permitir transição `APPROVED ➔ DRAFT` sob condição de cancelamento do pedido
- [ ] Criar método `reabrirOrcamento(UUID budgetId)` e endpoint `POST /api/budgets/{id}/reopen` no backend
- [ ] Atualizar cliente Axios do frontend com a função `reopenBudget(id)`
- [ ] Adicionar botão condicional 'Reabrir Orçamento para Edição' na `BudgetDetailPage.tsx`
- [ ] Garantir feedback de toast e invalidação de cache do React Query após reabertura
- [ ] Escrever testes unitários no `BudgetServiceTest` cobrindo a nova transição de status

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [ ] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [ ] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [ ] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em português do Brasil (pt-BR).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](../../tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../../contracts/api-orders.md)
- ⏱️ **Guia de Estimativa de Horas**: [guia-estimativa-horas.md](../../../guia-estimativa-horas.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 📜 **Constituição do Projeto**: [constitution.md](../../../constitution.md)

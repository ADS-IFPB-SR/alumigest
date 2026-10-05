# [US-13.3] Modal de Aprovação e Ação de Conversão na Tela de Orçamento

## 🎯 Objetivo & Valor de Negócio

Fornecer interface amigável para o vendedor aprovar o orçamento, escolher o canal de aceite (WhatsApp, Presencial, etc.), confirmar a data de entrega (+15 dias sugerida) e disparar a conversão com feedback visual imediato e redirecionamento.

---

## 📝 Escopo Técnico

- **Frontend (Types & Schemas)**:
  - `frontend/src/features/orders/types/order.ts`: Interfaces `OrderConvertRequest`, `ApprovalChannel`, `OrderStatus`.
  - `frontend/src/features/orders/schemas/orderSchema.ts`: Schema Zod `orderConvertSchema` com validação de campos obrigatórios e data não retroativa.
- **Frontend (Services & Hooks)**:
  - `frontend/src/features/orders/services/orderApi.ts`: Função `convertBudget(budgetId, request)`.
  - `frontend/src/features/orders/hooks/useOrders.ts`: Custom hook `useConvertBudget` com mutação TanStack Query e invalidação de cache.
- **Frontend (UI Components)**:
  - `frontend/src/features/orders/components/OrderApprovalModal.tsx`: Modal com formulário react-hook-form + zod, campo de canal de aprovação, date picker com sugestão de hoje + 15 dias, observações e botão com spinner `isPending`.
  - `frontend/src/pages/BudgetDetailPage.tsx`: Adicionar botão 'Aprovar e Gerar Pedido' condicional a orçamentos em status `DRAFT` ou `SENT`, abrindo o modal e redirecionando após sucesso para `/pedidos/:id`.

---

## 🛠️ Checklist de Implementação

- [x] Criar arquivo de tipos `frontend/src/features/orders/types/order.ts` com tipos de entrada e saída
- [x] Criar schema de validação Zod `orderConvertSchema` garantindo canal obrigatório e data válida
- [x] Criar serviço de API Axios `orderApi.ts` com chamada para `POST /api/orders/from-budget/${budgetId}`
- [x] Criar hook React Query `useConvertBudget` tratando loading, toasts de notificação e redirecionamento
- [x] Construir componente `OrderApprovalModal.tsx` com acessibilidade, design Tailwind e feedback de erro
- [x] Adicionar cálculo da data padrão `hoje + 15 dias corridos` na inicialização do formulário
- [x] Integrar o botão 'Aprovar e Gerar Pedido' no cabeçalho de ações da `BudgetDetailPage.tsx`
- [x] Desabilitar o botão se o orçamento já estiver aprovado, cancelado ou rejeitado
- [x] Criar testes de componente com Vitest em `OrderApprovalModal.test.tsx`

---

## ✅ Definition of Done (DoD)

1. [x] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [x] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [x] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [x] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [x] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [x] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
7. [x] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em português do Brasil (pt-BR).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](../../tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../../contracts/api-orders.md)
- ⏱️ **Guia de Estimativa de Horas**: [guia-estimativa-horas.md](../../../guia-estimativa-horas.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 📜 **Constituição do Projeto**: [constitution.md](../../../constitution.md)

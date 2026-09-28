# [US-15.1] Máquina de Estados e Cancelamento de Pedidos com Justificativa (Full-Stack)

## 🎯 Objetivo & Valor de Negócio

Controlar o ciclo de vida do pedido de venda (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO`), garantindo preenchimento de data de conclusão, cancelamento com justificativa obrigatória e bloqueio estrito de cancelamento para pedidos já em produção.

---

## 📝 Escopo Técnico

- **Backend**:
  - DTO `OrderCancelRequest.java` com Bean Validation (`@NotBlank`, `@Size(min = 10, max = 500)`).
  - Máquina de estados no `OrderService`:
    - Transição `atualizarStatus(UUID id, OrderStatus novoStatus)` validando sequência permitida.
    - Se `novoStatus == CONCLUIDO`, preencher automaticamente `data_conclusao = LocalDate.now()`.
    - Método `cancelarPedido(UUID id, OrderCancelRequest request)`: bloquear se status for `EM_PRODUCAO` ou `CONCLUIDO` (lançando `BusinessException`); persistir `justificativa_cancelamento` e mudar status para `CANCELADO`.
  - Endpoints: `PATCH /api/orders/{id}/cancel` e `PATCH /api/orders/{id}/status`.
- **Frontend**:
  - Schema Zod `orderCancelSchema` exigindo justificativa de no mínimo 10 caracteres.
  - Componente modal `OrderCancelModal.tsx` com campo textarea, contador de caracteres e botão de confirmação.
  - Integração do botão 'Cancelar Pedido' na `OrderDetailPage` (visível/habilitado apenas para `CRIADO` e `AGUARDANDO_PRODUCAO`).
  - Hooks `useCancelOrder` e `useUpdateOrderStatus` no React Query.

---

## 🛠️ Checklist de Implementação

- [ ] Criar record DTO `OrderCancelRequest` com validação `@Size(min = 10)`
- [ ] Implementar lógica de transição de status no `OrderService` com validação de máquina de estados
- [ ] Registrar data de conclusão automática quando pedido atingir status `CONCLUIDO`
- [ ] Implementar método `cancelarPedido` com bloqueio para pedidos em produção ou concluídos
- [ ] Criar endpoints `PATCH /api/orders/{id}/cancel` e `PATCH /api/orders/{id}/status` no `OrderController`
- [ ] Criar modal `OrderCancelModal.tsx` com validação Zod e feedback visual
- [ ] Adicionar botão de cancelamento condicional na `OrderDetailPage.tsx`
- [ ] Escrever testes unitários e de integração no backend cobrindo todas as transições
- [ ] Escrever testes de componente Vitest para o modal de cancelamento

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

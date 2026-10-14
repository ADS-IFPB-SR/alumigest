# [US-18.1] Implementar endpoint `PATCH /api/v1/orders/{id}/production-status` no backend com validação de transição fabril e preenchimento automático de `completion_date`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.1`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Ordens de Serviço (O.S.)`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Backend Core / Regras de Negócio`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderService.java` e `OrderController.java`
- **Labels Sugeridas**: `release-2`, `orders`, `production`, `backend`, `java`, `rest`

---

## 🎯 Objetivo & Descrição

Implementar a máquina de estados para avanço da fabricação das ordens de serviço no chão de fábrica através do endpoint `PATCH /api/v1/orders/{id}/production-status`.

As transições válidas permitidas são:
1. `WAITING_PRODUCTION` ➔ `IN_PRODUCTION`
2. `IN_PRODUCTION` ➔ `COMPLETED` (preenchendo automaticamente `completion_date = LocalDate.now()`)

Qualquer outra tentativa de movimentação (como saltar de `WAITING_PRODUCTION` para `COMPLETED`, regredir de status, ou alterar ordens `CANCELLED`) deve ser bloqueada com status HTTP `422 Unprocessable Entity` ou `BusinessException`.

---

## 🛠️ Checklist de Implementação

- [ ] Criar DTO Record `OrderProductionStatusRequestDTO.java` com validação `@NotNull`
- [ ] No `OrderService.java`, criar método `@Transactional public OrderResponseDTO updateProductionStatus(UUID orderId, OrderStatus newStatus)`
- [ ] Validar a integridade da transição de acordo com as regras de negócio
- [ ] Se o novo status for `COMPLETED`, setar `order.setCompletionDate(LocalDate.now())`
- [ ] Salvar o pedido atualizado no `OrderRepository` e mapear para `OrderResponseDTO`
- [ ] No `OrderController.java`, mapear `@PatchMapping("/{id}/production-status")`
- [ ] Documentar o endpoint com anotações `@Operation` e `@ApiResponse`

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Backend compila sem erros (`mvn clean compile`).
2. [ ] **Testes Unitários**: Testes unitários do método de transição passam com sucesso (`mvn test`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle.
4. [ ] **Valor Funcional**: Transição de status altera o banco e atualiza `completion_date` apenas ao atingir `COMPLETED`.
5. [ ] **Documentação Inline**: Javadoc nas classes e métodos novos.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-production.md](../../contracts/api-production.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

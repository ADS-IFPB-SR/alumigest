# [US-13.2] Conversão de Orçamento em Pedido de Venda no Backend Core

## 🎯 Objetivo & Valor de Negócio

Implementar a regra de negócio central de conversão de uma proposta orçamentária aprovada em Pedido de Venda oficial (`PED-YYYY-NNNN`), garantindo atomicidade transacional, invariante 1:1 e atualização automática do status do orçamento para APPROVED.

---

## 📝 Escopo Técnico

- **Backend (Service/Domain)**:
  - `OrderCodeGenerator.java`: Gerador de código sequencial anual no padrão `PED-YYYY-NNNN` com reinicialização anual.
  - `OrderConvertRequest.java`: Record DTO com Bean Validation (`@NotNull canalAprovacao`, `@FutureOrPresent dataPrevisaoEntrega`, `@Size observacoes`).
  - `OrderResponse.java` e `OrderItemResponse.java`: Records de resposta completa com dados financeiros e lista de itens.
  - `OrderMapper.java`: Mapper MapStruct para conversão de entidades em DTOs.
  - `OrderService.converterOrcamentoEmPedido(UUID orcamentoId, OrderConvertRequest request)`: Transação atômica `@Transactional` que valida status do orçamento (`DRAFT/SENT`), verifica duplicidade (invariante 1:1), cria o pedido e atualiza status do orçamento para `APPROVED`.
  - `OrderController.java`: Endpoint `POST /api/orders/from-budget/{budgetId}` com retorno HTTP `201 Created`.

---

## 🛠️ Checklist de Implementação

- [ ] Implementar classe utilitária de serviço `OrderCodeGenerator` com query para buscar o último sequencial do ano
- [ ] Criar record DTO `OrderConvertRequest` com validações Jakarta Bean Validation
- [ ] Criar records DTO de resposta `OrderResponse` e `OrderItemResponse`
- [ ] Criar mapper MapStruct `OrderMapper` para transformar entidade `Order` em `OrderResponse`
- [ ] Implementar método `converterOrcamentoEmPedido` no `OrderService` anotado com `@Transactional`
- [ ] Validar regras de negócio: status do orçamento deve ser `DRAFT` ou `SENT`
- [ ] Validar invariante 1:1: lançar exceção se `OrderRepository.findByOrcamentoId(orcamentoId)` já existir
- [ ] Invocar `BudgetService` para alterar status da proposta de origem para `APPROVED`
- [ ] Criar endpoint `POST /api/orders/from-budget/{budgetId}` no `OrderController`
- [ ] Escrever suite de testes unitários no `OrderServiceTest` cobrindo cenários de sucesso e erro

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

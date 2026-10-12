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

- [x] Implementar classe utilitária de serviço `OrderCodeGenerator` com query para buscar o último sequencial do ano
- [x] Criar record DTO `OrderConvertRequest` com validações Jakarta Bean Validation
- [x] Criar records DTO de resposta `OrderResponse` e `OrderItemResponse`
- [x] Criar mapper MapStruct `OrderMapper` para transformar entidade `Order` em `OrderResponse`
- [x] Implementar interface `OrderService` e `OrderServiceImpl` com `convertBudgetToOrder()` anotado com `@Transactional`
- [x] Validar regras de negócio: orçamento deve estar no status `APPROVED`
- [x] Validar invariante 1:1: lançar `ConflictException` se já existir pedido para o orçamento
- [x] Converter itens e insumos do orçamento em snapshot imutável no pedido (lock de preços)
- [x] Criar endpoint `POST /api/v1/orders/convert/{budgetId}` e `GET /api/v1/orders/{id}` no `OrderController`
- [x] Escrever 8 testes unitários em `OrderServiceImplTest` (8/8 PASSED)

---

## ✅ Definition of Done (DoD)

1. [x] **Compilação**: Código compila sem erros (`mvn clean compile` — 160 arquivos, BUILD SUCCESS).
2. [x] **Testes Unitários**: 8 testes unitários passam com sucesso (`OrderServiceImplTest` — 8/8 PASSED).
3. [x] **Qualidade de Código**: Zero warnings bloqueantes — Javadoc em todos os métodos públicos.
4. [x] **Valor Funcional**: Endpoint `POST /api/v1/orders/convert/{budgetId}` operacional.
5. [x] **Documentação Inline**: Javadoc / comentários em todos os métodos públicos e classes.
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

# [US-13.4] Listagem Paginada de Pedidos de Venda com Filtros (Full-Stack)

## 🎯 Objetivo & Valor de Negócio

Permitir que gerentes e vendedores consultem todos os pedidos de venda da fábrica de forma paginada e rápida, filtrando por cliente, código do pedido, status de produção e período previsto de entrega.

---

## 📝 Escopo Técnico

- **Backend**:
  - `OrderSummaryResponse.java`: Record DTO otimizado para listagem com código, cliente, status, dataEntrega, valorLiquido.
  - `OrderRepository.java`: Query com paginação `Pageable` e filtros opcionais via Specifications ou `@Query`.
  - `OrderService.listar(...)`: Método de listagem paginada retornando `Page<OrderSummaryResponse>`.
  - `OrderController.java`: Endpoint `GET /api/orders` com suporte a `page`, `size`, `sort`, `search`, `status`, `dataInicio`, `dataFim`.
- **Frontend**:
  - `OrderStatusBadge.tsx`: Componente de badge visual com paleta de cores institucional para cada status do pedido.
  - `orderApi.listOrders(...)` e custom hook `useOrders(...)`.
  - `OrderListPage.tsx`: Página completa com barra de busca, filtros suspensos, tabela responsiva, empty state e paginação numérica.
  - Configuração de rota `/pedidos` no `App.tsx`.

---

## 🛠️ Checklist de Implementação

- [x] Criar record DTO `OrderSummaryResponse` com campos essenciais de visualização em lista
- [x] Implementar método com `Pageable` e filtros dinâmicos no `OrderRepository` e `OrderService`
- [x] Criar endpoint `GET /api/orders` no `OrderController` com parâmetros de paginação e filtro
- [x] Criar componente `OrderStatusBadge.tsx` com mapeamento semântico de cores para todos os status
- [x] Criar hook `useOrders` no frontend com cache e sincronização via TanStack Query
- [x] Criar página `OrderListPage.tsx` com tabela moderna, busca com debounce, filtros e paginação
- [x] Registrar a rota `/pedidos` no `frontend/src/App.tsx`
- [x] Escrever testes unitários no backend e frontend para a listagem

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

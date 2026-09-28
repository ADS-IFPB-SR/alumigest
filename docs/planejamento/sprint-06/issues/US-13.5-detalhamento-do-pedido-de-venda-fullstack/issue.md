# [US-13.5] Visualização Detalhada do Pedido de Venda (Full-Stack)

## 🎯 Objetivo & Valor de Negócio

Disponibilizar uma visão centralizada e rica com todas as informações do pedido de venda: dados do cliente, canal de aceite, datas de aprovação e previsão de entrega, resumo financeiro contratual e status atual.

---

## 📝 Escopo Técnico

- **Backend**:
  - `OrderService.buscarPorId(UUID id)`: Busca pedido ativo lançando `EntityNotFoundException` se inexistente.
  - `OrderController.java`: Endpoint `GET /api/orders/{id}` retornando `OrderResponse`.
- **Frontend**:
  - `orderApi.getOrder(id)` e custom hook `useOrder(id)`.
  - `OrderDetailPage.tsx`: Layout com cabeçalho (código `PED-YYYY-NNNN`, badge, botões de ação), card de dados do cliente e entrega, card de resumo financeiro (valor bruto, descontos, frete, instalação, líquido) e link direto para o orçamento de origem.
  - Registro da rota `/pedidos/:id` no `App.tsx`.

---

## 🛠️ Checklist de Implementação

- [ ] Implementar método `buscarPorId` no `OrderService` com validação de existência e soft delete
- [ ] Criar endpoint `GET /api/orders/{id}` no `OrderController`
- [ ] Criar função de busca por ID na API Axios `orderApi.getOrder` e hook `useOrder`
- [ ] Construir a página `OrderDetailPage.tsx` com layout limpo e cards de informações agrupadas
- [ ] Exibir vínculo clicável com o orçamento de origem (`/orcamentos/:id`)
- [ ] Configurar rota `/pedidos/:id` no React Router em `frontend/src/App.tsx`
- [ ] Escrever testes unitários e de componente cobrindo carregamento e exibição de dados

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

# [US-18.7] Documentar endpoints no OpenAPI/Swagger e implementar testes unitários e de integração no backend para transições de status fabril

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.7`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Testes de Integração & Documentação`
- **Arquivo / Alvo Principal**: `backend/src/test/java/br/edu/ifpb/alumigest/orders/controller/OrderControllerProductionTest.java`
- **Labels Sugeridas**: `release-2`, `production`, `backend`, `java`, `swagger`, `openapi`, `mockmvc`

---

## 🎯 Objetivo & Descrição

Garantir a qualidade técnica e a conformidade arquitetural da esteira fabril através de:
1. Documentação detalhada dos endpoints de produção no Swagger / OpenAPI (`@Tag(name = "Produção e Pedidos")`, anotações `@Operation`, `@ApiResponse`, exemplos de schema);
2. Implementação de testes de integração com MockMvc cobrindo a transição de status fabril, validação de transições proibidas (HTTP 422), e garantia de que `data_conclusao` é preenchida somente ao atingir `CONCLUIDO`.

---

## 🛠️ Checklist de Implementação

- [ ] Adicionar anotações OpenAPI no endpoint `PATCH /api/orders/{id}/production-status` no `OrderController`
- [ ] Criar classe de teste `OrderControllerProductionTest` em `src/test/java/br/edu/ifpb/alumigest/orders/controller/`
- [ ] Testar transição com sucesso de `AGUARDANDO_PRODUCAO` para `EM_PRODUCAO` via MockMvc
- [ ] Testar transição com sucesso de `EM_PRODUCAO` para `CONCLUIDO` e verificar retorno de `dataConclusao`
- [ ] Testar tentativa de transição inválida (ex: `AGUARDANDO_PRODUCAO` para `CONCLUIDO`) esperando HTTP 422
- [ ] Testar requisição com ID inexistente esperando HTTP 404
- [ ] Validar documentação no Swagger UI (`http://localhost:8080/swagger-ui.html`)

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Backend e testes compilam sem erros (`mvn test-compile`).
2. [ ] **Execução**: Todos os testes passam com sucesso (`mvn test`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle.
4. [ ] **Documentação OpenAPI**: Swagger UI reflete com precisão os novos schemas e verbos HTTP.
5. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
6. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🔌 **Contrato de API**: [contracts/api-production.md](../../contracts/api-production.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

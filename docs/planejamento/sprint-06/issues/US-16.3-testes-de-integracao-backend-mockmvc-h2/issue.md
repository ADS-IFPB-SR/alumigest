# [US-16.3] Bateria de Testes de Integração do Backend (MockMvc + H2)

## 🎯 Objetivo & Valor de Negócio

Assegurar a robustez de toda a camada de API e persistência através de testes de integração automatizados com MockMvc e base H2, validando respostas HTTP, transações, restrições UNIQUE e cenários de erro.

---

## 📝 Escopo Técnico

- **Backend (Integration Tests)**:
  - `OrderControllerIntegrationTest.java`:
    - `POST /api/orders/from-budget/{budgetId}`:
      - 201 Created quando orçamento válido.
      - 404 Not Found para orçamento inexistente.
      - 409 Conflict quando tentar converter orçamento já convertido (invariante 1:1).
      - 422 Unprocessable Entity para status inválido (ex: `CANCELLED`).
    - `GET /api/orders/{id}`: 200 OK com payload estruturado e 404 para ID inexistente.
    - `GET /api/orders`: 200 OK com paginação e filtragem por status/cliente.
    - `PATCH /api/orders/{id}/cancel`:
      - 200 OK com persistência de justificativa.
      - 400 Bad Request se justificativa tiver < 10 caracteres.
      - 422 Unprocessable Entity se pedido já estiver em produção.
    - `GET /api/orders/{id}/pdf/comprovante`: 200 OK com header `application/pdf` e bytes válidos.

---

## 🛠️ Checklist de Implementação

- [ ] Criar classe de teste de integração `OrderControllerIntegrationTest` com SpringBootTest e AutoConfigureMockMvc
- [ ] Implementar testes para fluxo de conversão (sucesso 201, 404, conflito 409, status inválido 422)
- [ ] Implementar testes para consulta por ID e listagem paginada com filtros
- [ ] Implementar testes para cancelamento de pedidos (sucesso 200, validação de caracteres 400, bloqueio em produção 422)
- [ ] Implementar teste para download do comprovante em PDF validando content-type
- [ ] Executar suite e certificar que todos os testes passam sem falhas

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

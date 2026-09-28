# [US-16.2] Navegação no Sidebar, Documentação OpenAPI/Swagger e Contratos

## 🎯 Objetivo & Valor de Negócio

Garantir a descoberta e usabilidade do módulo integrando o atalho 'Pedidos de Venda' na barra de navegação do frontend e documentando todos os endpoints no Swagger UI / OpenAPI com esquemas e exemplos.

---

## 📝 Escopo Técnico

- **Backend**:
  - Documentação OpenAPI 3.0 via anotações `@Tag(name = "Pedidos de Venda")`, `@Operation`, `@ApiResponse` e `@Parameter` em todos os endpoints de `OrderController`.
  - Verificação de exibição completa no Swagger UI (`/swagger-ui.html`).
- **Frontend**:
  - Atualização do menu lateral (`Sidebar.tsx` / `AppLayout.tsx`) adicionando o link 'Pedidos de Venda' com ícone temático (`ClipboardList`), destaque quando na rota ativa `/pedidos`.
- **Documentação de Contrato**:
  - Sincronização do arquivo `docs/planejamento/sprint-06/contracts/api-orders.md` com os endpoints e payloads reais da API.

---

## 🛠️ Checklist de Implementação

- [ ] Adicionar anotações Swagger/OpenAPI (`@Operation`, `@ApiResponse`, etc.) em todos os endpoints do `OrderController`
- [ ] Verificar documentação gerada acessando `/swagger-ui.html` localmente
- [ ] Adicionar o item de menu 'Pedidos de Venda' no sidebar do frontend com ícone adequado
- [ ] Garantir estado visual de item ativo quando o usuário navegar em `/pedidos` ou `/pedidos/:id`
- [ ] Atualizar o contrato de API em `docs/planejamento/sprint-06/contracts/api-orders.md`
- [ ] Escrever teste de renderização da navegação no frontend

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

# [US-18.1] Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição e data de conclusão

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.1`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Geral`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/order/controller/OrderController.java`
- **Labels Sugeridas**: `release-2`, `order`, `backend`, `java`, `rest`

---

## 🎯 Objetivo & Descrição

Permitir atualização de status do pedido (AGUARDANDO_PRODUCAO -> EM_PRODUCAO -> CONCLUIDO) e preencher data_conclusao ao concluir.

Esta issue faz parte da entrega da **Release 2** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture, Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/order/controller/OrderController.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. Rejeitar transições inválidas com HTTP 422 e preencher data_conclusao automaticamente ao transicionar para CONCLUIDO.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

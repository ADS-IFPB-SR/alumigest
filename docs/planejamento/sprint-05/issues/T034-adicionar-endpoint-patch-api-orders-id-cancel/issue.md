# [T034] Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T034`
- **Sprint**: Sprint 05 — Aprovação de Orçamentos e Pedidos (Lock de Preços)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 4: User Story 3 - Gestão de Status e Cancelamento de Pedidos (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `OrderController`
- **Labels Sugeridas**: `sprint-05`, `release-2`, `orders`, `backend`, `java`, `user-story-3`, `cancellation`

---

## 🎯 Objetivo & Descrição

Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Permitir cancelar pedidos com justificativa obrigatória e gerenciar o ciclo de vida do pedido.

Esta issue faz parte da entrega da **Sprint 5 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `orders`, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-05/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-05/data-model.md`) ou contratos (`docs/planejamento/sprint-05/contracts/api-orders.md`)
- [ ] Implementar a alteração necessária em `OrderController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T034` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Cancelar pedido informando justificativa e validar gravação no banco e bloqueio de produção.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../contracts/api-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

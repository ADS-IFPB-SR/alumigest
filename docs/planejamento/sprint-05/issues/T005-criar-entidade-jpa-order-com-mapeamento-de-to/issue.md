# [T005] Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T005`
- **Sprint**: Sprint 05 — Aprovação de Orçamentos e Pedidos (Lock de Preços)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 2: Foundational (Blocking Prerequisites)`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`
- **Labels Sugeridas**: `sprint-05`, `release-2`, `orders`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway V9, Entidades JPA, Repositories e Enums fundamentais

Esta issue faz parte da entrega da **Sprint 5 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `orders`, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-05/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-05/data-model.md`) ou contratos (`docs/planejamento/sprint-05/contracts/api-orders.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T005` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.


---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../contracts/api-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

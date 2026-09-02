# [US-09.4] Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-09.4`
- **US Pai**: `US-09: Aplicar Descontos e Condições Comerciais no Orçamento`
- **Sprint**: Sprint 04 — Descontos, PDF e Homologação R1
- **Fase**: `Phase 2: Foundational (Blocking Prerequisites)`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`
- **Labels Sugeridas**: `sprint-04`, `release-1`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway, Entidades JPA e Enums que são pré-requisito para TODAS as User Stories

Esta issue faz parte da entrega da **Sprint 4 (Release 1 - v1.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-04/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-04/data-model.md`) ou contratos (`docs/planejamento/sprint-04/contracts/api-budgets.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T004` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.


---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-budgets.md](../contracts/api-budgets.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

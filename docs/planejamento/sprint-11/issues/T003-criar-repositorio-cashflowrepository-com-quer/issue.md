# [T003] Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T003`
- **Sprint**: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- **Labels Sugeridas**: `sprint-11`, `release-3`, `finance`, `cash-flow`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway V14, Entidade JPA CashFlow e Repository

Esta issue faz parte da entrega da **Sprint 11 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `finance`, DTOs em Records Java, transações atômicas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-11/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-11/data-model.md`) ou contratos (`docs/planejamento/sprint-11/contracts/api-cash-flow.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T003` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.


---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cash-flow.md](../contracts/api-cash-flow.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

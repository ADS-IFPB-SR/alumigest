# [US-09.34] Criar componente `BudgetItemForm` (formulário de adição de item com medidas, cor, vidro, abertura) em `frontend/src/features/budgets/components/BudgetItemForm.tsx`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-09.34`
- **US Pai**: `US-09: Aplicar Descontos e Condições Comerciais no Orçamento`
- **Sprint**: Sprint 04 — Descontos, PDF e Homologação R1
- **Fase**: `Phase 3: User Story 1 - Descontos e Condições Comerciais (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Frontend — Componentes e Páginas`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/budgets/components/BudgetItemForm.tsx`
- **Labels Sugeridas**: `sprint-04`, `release-1`, `frontend`, `typescript`, `react`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar componente `BudgetItemForm` (formulário de adição de item com medidas, cor, vidro, abertura) em `frontend/src/features/budgets/components/BudgetItemForm.tsx`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Permitir criar orçamentos, adicionar itens, aplicar descontos (% ou R$), selecionar condição de pagamento e recalcular totais em tempo real.

Esta issue faz parte da entrega da **Sprint 4 (Release 1 - v1.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-04/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-04/data-model.md`) ou contratos (`docs/planejamento/sprint-04/contracts/api-budgets.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/budgets/components/BudgetItemForm.tsx`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T034` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Criar orçamento via API, adicionar itens, aplicar desconto de 10%, verificar recálculo do valorLiquido.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-budgets.md](../contracts/api-budgets.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

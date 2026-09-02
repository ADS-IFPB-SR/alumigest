# [US-34.7] Criar testes unitários do `SettlementServiceTest`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-34.7`
- **US Pai**: `US-34: Realizar Baixa Financeira Manual com Parciais, Juros e Descontos`
- **Sprint**: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 2: User Story 1 - Baixa Manual de Títulos (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-11`, `release-3`, `finance`, `cash-flow`, `backend`, `java`, `testing`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar testes unitários do `SettlementServiceTest`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Liquidar total ou parcialmente títulos informando método de pagamento e descontos/juros com transação atômica.

Esta issue faz parte da entrega da **Sprint 11 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `finance`, DTOs em Records Java, transações atômicas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-11/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-11/data-model.md`) ou contratos (`docs/planejamento/sprint-11/contracts/api-cash-flow.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T007` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Realizar baixa de título com desconto em dinheiro e constatar atualização de saldo em caixa e quitação do título.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cash-flow.md](../contracts/api-cash-flow.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

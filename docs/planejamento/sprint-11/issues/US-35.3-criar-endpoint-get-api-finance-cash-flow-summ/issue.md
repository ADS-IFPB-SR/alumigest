# [US-35.3] Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-35.3`
- **US Pai**: `US-35: Acompanhar Fluxo de Caixa Diário e Mensal`
- **Sprint**: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 3: User Story 2 - Painel de Fluxo de Caixa (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `CashFlowController`
- **Labels Sugeridas**: `sprint-11`, `release-3`, `finance`, `cash-flow`, `backend`, `java`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Painel consolidado com total de entradas do dia por método e projeção de recebimentos futuros.

Esta issue faz parte da entrega da **Sprint 11 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `finance`, DTOs em Records Java, transações atômicas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-11/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-11/data-model.md`) ou contratos (`docs/planejamento/sprint-11/contracts/api-cash-flow.md`)
- [ ] Implementar a alteração necessária em `CashFlowController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T012` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar resumo de fluxo de caixa e verificar curva de recebimentos projetada para os próximos 30 dias.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cash-flow.md](../contracts/api-cash-flow.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

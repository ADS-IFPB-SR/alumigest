# [T014] Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T014`
- **Sprint**: Sprint 10 — Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 3: User Story 2 - Painel de Contas a Receber e Inadimplência (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `frontend/src/features/finance/services/receivablesApi.ts`
- **Labels Sugeridas**: `sprint-10`, `release-3`, `finance`, `receivables`, `backend`, `java`, `frontend`, `typescript`, `react`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Listar títulos paginados com filtros de status, período e destaque visual de parcelas vencidas em atraso.

Esta issue faz parte da entrega da **Sprint 10 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `finance`, DTOs em Records Java, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-10/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-10/data-model.md`) ou contratos (`docs/planejamento/sprint-10/contracts/api-receivables.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/finance/services/receivablesApi.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T014` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar títulos e verificar cálculo dinâmico de dias em atraso para parcelas vencidas.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-receivables.md](../contracts/api-receivables.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

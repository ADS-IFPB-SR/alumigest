# [US-42.3] Criar testes unitários do `DreCalculationServiceTest`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-42.3`
- **US Pai**: `US-42: Apurar DRE Gerencial (Competência e Caixa)`
- **Sprint**: Sprint 13 — Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 3: User Story 2 - DRE Simplificado (Competência vs Caixa) (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-13`, `release-3`, `analytics`, `dre`, `dashboard`, `backend`, `java`, `testing`, `pdf`, `financial-reports`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar testes unitários do `DreCalculationServiceTest`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Demonstrativo contábil com margem de contribuição e alternância de regime.

Esta issue faz parte da entrega da **Sprint 13 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `analytics`, DTOs em Records Java, otimização de consultas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-13/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-13/data-model.md`) ou contratos (`docs/planejamento/sprint-13/contracts/api-analytics.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T012` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar DRE nos regimes de Competência e Caixa e validar coerência dos cálculos de lucro e custos.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-analytics.md](../contracts/api-analytics.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

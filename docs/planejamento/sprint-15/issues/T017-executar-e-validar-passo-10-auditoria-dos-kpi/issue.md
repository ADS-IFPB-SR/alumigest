# [T017] Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)

## 📌 Metadados da Issue

- **ID da Tarefa**: `T017`
- **Sprint**: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)
- **Fase**: `Phase 3: User Story 2 - Roteiro de Homologação Ponta a Ponta (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-15`, `release-3`, `onboarding`, `homologacao-r3`, `testing`, `e2e`, `mvp`, `user-story-2`, `acceptance`

---

## 🎯 Objetivo & Descrição

Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13).

### Contexto da Fase / Épico
**Objetivo da User Story**: Executar e certificar os 10 passos do fluxo E2E integrado da Release 3 (v3.0.0).

Esta issue faz parte da entrega da **Sprint 15 (Fechamento da Release 3 / v3.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `onboarding`, DTOs em Records Java, integridade relacional e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-15/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-15/data-model.md`) ou contratos (`docs/planejamento/sprint-15/contracts/api-onboarding.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T017` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Executar os 10 passos sequenciais descritos no `quickstart.md` e validar persistência e coerência de dados.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-onboarding.md](../contracts/api-onboarding.md)
- 🚀 **Guia de Validação Rápida & Roteiro E2E**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

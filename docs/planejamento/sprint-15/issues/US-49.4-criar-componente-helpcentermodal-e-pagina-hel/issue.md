# [US-49.4] Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-49.4`
- **US Pai**: `US-49: Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda`
- **Sprint**: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)
- **Fase**: `Phase 4: User Story 3 - Guias de Treinamento por Perfil e Central de Ajuda (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/onboarding/`
- **Labels Sugeridas**: `sprint-15`, `release-3`, `onboarding`, `homologacao-r3`, `frontend`, `typescript`, `react`, `user-story-3`, `documentation`

---

## 🎯 Objetivo & Descrição

Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar manuais operacionais ilustrados em PDF por perfil e criar Central de Ajuda no frontend.

Esta issue faz parte da entrega da **Sprint 15 (Fechamento da Release 3 / v3.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `onboarding`, DTOs em Records Java, integridade relacional e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-15/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-15/data-model.md`) ou contratos (`docs/planejamento/sprint-15/contracts/api-onboarding.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/onboarding/`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T021` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Baixar manual do Vendedor em PDF e validar formatação e passo a passo.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-onboarding.md](../contracts/api-onboarding.md)
- 🚀 **Guia de Validação Rápida & Roteiro E2E**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

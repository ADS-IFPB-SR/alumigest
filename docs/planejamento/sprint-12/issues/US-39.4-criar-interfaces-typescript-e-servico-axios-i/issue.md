# [US-39.4] Criar interfaces TypeScript e serviço Axios (`installationApi.ts`)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-39.4`
- **US Pai**: `US-39: Visualizar Calendário de Instalações e Prevenção de Conflitos`
- **Sprint**: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 4: User Story 3 - Calendário Visual de Instalações (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `installationApi.ts`
- **Labels Sugeridas**: `sprint-12`, `release-3`, `installation`, `field-service`, `frontend`, `typescript`, `react`, `user-story-3`, `calendar`

---

## 🎯 Objetivo & Descrição

Criar interfaces TypeScript e serviço Axios (`installationApi.ts`).

### Contexto da Fase / Épico
**Objetivo da User Story**: Grid de calendário mensal/semanal de agendamentos por equipe com alertas de sobreposição.

Esta issue faz parte da entrega da **Sprint 12 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `installation`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-12/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-12/data-model.md`) ou contratos (`docs/planejamento/sprint-12/contracts/api-service-orders.md`)
- [ ] Implementar a alteração necessária em `installationApi.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T018` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar calendário e validar agrupamento de eventos por data e equipe.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-service-orders.md](../contracts/api-service-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

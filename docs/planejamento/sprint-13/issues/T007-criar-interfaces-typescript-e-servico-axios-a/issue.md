# [T007] Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`)

## 📌 Metadados da Issue

- **ID da Tarefa**: `T007`
- **Sprint**: Sprint 13 — Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 2: User Story 1 - Dashboard Executivo e KPIs de Vendas (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `analyticsApi.ts`
- **Labels Sugeridas**: `sprint-13`, `release-3`, `analytics`, `dre`, `dashboard`, `frontend`, `typescript`, `react`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar interfaces TypeScript e serviço Axios (`analyticsApi.ts`).

### Contexto da Fase / Épico
**Objetivo da User Story**: Painel inicial com KPIs de faturamento, ticket médio, taxa de conversão e gráfico temporal.

Esta issue faz parte da entrega da **Sprint 13 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `analytics`, DTOs em Records Java, otimização de consultas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-13/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-13/data-model.md`) ou contratos (`docs/planejamento/sprint-13/contracts/api-analytics.md`)
- [ ] Implementar a alteração necessária em `analyticsApi.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T007` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar endpoint do dashboard e verificar cálculo correto das métricas consolidadas.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-analytics.md](../contracts/api-analytics.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

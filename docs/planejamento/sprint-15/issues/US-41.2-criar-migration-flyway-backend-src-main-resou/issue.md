# [US-41.2] Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-41.2`
- **US Pai**: `US-41: Executar Carga Inicial de Dados e Importador de Clientes via CSV`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql`
- **Labels Sugeridas**: `release-3`, `onboarding`, `homologacao-r3`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway V16 de Carga de Dados Real de Produção

Esta issue faz parte da entrega da **Sprint 15 (Fechamento da Release 3 / v3.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `onboardingDTOs em Records Java, integridade relacional e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-15/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-15/data-model.md`) ou contratos (`docs/planejamento/sprint-15/contracts/api-onboarding.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T002` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.


---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-onboarding.md](../contracts/api-onboarding.md)
- 🚀 **Guia de Validação Rápida & Roteiro E2E**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

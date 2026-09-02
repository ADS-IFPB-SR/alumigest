# [US-37.2] Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.2`
- **US Pai**: `US-37: Agendar Instalação e Gerar Ordem de Serviço (OS)`
- **Sprint**: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql`
- **Labels Sugeridas**: `sprint-12`, `release-3`, `installation`, `field-service`, `backend`, `java`, `database`

---

## 🎯 Objetivo & Descrição

Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway V15, Entidades JPA, Repositories e Enums

Esta issue faz parte da entrega da **Sprint 12 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `installation`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-12/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-12/data-model.md`) ou contratos (`docs/planejamento/sprint-12/contracts/api-service-orders.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql`
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
- 🔌 **Contrato de API**: [contracts/api-service-orders.md](../contracts/api-service-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

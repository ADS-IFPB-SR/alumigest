# [US-50.2] Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-50.2`
- **US Pai**: `US-50: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando`
- **Sprint**: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final
- **Release**: Sprint de Reserva / Governança & Estabilização
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql`
- **Labels Sugeridas**: `sprint-16`, `governance`, `security`, `audit`, `backup`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`.

### Contexto da Fase / Épico
**Propósito da Fase**: Migration Flyway V17, Entidades JPA de Auditoria e Backup

Esta issue faz parte da entrega da **Sprint 16 (Estabilização & Contingência)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `admin`, DTOs em Records Java, AOP não invasivo e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-16/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-16/data-model.md`) ou contratos (`docs/planejamento/sprint-16/contracts/api-admin.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql`
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
- 🔌 **Contrato de API**: [contracts/api-admin.md](../contracts/api-admin.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

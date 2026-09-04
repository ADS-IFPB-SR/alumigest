# [US-45.2] Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-45.2`
- **US Pai**: `US-45: Registrar Trilha de Auditoria Imutável para Ações Críticas`
- **Release**: Sprint de Reserva / Governança & Estabilização
- **Fase**: `Phase 3: User Story 2 - Trilha de Auditoria de Operações Sensíveis (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `AuditLogService`
- **Labels Sugeridas**: `governance`, `security`, `audit`, `backup`, `backend`, `java`, `mvp`, `user-story-2`, `audit`

---

## 🎯 Objetivo & Descrição

Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Interceptar métodos sensíveis com AOP e exibir logs de auditoria no frontend.

Esta issue faz parte da entrega da **Sprint 16 (Estabilização & Contingência)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `adminDTOs em Records Java, AOP não invasivo e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-16/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-16/data-model.md`) ou contratos (`docs/planejamento/sprint-16/contracts/api-admin.md`)
- [ ] Implementar a alteração necessária em `AuditLogService`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T012` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Cancelar pedido de teste e verificar gravação de registro em `audit_logs`.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-admin.md](../contracts/api-admin.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

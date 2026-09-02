# [US-50.7] Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-50.7`
- **US Pai**: `US-50: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando`
- **Sprint**: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final
- **Release**: Sprint de Reserva / Governança & Estabilização
- **Fase**: `Phase 2: User Story 1 - Backup Automático e Restauração de Desastre (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-16`, `governance`, `security`, `audit`, `backup`, `mvp`, `user-story-1`, `backup`

---

## 🎯 Objetivo & Descrição

Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada.

### Contexto da Fase / Épico
**Objetivo da User Story**: Agendamento diário de backup, disparador manual e script de restore automatizado.

Esta issue faz parte da entrega da **Sprint 16 (Estabilização & Contingência)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `admin`, DTOs em Records Java, AOP não invasivo e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-16/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-16/data-model.md`) ou contratos (`docs/planejamento/sprint-16/contracts/api-admin.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T007` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Executar backup manual via endpoint e validar integridade do dump gerado.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-admin.md](../contracts/api-admin.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

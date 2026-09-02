# [US-52.5] Documentar endpoints no OpenAPI/Swagger

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-52.5`
- **US Pai**: `US-52: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final`
- **Sprint**: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final
- **Release**: Sprint de Reserva / Governança & Estabilização
- **Fase**: `Phase 5: Polish & Project Governance`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-16`, `governance`, `security`, `audit`, `backup`

---

## 🎯 Objetivo & Descrição

Documentar endpoints no OpenAPI/Swagger.

### Contexto da Fase / Épico
**Propósito da Fase**: Documentação OpenAPI e consolidação de governança

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

1. A funcionalidade descrita em `T022` deve estar completamente implementada no arquivo alvo.
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

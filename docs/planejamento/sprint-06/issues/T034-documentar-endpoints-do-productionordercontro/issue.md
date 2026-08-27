# [T034] Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger

## 📌 Metadados da Issue

- **ID da Tarefa**: `T034`
- **Sprint**: Sprint 06 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 7: Polish & Cross-Cutting Concerns`
- **User Story**: Não aplicável (Infra/Fundação/Polish)
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-06`, `release-2`, `production`, `backend`, `java`

---

## 🎯 Objetivo & Descrição

Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger.

### Contexto da Fase / Épico
**Propósito da Fase**: Documentação OpenAPI, navegação e testes E2E

Esta issue faz parte da entrega da **Sprint 6 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `production`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`) ou contratos (`docs/planejamento/sprint-06/contracts/api-production-orders.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T034` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.


---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-production-orders.md](../contracts/api-production-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

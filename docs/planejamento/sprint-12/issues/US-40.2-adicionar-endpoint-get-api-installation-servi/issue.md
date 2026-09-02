# [US-40.2] Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-40.2`
- **US Pai**: `US-40: Emitir Ordem de Serviço (OS) em PDF`
- **Sprint**: Sprint 12 — Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 5: User Story 4 - Emissão da OS de Campo em PDF (Priority: P2)`
- **User Story**: [US4]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `ServiceOrderController`
- **Labels Sugeridas**: `sprint-12`, `release-3`, `installation`, `field-service`, `backend`, `java`, `pdf`, `field-reports`, `user-story-4`

---

## 🎯 Objetivo & Descrição

Adicionar endpoint GET /api/installation/service-orders/{id}/pdf no `ServiceOrderController`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar PDF A4 da Ordem de Serviço com termo de entrega técnica e espaço para assinatura.

Esta issue faz parte da entrega da **Sprint 12 (Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `installation`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-12/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-12/data-model.md`) ou contratos (`docs/planejamento/sprint-12/contracts/api-service-orders.md`)
- [ ] Implementar a alteração necessária em `ServiceOrderController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T022` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Baixar PDF da OS e verificar endereço da obra, lista de esquadrias e termo de garantia.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-service-orders.md](../contracts/api-service-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

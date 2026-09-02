# [US-23.3] Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-23.3`
- **US Pai**: `US-23: Emitir Romaneio de Oficina em PDF com Checklist de Conferência`
- **Sprint**: Sprint 07 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 4: User Story 3 - Emissão de Romaneio de Oficina em PDF com Checkboxes (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `ProductionReportController`
- **Labels Sugeridas**: `sprint-07`, `release-2`, `cutting-list`, `backend`, `java`, `pdf`, `reports`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar PDF A4 de oficina com OpenPDF contendo tabela de corte e caixas de visto manual para conferência.

Esta issue faz parte da entrega da **Sprint 7 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-07/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-07/data-model.md`) ou contratos (`docs/planejamento/sprint-07/contracts/api-cutting-lists.md`)
- [ ] Implementar a alteração necessária em `ProductionReportController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T015` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Baixar PDF do romaneio e verificar diagramação das colunas "[ ] Cortado" e "[ ] Montado".

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cutting-lists.md](../contracts/api-cutting-lists.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

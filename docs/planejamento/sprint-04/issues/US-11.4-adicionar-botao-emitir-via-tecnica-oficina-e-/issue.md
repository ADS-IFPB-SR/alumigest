# [US-11.4] Adicionar botão "Emitir Via Técnica (Oficina)" e função `downloadPdfTecnico()` na `BudgetDetailPage` em `frontend/src/pages/BudgetDetailPage.tsx`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-11.4`
- **US Pai**: `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina`
- **Sprint**: Sprint 04 — Descontos, PDF e Homologação R1
- **Fase**: `Phase 5: User Story 3 - Emissão de PDF Técnico / Oficina (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Frontend`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/pages/BudgetDetailPage.tsx`
- **Labels Sugeridas**: `sprint-04`, `release-1`, `frontend`, `typescript`, `react`, `pdf`, `devops-docs`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Adicionar botão "Emitir Via Técnica (Oficina)" e função `downloadPdfTecnico()` na `BudgetDetailPage` em `frontend/src/pages/BudgetDetailPage.tsx`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar PDF com todas as especificações técnicas (medidas, modelos, cores, vidros, aberturas, ferragens) sem nenhum valor monetário.

Esta issue faz parte da entrega da **Sprint 4 (Release 1 - v1.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-04/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-04/data-model.md`) ou contratos (`docs/planejamento/sprint-04/contracts/api-budgets.md`)
- [ ] Implementar a alteração necessária em `frontend/src/pages/BudgetDetailPage.tsx`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T054` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Gerar PDF técnico e confirmar ausência total de preços/valores em R$.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-budgets.md](../contracts/api-budgets.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

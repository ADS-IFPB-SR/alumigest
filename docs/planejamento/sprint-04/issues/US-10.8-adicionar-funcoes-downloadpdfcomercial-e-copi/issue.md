# [US-10.8] Adicionar funções `downloadPdfComercial()` e `copiarResumoWhatsApp()` no serviço `frontend/src/features/budgets/services/budgetApi.ts`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-10.8`
- **US Pai**: `US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp`
- **Sprint**: Sprint 04 — Descontos, PDF e Homologação R1
- **Fase**: `Phase 4: User Story 2 - Emissão de PDF Comercial (Priority: P1)`
- **User Story**: [US2]
- **Sub-área**: `Frontend — Ações de PDF e WhatsApp`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/budgets/services/budgetApi.ts`
- **Labels Sugeridas**: `sprint-04`, `release-1`, `backend`, `java`, `frontend`, `typescript`, `react`, `pdf`, `whatsapp-integration`, `devops-docs`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Adicionar funções `downloadPdfComercial()` e `copiarResumoWhatsApp()` no serviço `frontend/src/features/budgets/services/budgetApi.ts`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar e baixar o PDF oficial do orçamento com layout profissional, incluindo logotipo, dados do cliente, itens com valores, descontos e condições comerciais. Opção de copiar resumo para WhatsApp.

Esta issue faz parte da entrega da **Sprint 4 (Release 1 - v1.0.0)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-04/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-04/data-model.md`) ou contratos (`docs/planejamento/sprint-04/contracts/api-budgets.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/budgets/services/budgetApi.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T048` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Gerar PDF comercial de um orçamento existente, verificar presença de todos os campos e download correto.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-budgets.md](../contracts/api-budgets.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

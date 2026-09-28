# [US-20.1] Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-20.1`
- **US Pai**: `US-20: Gerar Ficha Técnica de Montagem por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 3: User Story 2 - Ficha Técnica de Montagem por OP (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `CuttingListService`
- **Labels Sugeridas**: `release-2`, `cutting-list`, `backend`, `java`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Exibir detalhes de montagem, lado de abertura, ferragens e vidros por esquadria individual.

Esta issue faz parte da entrega da **Release 2** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-07/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-07/data-model.md`) ou contratos (`docs/planejamento/sprint-07/contracts/api-cutting-lists.md`)
- [ ] Implementar a alteração necessária em `CuttingListService`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T009` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar ficha técnica de uma OP e confirmar presença de lado de abertura e ferragens.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cutting-lists.md](../contracts/api-cutting-lists.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

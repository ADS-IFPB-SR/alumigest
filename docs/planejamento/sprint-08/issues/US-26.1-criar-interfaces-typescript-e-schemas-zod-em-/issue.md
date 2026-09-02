# [US-26.1] Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-26.1`
- **US Pai**: `US-26: Consultar Posição de Estoque e Kardex de Movimentações`
- **Sprint**: Sprint 08 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 4: User Story 3 - Painel de Posição de Estoque no Frontend (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `frontend/src/features/stock/types/stock.ts`
- **Labels Sugeridas**: `sprint-08`, `release-2`, `stock`, `frontend`, `typescript`, `react`, `database`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Tela com tabela de saldos, alertas visuais, modal de entrada de mercadoria e modal de perda.

Esta issue faz parte da entrega da **Sprint 8 (Fechamento da Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `stock`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-08/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-08/data-model.md`) ou contratos (`docs/planejamento/sprint-08/contracts/api-stock.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/stock/types/stock.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T023` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Visualizar alertas de estoque mínimo e abrir gaveta de extrato Kardex.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-stock.md](../contracts/api-stock.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

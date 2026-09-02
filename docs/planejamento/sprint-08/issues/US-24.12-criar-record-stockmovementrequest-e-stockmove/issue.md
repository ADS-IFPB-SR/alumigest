# [US-24.12] Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-24.12`
- **US Pai**: `US-24: Reservar e Baixar Matéria-Prima no Estoque Automaticamente`
- **Sprint**: Sprint 08 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 2: User Story 1 - Reserva e Baixa Automática de Estoque (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- **Labels Sugeridas**: `sprint-08`, `release-2`, `stock`, `backend`, `java`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Reservar materiais na liberação da produção e baixar fisicamente no corte da esquadria.

Esta issue faz parte da entrega da **Sprint 8 (Fechamento da Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `stock`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-08/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-08/data-model.md`) ou contratos (`docs/planejamento/sprint-08/contracts/api-stock.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T012` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Liberar pedido para produção, verificar reserva nos itens de estoque e confirmar baixa após corte.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-stock.md](../contracts/api-stock.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

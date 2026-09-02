# [US-19.2] Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-19.2`
- **US Pai**: `US-19: Atualizar Status de Produção via Scanner de QR Code`
- **Sprint**: Sprint 06 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 5: User Story 3 - Scanner de QR Code e Atualização de Status (Priority: P1) 🎯 MVP`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `ProductionOrderService`
- **Labels Sugeridas**: `sprint-06`, `release-2`, `production`, `backend`, `java`, `mvp`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido.

### Contexto da Fase / Épico
**Objetivo da User Story**: Leitura de QR Code via câmera no frontend e transição de status da peça com 1 toque.

Esta issue faz parte da entrega da **Sprint 6 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `production`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`) ou contratos (`docs/planejamento/sprint-06/contracts/api-production-orders.md`)
- [ ] Implementar a alteração necessária em `ProductionOrderService`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T022` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Bipar QR Code de uma OP em EM_CORTE, selecionar operador e transicionar para EM_MONTAGEM.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-production-orders.md](../contracts/api-production-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

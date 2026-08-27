# [T025] Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T025`
- **Sprint**: Sprint 05 — Aprovação de Orçamentos e Pedidos (Lock de Preços)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 3: User Story 1 & 2 - Conversão de Orçamento em Pedido e Lock de Preços (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Frontend — Tipos, Serviços e Componentes`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/orders/components/OrderApprovalModal.tsx`
- **Labels Sugeridas**: `sprint-05`, `release-2`, `orders`, `frontend`, `typescript`, `react`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Aprovar orçamento, gerar pedido de venda oficial com código sequencial, clonar itens (deep copy) e garantir o congelamento de preços e medidas.

Esta issue faz parte da entrega da **Sprint 5 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `orders`, DTOs em Records Java, Bean Validation, BigDecimal HALF_EVEN e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-05/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-05/data-model.md`) ou contratos (`docs/planejamento/sprint-05/contracts/api-orders.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/orders/components/OrderApprovalModal.tsx`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T025` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Converter orçamento ID 1 em pedido de venda, alterar preços no catálogo de materiais e constatar que o pedido mantém valores inalterados.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../contracts/api-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

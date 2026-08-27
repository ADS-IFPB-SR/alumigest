# [T015] Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T015`
- **Sprint**: Sprint 06 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 3: User Story 1 - Geração de OPs Individuais por Peça (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`
- **Labels Sugeridas**: `sprint-06`, `release-2`, `production`, `backend`, `java`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Decompor itens de um pedido de venda aprovado em Ordens de Produção individuais físicas com código sequencial `OP-YYYY-NNNN-XX`.

Esta issue faz parte da entrega da **Sprint 6 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `production`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`) ou contratos (`docs/planejamento/sprint-06/contracts/api-production-orders.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T015` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Gerar OPs para pedido com quantidade = 2 e confirmar criação de 2 OPs distintas no status AGUARDANDO_CORTE.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-production-orders.md](../contracts/api-production-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

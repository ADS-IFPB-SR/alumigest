# [US-21.4] Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-21.4`
- **US Pai**: `US-21: Consolidar Lista Linear e Plana de Corte do Pedido`
- **Sprint**: Sprint 07 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 2: User Story 1 - Lista Consolidada de Corte do Pedido (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- **Labels Sugeridas**: `sprint-07`, `release-2`, `cutting-list`, `backend`, `java`, `pdf`, `reports`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar a visão consolidada de corte com todas as peças do pedido agrupadas por tipo de material.

Esta issue faz parte da entrega da **Sprint 7 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-07/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-07/data-model.md`) ou contratos (`docs/planejamento/sprint-07/contracts/api-cutting-lists.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T004` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Consultar romaneio de corte de um pedido e verificar retorno das medidas e acabamentos de todas as peças.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-cutting-lists.md](../contracts/api-cutting-lists.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

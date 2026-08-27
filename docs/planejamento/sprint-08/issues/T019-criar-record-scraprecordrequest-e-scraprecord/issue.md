# [T019] Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T019`
- **Sprint**: Sprint 08 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 3: User Story 2 - Apontamento de Perdas & Sucata (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`
- **Labels Sugeridas**: `sprint-08`, `release-2`, `stock`, `backend`, `java`, `scrap`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Registrar perdas de materiais com motivo e debitar do saldo físico.

Esta issue faz parte da entrega da **Sprint 8 (Fechamento da Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `stock`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-08/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-08/data-model.md`) ou contratos (`docs/planejamento/sprint-08/contracts/api-stock.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T019` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Registrar perda de vidro informando motivo e constatar débito no estoque e gravação de sucata.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-stock.md](../contracts/api-stock.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

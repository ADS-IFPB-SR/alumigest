# [US-18.3] Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.3`
- **US Pai**: `US-18: Emitir Etiquetas com QR Code para Identificação de Peças`
- **Sprint**: Sprint 06 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 4: User Story 2 - Emissão de Etiquetas com QR Code 100x50mm (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- **Labels Sugeridas**: `sprint-06`, `release-2`, `production`, `backend`, `java`, `testing`, `pdf`, `labels`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar PDF de etiquetas adesivas térmicas de 100x50mm contendo QR Code legível e informações da esquadria.

Esta issue faz parte da entrega da **Sprint 6 (Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `production`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`) ou contratos (`docs/planejamento/sprint-06/contracts/api-production-orders.md`)
- [ ] Implementar a alteração necessária em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T019` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Gerar PDF de etiquetas e validar dimensões da página (100x50mm) e presença de QR Code.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-production-orders.md](../contracts/api-production-orders.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

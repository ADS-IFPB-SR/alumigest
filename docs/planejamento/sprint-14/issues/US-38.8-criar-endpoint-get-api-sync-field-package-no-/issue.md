# [US-38.8] Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-38.8`
- **US Pai**: `US-38: Instalar PWA e Consultar OPs e OS Offline via IndexedDB`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 2: User Story 1 - Instalação PWA e Cache de Dados Operacionais (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `SyncController`
- **Labels Sugeridas**: `release-3`, `pwa`, `offline`, `performance`, `backend`, `java`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Permitir instalação do app e salvar OPs/OSs localmente para consulta offline.

Esta issue faz parte da entrega da **Release 3** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (IndexedDB com Dexie, PWA com Vite, compressão no cliente e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-14/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-14/data-model.md`) ou contratos (`docs/planejamento/sprint-14/contracts/api-sync.md`)
- [ ] Implementar a alteração necessária em `SyncController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T008` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Carregar OSs online, desativar conexão e navegar pelos detalhes da OS em modo offline.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-sync.md](../contracts/api-sync.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)

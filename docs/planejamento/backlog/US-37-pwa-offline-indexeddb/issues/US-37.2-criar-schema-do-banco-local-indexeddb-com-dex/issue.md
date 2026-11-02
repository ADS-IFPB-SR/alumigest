# [US-37.2] Criar schema do banco local IndexedDB com Dexie para catálogo e rascunhos de orçamentos

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.2`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Persistência Local)
- **Sub-área**: `Frontend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `frontend/src/features/pwa/db/offlineDb.ts`
- **Labels Sugeridas**: `release-3`, `pwa`, `indexeddb`, `dexie`, `frontend`, `typescript`

---

## 🎯 Objetivo & Descrição

Criar a camada de persistência local baseada em IndexedDB usando `Dexie.js` para armazenar:
1. `salesCatalog`: cache de modelos de esquadrias ativos, acabamentos de perfis, tipos de vidros e acessórios.
2. `recentClients`: clientes recentes para seleção rápida na criação de orçamentos no local da obra.
3. `budgetDrafts`: rascunhos de orçamentos preenchidos offline contendo dimensões brutas (largura, altura em mm), modelo selecionado e status de sincronização (`PENDING_SYNC`, `SYNCING`, `SYNCED`, `FAILED`).

---

## 🛠️ Checklist de Implementação

- [ ] Instalar o pacote `dexie` em `frontend/` se necessário.
- [ ] Criar `offlineDb.ts` estendendo `Dexie` com tipagem forte:
  - Tabela `salesCatalog`: `id, code, name, category, defaultWidthMm, defaultHeightMm, updatedAt`
  - Tabela `recentClients`: `id, name, phone, document, city`
  - Tabela `budgetDrafts`: `clientDraftId, clientId, clientName, templateId, templateCode, widthMm, heightMm, components, syncStatus, createdAt`
- [ ] Exportar singleton `db` e métodos auxiliares para salvar rascunho (`saveBudgetDraft`), listar pendentes (`getPendingDrafts`) e atualizar status pós-sincronização (`updateDraftStatus`).
- [ ] Criar teste unitário em Vitest validando inserção, consulta e atualização de status de rascunhos no IndexedDB.

---

## ✅ Critérios de Aceitação

1. As operações CRUD no banco local IndexedDB devem ser atômicas e assíncronas (retornando Promises tipadas).
2. O schema deve ser versionado adequadamente no Dexie (`db.version(1).stores({...})`).
3. `npm run test` e `npm run build` devem passar sem erros.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

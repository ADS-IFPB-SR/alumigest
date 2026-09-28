# Especificação Funcional: US-38 — Sincronizar Fila de Alterações e Fotos em Segundo Plano

**Identificador**: `US-38`  
**Issue GitHub**: [#163](https://github.com/ADS-IFPB-SR/alumigest/issues/163)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Fila de sincronização automática com Background Sync API ao restabelecer conectividade.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-38.1-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) | Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/` | 🔲 No Backlog |
| [US](issues/US-38.2-implementar-metodo-processarlote-syncbatchreq/issue.md) | Implementar método `processarLote(SyncBatchRequest request)` no `SyncService` | 🔲 No Backlog |
| [US](issues/US-38.3-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) | Criar endpoint POST /api/sync/batch no `SyncController` | 🔲 No Backlog |
| [US](issues/US-38.4-criar-testes-unitarios-do-syncservicetest/issue.md) | Criar testes unitários do `SyncServiceTest` | 🔲 No Backlog |
| [US](issues/US-38.5-criar-custom-hook-useofflinequeue-com-process/issue.md) | Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático | 🔲 No Backlog |
| [US](issues/US-38.6-criar-componente-syncqueuedrawer-com-lista-de/issue.md) | Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora" | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

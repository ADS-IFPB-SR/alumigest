# Especificação Funcional: US-37 — Instalar PWA e Consultar Pedidos e OS Offline via IndexedDB

**Identificador**: `US-37`  
**Issue GitHub**: [#162](https://github.com/ADS-IFPB-SR/alumigest/issues/162)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Suporte a funcionamento offline do PWA em obras sem internet com persistência em IndexedDB.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-37.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) | Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen | 🔲 No Backlog |
| [US](issues/US-37.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) | Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts` | 🔲 No Backlog |
| [US](issues/US-37.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) | Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts` | 🔲 No Backlog |
| [US](issues/US-37.4-criar-componente-networkstatusbanner-no-layou/issue.md) | Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx` | 🔲 No Backlog |
| [US](issues/US-37.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) | Criar package `br.edu.ifpb.alumigest.sync` no backend | 🔲 No Backlog |
| [US](issues/US-37.6-criar-record-fieldpackageresponse-em-backend-/issue.md) | Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java` | 🔲 No Backlog |
| [US](issues/US-37.7-implementar-servico-syncservice-obterpacoteca/issue.md) | Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java` | 🔲 No Backlog |
| [US](issues/US-37.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) | Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java` | 🔲 No Backlog |
| [US](issues/US-37.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) | Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

# 📋 Issues da Sprint 14 — PWA, Modo Offline e Performance

Este diretório contém todas as **21 issues** detalhadas da Sprint 14 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen](T001-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md)
- [T002: Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts`](T002-criar-schema-do-banco-local-indexeddb-com-dex/issue.md)
- [T003: Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts`](T003-criar-custom-hook-usenetworkstatus-para-monit/issue.md) `[P]`
- [T004: Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`](T004-criar-componente-networkstatusbanner-no-layou/issue.md)

### Phase 2: User Story 1 - Instalação PWA e Cache de Dados Operacionais (Priority: P1) 🎯 MVP

- [T005: Criar package `br.edu.ifpb.alumigest.sync` no backend](T005-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) `[P]` `[US1]`
- [T006: Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java`](T006-criar-record-fieldpackageresponse-em-backend-/issue.md) `[P]` `[US1]`
- [T007: Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`](T007-implementar-servico-syncservice-obterpacoteca/issue.md) `[US1]`
- [T008: Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`](T008-criar-endpoint-get-api-sync-field-package-no-/issue.md) `[US1]`
- [T009: Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online](T009-implementar-rotina-de-pre-carregamento-no-dex/issue.md) `[US1]`

### Phase 3: User Story 2 - Fila de Sincronização em Segundo Plano (Priority: P1) 🎯 MVP

- [T010: Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`](T010-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) `[P]` `[US2]`
- [T011: Implementar método `processarLote(SyncBatchRequest request)` no `SyncService`](T011-implementar-metodo-processarlote-syncbatchreq/issue.md) `[US2]`
- [T012: Criar endpoint POST /api/sync/batch no `SyncController`](T012-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) `[US2]`
- [T013: Criar testes unitários do `SyncServiceTest`](T013-criar-testes-unitarios-do-syncservicetest/issue.md) `[P]` `[US2]`
- [T014: Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático](T014-criar-custom-hook-useofflinequeue-com-process/issue.md) `[US2]`
- [T015: Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora"](T015-criar-componente-syncqueuedrawer-com-lista-de/issue.md) `[US2]`

### Phase 4: User Story 3 - Compressão de Imagens no Cliente e Otimizações (Priority: P2)

- [T016: Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`](T016-criar-utilitario-useimagecompressor-redimensi/issue.md) `[US3]`
- [T017: Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`)](T017-integrar-compressao-no-componente-de-captura-/issue.md) `[US3]`
- [T018: Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`)](T018-habilitar-compressao-gzip-e-cache-de-assets-n/issue.md) `[P]` `[US3]`
- [T019: Configurar code-splitting com `React.lazy` nas rotas do React Router](T019-configurar-code-splitting-com-react-lazy-nas-/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T020: Documentar endpoints de sincronização no OpenAPI/Swagger](T020-documentar-endpoints-de-sincronizacao-no-open/issue.md) `[P]`
- [T021: Executar validação dos cenários de teste do `quickstart.md` da Sprint 14](T021-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)

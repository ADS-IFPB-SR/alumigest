# Tasks: Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

**Feature**: `011-pwa-offline-performance`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-sync.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Configuração do Vite PWA, Workbox e Dexie.js no Frontend

- [ ] T001 Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen
- [ ] T002 Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts`
- [ ] T003 [P] Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts`
- [ ] T004 Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`

---

## Phase 2: User Story 1 - Instalação PWA e Cache de Dados Operacionais (Priority: P1) 🎯 MVP

**Goal**: Permitir instalação do app e salvar OPs/OSs localmente para consulta offline.

**Independent Test**: Carregar OSs online, desativar conexão e navegar pelos detalhes da OS em modo offline.

- [ ] T005 [P] [US1] Criar package `br.edu.ifpb.alumigest.sync` no backend
- [ ] T006 [P] [US1] Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java`
- [ ] T007 [US1] Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`
- [ ] T008 [US1] Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`
- [ ] T009 [US1] Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online

---

## Phase 3: User Story 2 - Fila de Sincronização em Segundo Plano (Priority: P1) 🎯 MVP

**Goal**: Enfileirar alterações offline (conclusão de OS, fotos) e sincronizar automaticamente ao reconectar.

**Independent Test**: Concluir OS offline, reconectar rede e validar atualização de status no servidor.

- [ ] T010 [P] [US2] Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`
- [ ] T011 [US2] Implementar método `processarLote(SyncBatchRequest request)` no `SyncService`
- [ ] T012 [US2] Criar endpoint POST /api/sync/batch no `SyncController`
- [ ] T013 [P] [US2] Criar testes unitários do `SyncServiceTest`
- [ ] T014 [US2] Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático
- [ ] T015 [US2] Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora"

---

## Phase 4: User Story 3 - Compressão de Imagens no Cliente e Otimizações (Priority: P2)

**Goal**: Comprimir fotos no celular antes do envio para ~300KB e otimizar bundle frontend.

**Independent Test**: Fazer upload de foto pesada e constatar redução de tamanho para < 400KB com preservação de nitidez.

- [ ] T016 [US3] Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- [ ] T017 [US3] Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`)
- [ ] T018 [P] [US3] Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`)
- [ ] T019 [US3] Configurar code-splitting com `React.lazy` nas rotas do React Router

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T020 [P] Documentar endpoints de sincronização no OpenAPI/Swagger
- [ ] T021 Executar validação dos cenários de teste do `quickstart.md` da Sprint 14
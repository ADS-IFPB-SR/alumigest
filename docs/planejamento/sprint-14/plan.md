# Implementation Plan: Sprint 14 — PWA, Modo Offline e Performance

**Branch**: `011-pwa-offline-performance` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-pwa-offline-performance/spec.md`

## Summary

Implementar suporte a Progressive Web App (PWA) instalável com Service Worker e cache estático via Workbox, persistência local em IndexedDB com Dexie.js para OPs e OSs, fila de sincronização em segundo plano (Offline Queue) com retry automático, compressão de imagens via Canvas e otimizações de bundle.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Frontend: `vite-plugin-pwa`, `workbox-window`, `dexie`, React 19, Tailwind CSS
- Backend: Spring Boot 3.4.2 (Gzip compression, HTTP cache headers)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `sync` e `pwa` isolados |
| I. DTOs em Records Java | ✅ PASS | `FieldPackageResponse`, `SyncBatchRequest`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do `SyncService` e testes de compressão |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/sync/
├── controller/
│   └── SyncController.java                     # Endpoints /api/sync/field-package e /batch
├── service/
│   └── SyncService.java                        # Processamento transacional de itens da fila
└── dto/
    ├── FieldPackageResponse.java
    ├── SyncBatchRequest.java
    └── SyncBatchResponse.java
```

### Frontend

```text
frontend/src/features/pwa/
├── db/
│   └── offlineDb.ts                            # Banco Dexie.js (sync_queue, cached_orders)
├── hooks/
│   ├── useNetworkStatus.ts                     # Detecção de online/offline
│   ├── useOfflineQueue.ts                      # Enqueue e processamento de sincronização
│   └── useImageCompressor.ts                   # Compressão Canvas no cliente
├── components/
│   ├── NetworkStatusBanner.tsx                 # Banner discreto de status de rede
│   ├── PwaInstallPrompt.tsx                    # Modal de incentivo à instalação
│   └── SyncQueueDrawer.tsx                     # Gaveta para visualização de pendências
└── services/
    └── syncApi.ts                              # Chamadas de batch sync
```
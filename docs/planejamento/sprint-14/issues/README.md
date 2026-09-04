# 📌 Issues de Implementação — Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-38: Instalar PWA e Consultar OPs e OS Offline via IndexedDB

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-38.1](US-38.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) | Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen | `backlog` | 🔲 Aberta |
| [US-38.2](US-38.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) | Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts` | `backlog` | 🔲 Aberta |
| [US-38.3](US-38.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) | Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts` | `backlog` | 🔲 Aberta |
| [US-38.4](US-38.4-criar-componente-networkstatusbanner-no-layou/issue.md) | Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx` | `backlog` | 🔲 Aberta |
| [US-38.5](US-38.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) | Criar package `br.edu.ifpb.alumigest.sync` no backend | `backlog` | 🔲 Aberta |
| [US-38.6](US-38.6-criar-record-fieldpackageresponse-em-backend-/issue.md) | Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java` | `backlog` | 🔲 Aberta |
| [US-38.7](US-38.7-implementar-servico-syncservice-obterpacoteca/issue.md) | Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java` | `backlog` | 🔲 Aberta |
| [US-38.8](US-38.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) | Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java` | `backlog` | 🔲 Aberta |
| [US-38.9](US-38.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) | Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online | `backlog` | 🔲 Aberta |

## 📦 US-39: Sincronizar Fila de Alterações e Fotos em Segundo Plano (Offline Queue)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-39.1](US-39.1-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) | Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/` | `backlog` | 🔲 Aberta |
| [US-39.2](US-39.2-implementar-metodo-processarlote-syncbatchreq/issue.md) | Implementar método `processarLote(SyncBatchRequest request)` no `SyncService` | `backlog` | 🔲 Aberta |
| [US-39.3](US-39.3-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) | Criar endpoint POST /api/sync/batch no `SyncController` | `backlog` | 🔲 Aberta |
| [US-39.4](US-39.4-criar-testes-unitarios-do-syncservicetest/issue.md) | Criar testes unitários do `SyncServiceTest` | `backlog` | 🔲 Aberta |
| [US-39.5](US-39.5-criar-custom-hook-useofflinequeue-com-process/issue.md) | Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático | `backlog` | 🔲 Aberta |
| [US-39.6](US-39.6-criar-componente-syncqueuedrawer-com-lista-de/issue.md) | Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora" | `backlog` | 🔲 Aberta |

## 📦 US-40: Comprimir Imagens no Dispositivo e Otimizar Performance Web

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-40.1](US-40.1-criar-utilitario-useimagecompressor-redimensi/issue.md) | Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts` | `backlog` | 🔲 Aberta |
| [US-40.2](US-40.2-integrar-compressao-no-componente-de-captura-/issue.md) | Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`) | `backlog` | 🔲 Aberta |
| [US-40.3](US-40.3-habilitar-compressao-gzip-e-cache-de-assets-n/issue.md) | Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`) | `backlog` | 🔲 Aberta |
| [US-40.4](US-40.4-configurar-code-splitting-com-react-lazy-nas-/issue.md) | Configurar code-splitting com `React.lazy` nas rotas do React Router | `backlog` | 🔲 Aberta |
| [US-40.5](US-40.5-documentar-endpoints-de-sincronizacao-no-open/issue.md) | Documentar endpoints de sincronização no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-40.6](US-40.6-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 14 | `backlog` | 🔲 Aberta |


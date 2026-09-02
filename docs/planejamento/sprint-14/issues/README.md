# 📌 Issues de Implementação — Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-44: Instalar PWA e Consultar OPs e OS Offline via IndexedDB

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-44.1](US-44.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) | Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen | `sprint-14` | 🔲 Aberta |
| [US-44.2](US-44.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) | Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts` | `sprint-14` | 🔲 Aberta |
| [US-44.3](US-44.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) | Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts` | `sprint-14` | 🔲 Aberta |
| [US-44.4](US-44.4-criar-componente-networkstatusbanner-no-layou/issue.md) | Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx` | `sprint-14` | 🔲 Aberta |
| [US-44.5](US-44.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) | Criar package `br.edu.ifpb.alumigest.sync` no backend | `sprint-14` | 🔲 Aberta |
| [US-44.6](US-44.6-criar-record-fieldpackageresponse-em-backend-/issue.md) | Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java` | `sprint-14` | 🔲 Aberta |
| [US-44.7](US-44.7-implementar-servico-syncservice-obterpacoteca/issue.md) | Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java` | `sprint-14` | 🔲 Aberta |
| [US-44.8](US-44.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) | Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java` | `sprint-14` | 🔲 Aberta |
| [US-44.9](US-44.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) | Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online | `sprint-14` | 🔲 Aberta |

## 📦 US-45: Sincronizar Fila de Alterações e Fotos em Segundo Plano (Offline Queue)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-45.1](US-45.1-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) | Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/` | `sprint-14` | 🔲 Aberta |
| [US-45.2](US-45.2-implementar-metodo-processarlote-syncbatchreq/issue.md) | Implementar método `processarLote(SyncBatchRequest request)` no `SyncService` | `sprint-14` | 🔲 Aberta |
| [US-45.3](US-45.3-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) | Criar endpoint POST /api/sync/batch no `SyncController` | `sprint-14` | 🔲 Aberta |
| [US-45.4](US-45.4-criar-testes-unitarios-do-syncservicetest/issue.md) | Criar testes unitários do `SyncServiceTest` | `sprint-14` | 🔲 Aberta |
| [US-45.5](US-45.5-criar-custom-hook-useofflinequeue-com-process/issue.md) | Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático | `sprint-14` | 🔲 Aberta |
| [US-45.6](US-45.6-criar-componente-syncqueuedrawer-com-lista-de/issue.md) | Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora" | `sprint-14` | 🔲 Aberta |

## 📦 US-46: Comprimir Imagens no Dispositivo e Otimizar Performance Web

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-46.1](US-46.1-criar-utilitario-useimagecompressor-redimensi/issue.md) | Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts` | `sprint-14` | 🔲 Aberta |
| [US-46.2](US-46.2-integrar-compressao-no-componente-de-captura-/issue.md) | Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`) | `sprint-14` | 🔲 Aberta |
| [US-46.3](US-46.3-habilitar-compressao-gzip-e-cache-de-assets-n/issue.md) | Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`) | `sprint-14` | 🔲 Aberta |
| [US-46.4](US-46.4-configurar-code-splitting-com-react-lazy-nas-/issue.md) | Configurar code-splitting com `React.lazy` nas rotas do React Router | `sprint-14` | 🔲 Aberta |
| [US-46.5](US-46.5-documentar-endpoints-de-sincronizacao-no-open/issue.md) | Documentar endpoints de sincronização no OpenAPI/Swagger | `sprint-14` | 🔲 Aberta |
| [US-46.6](US-46.6-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 14 | `sprint-14` | 🔲 Aberta |


# 📋 Lista de Tarefas (Tasks) — Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-38: Instalar PWA e Consultar OPs e OS Offline via IndexedDB

> **Descrição**: Instalação PWA na tela inicial de smartphones e cache local de Ordens de Produção e Ordens de Serviço via IndexedDB / Dexie.js.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-38.1** | [US-38.1](issues/US-38.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen | 🔲 Pendente |
| **US-38.2** | [US-38.2](issues/US-38.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts` | 🔲 Pendente |
| **US-38.3** | [US-38.3](issues/US-38.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts` | 🔲 Pendente |
| **US-38.4** | [US-38.4](issues/US-38.4-criar-componente-networkstatusbanner-no-layou/issue.md) Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx` | 🔲 Pendente |
| **US-38.5** | [US-38.5](issues/US-38.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) Criar package `br.edu.ifpb.alumigest.sync` no backend | 🔲 Pendente |
| **US-38.6** | [US-38.6](issues/US-38.6-criar-record-fieldpackageresponse-em-backend-/issue.md) Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java` | 🔲 Pendente |
| **US-38.7** | [US-38.7](issues/US-38.7-implementar-servico-syncservice-obterpacoteca/issue.md) Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java` | 🔲 Pendente |
| **US-38.8** | [US-38.8](issues/US-38.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java` | 🔲 Pendente |
| **US-38.9** | [US-38.9](issues/US-38.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-38.1**: Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen
- [ ] **US-38.2**: Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts`
- [ ] **US-38.3**: Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts`
- [ ] **US-38.4**: Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`
- [ ] **US-38.5**: Criar package `br.edu.ifpb.alumigest.sync` no backend
- [ ] **US-38.6**: Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java`
- [ ] **US-38.7**: Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`
- [ ] **US-38.8**: Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`
- [ ] **US-38.9**: Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online

---

## 📦 US-39: Sincronizar Fila de Alterações e Fotos em Segundo Plano (Offline Queue)

> **Descrição**: Fila de sincronização resiliente que armazena alterações de status e fotos offline e sincroniza automaticamente quando a conexão é restabelecida.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-39.1** | [US-39.1](issues/US-39.1-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/` | 🔲 Pendente |
| **US-39.2** | [US-39.2](issues/US-39.2-implementar-metodo-processarlote-syncbatchreq/issue.md) Implementar método `processarLote(SyncBatchRequest request)` no `SyncService` | 🔲 Pendente |
| **US-39.3** | [US-39.3](issues/US-39.3-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) Criar endpoint POST /api/sync/batch no `SyncController` | 🔲 Pendente |
| **US-39.4** | [US-39.4](issues/US-39.4-criar-testes-unitarios-do-syncservicetest/issue.md) Criar testes unitários do `SyncServiceTest` | 🔲 Pendente |
| **US-39.5** | [US-39.5](issues/US-39.5-criar-custom-hook-useofflinequeue-com-process/issue.md) Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático | 🔲 Pendente |
| **US-39.6** | [US-39.6](issues/US-39.6-criar-componente-syncqueuedrawer-com-lista-de/issue.md) Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora" | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-39.1**: Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`
- [ ] **US-39.2**: Implementar método `processarLote(SyncBatchRequest request)` no `SyncService`
- [ ] **US-39.3**: Criar endpoint POST /api/sync/batch no `SyncController`
- [ ] **US-39.4**: Criar testes unitários do `SyncServiceTest`
- [ ] **US-39.5**: Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático
- [ ] **US-39.6**: Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora"

---

## 📦 US-40: Comprimir Imagens no Dispositivo e Otimizar Performance Web

> **Descrição**: Compressão no dispositivo de fotos capturadas na câmera antes do envio, lazy loading de rotas e Service Workers para alta performance.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-40.1** | [US-40.1](issues/US-40.1-criar-utilitario-useimagecompressor-redimensi/issue.md) Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts` | 🔲 Pendente |
| **US-40.2** | [US-40.2](issues/US-40.2-integrar-compressao-no-componente-de-captura-/issue.md) Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`) | 🔲 Pendente |
| **US-40.3** | [US-40.3](issues/US-40.3-habilitar-compressao-gzip-e-cache-de-assets-n/issue.md) Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`) | 🔲 Pendente |
| **US-40.4** | [US-40.4](issues/US-40.4-configurar-code-splitting-com-react-lazy-nas-/issue.md) Configurar code-splitting com `React.lazy` nas rotas do React Router | 🔲 Pendente |
| **US-40.5** | [US-40.5](issues/US-40.5-documentar-endpoints-de-sincronizacao-no-open/issue.md) Documentar endpoints de sincronização no OpenAPI/Swagger | 🔲 Pendente |
| **US-40.6** | [US-40.6](issues/US-40.6-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 14 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-40.1**: Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- [ ] **US-40.2**: Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`)
- [ ] **US-40.3**: Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`)
- [ ] **US-40.4**: Configurar code-splitting com `React.lazy` nas rotas do React Router
- [ ] **US-40.5**: Documentar endpoints de sincronização no OpenAPI/Swagger
- [ ] **US-40.6**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 14


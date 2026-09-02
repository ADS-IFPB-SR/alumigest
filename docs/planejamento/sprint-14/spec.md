# Feature Specification: Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

**Feature**: `011-pwa-offline-performance`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Muitas obras residenciais e comerciais atendidas pela Alumiportas ficam em regiões com sinal de internet móvel (4G/5G) instável ou sem cobertura. Da mesma forma, no galpão de produção, o sinal Wi-Fi pode ter pontos cegos.

Para garantir que instaladores de campo e operadores de fábrica continuem trabalhando sem interrupções:
1. **Instalação PWA (Progressive Web App)**: O sistema pode ser adicionado à tela inicial de smartphones Android e iOS como um aplicativo nativo, sem necessidade de publicação em lojas de apps.
2. **Operação Offline Resiliente**: Consulta de Ordens de Serviço (OS), Ordens de Produção (OPs do dia) e listas de corte salvas localmente via IndexedDB.
3. **Fila de Sincronização em Segundo Plano (Offline Queue)**: Mudanças de status e fotos tiradas na obra são gravadas localmente e sincronizadas automaticamente com o servidor assim que a conexão for restabelecida (com botão manual "Sincronizar Agora").
4. **Compressão Inteligente de Imagens no Dispositivo**: Redução do peso das fotos capturadas na câmera para ~300KB (máx 1600px) antes do envio, poupando pacote de dados 4G.
5. **Otimização de Performance**: Lazy loading de módulos, cache com Service Workers e compressão Gzip/Brotli.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-44: Instalar PWA e Consultar OPs e OS Offline via IndexedDB

> Instalação PWA na tela inicial de smartphones e cache local de Ordens de Produção e Ordens de Serviço via IndexedDB / Dexie.js.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-44.1**: Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen
- **US-44.2**: Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts`
- **US-44.3**: Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts`
- **US-44.4**: Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`
- **US-44.5**: Criar package `br.edu.ifpb.alumigest.sync` no backend
- **US-44.6**: Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java`
- **US-44.7**: Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`
- **US-44.8**: Criar endpoint GET /api/sync/field-package no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`
- **US-44.9**: Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online

### 📌 US-45: Sincronizar Fila de Alterações e Fotos em Segundo Plano (Offline Queue)

> Fila de sincronização resiliente que armazena alterações de status e fotos offline e sincroniza automaticamente quando a conexão é restabelecida.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-45.1**: Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`
- **US-45.2**: Implementar método `processarLote(SyncBatchRequest request)` no `SyncService`
- **US-45.3**: Criar endpoint POST /api/sync/batch no `SyncController`
- **US-45.4**: Criar testes unitários do `SyncServiceTest`
- **US-45.5**: Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático
- **US-45.6**: Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora"

### 📌 US-46: Comprimir Imagens no Dispositivo e Otimizar Performance Web

> Compressão no dispositivo de fotos capturadas na câmera antes do envio, lazy loading de rotas e Service Workers para alta performance.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-46.1**: Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- **US-46.2**: Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`)
- **US-46.3**: Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`)
- **US-46.4**: Configurar code-splitting com `React.lazy` nas rotas do React Router
- **US-46.5**: Documentar endpoints de sincronização no OpenAPI/Swagger
- **US-46.6**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 14

## 3. Requisitos Funcionais

1. **RF01 - Manifesto PWA e Service Worker**: Configuração de `manifest.webmanifest`, ícones responsivos, splash screen e cache estático via Workbox.
2. **RF02 - Armazenamento Local com IndexedDB**: Persistência de OPs do dia, OSs agendadas e listas de corte no dispositivo via Dexie.js.
3. **RF03 - Fila de Sincronização (Sync Queue)**: Enfileiramento de requisições POST/PATCH com retry exponencial e botão manual "Sincronizar Agora".
4. **RF04 - Banner de Status de Rede**: Indicador visual no cabeçalho: `Online (Verde)`, `Offline (Amarelo)` e `Sincronizando (Azul)`.
5. **RF05 - Compressão de Imagens no Cliente**: Redimensionamento via Canvas para máx 1600px e compressão WebP/JPEG (~300KB).

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Sincronização Offline)**: Sincronização automática em segundo plano ao detectar rede + botão manual "Sincronizar Agora".
- **Q2 (Compressão de Fotos)**: Compressão automática no navegador para ~300KB (máx 1600px).
- **Q3 (Escopo Offline)**: Foco exclusivo nas telas operacionais (OS de Instalação, OPs do dia e Lista de Corte).
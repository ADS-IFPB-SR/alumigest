# Research: Sprint 14 — PWA, Modo Offline e Performance

**Feature**: `011-pwa-offline-performance`
**Date**: 2026-08-27

## R1: PWA com Vite & Workbox

### Decision: `@vite-pwa/plugin` com estratégia `StaleWhileRevalidate` para assets estáticos e `NetworkFirst` com fallback em IndexedDB para requisições de dados

**Rationale**:
- Garante inicialização instantânea do app mesmo no galpão sem sinal.
- Adiciona manifesto com suporte para instalação no Android (Chrome) e iOS (Safari).

## R2: Armazenamento Local com Dexie.js (IndexedDB Wrapper)

### Decision: Banco de dados local `alumigest_offline_db` gerenciando a tabela `sync_queue`

**Rationale**:
- Suporta armazenamento de blobs binários (fotos comprimidas) e transações seguras no cliente.
- Permite enfileirar requisições e processá-las em ordem FIFO quando o evento `window.addEventListener('online')` disparar.

## R3: Compressão de Fotos no Navegador com HTML Canvas

### Decision: Redimensionamento no cliente antes do enqueue

**Rationale**:
- Converte fotos de 5MB+ para WebP/JPEG de ~300KB com largura máxima de 1600px.
- Evita estourar o limite de armazenamento do IndexedDB e garante uploads ultrarrápidos em 4G fraco.
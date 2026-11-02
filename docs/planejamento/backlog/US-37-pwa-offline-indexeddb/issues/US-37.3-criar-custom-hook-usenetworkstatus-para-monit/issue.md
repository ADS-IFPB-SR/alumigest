# [US-37.3] Criar custom hook `useNetworkStatus` e hook de sincronização `useSyncDrafts`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.3`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 2: Hooks & Gerenciamento de Estado`
- **User Story**: [US1 - Operação Offline e Sincronização]
- **Sub-área**: `Frontend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `frontend/src/features/pwa/hooks/useNetworkStatus.ts`, `frontend/src/features/pwa/hooks/useSyncDrafts.ts`
- **Labels Sugeridas**: `release-3`, `pwa`, `hooks`, `offline`, `frontend`, `typescript`

---

## 🎯 Objetivo & Descrição

Implementar:
1. `useNetworkStatus`: monitora os eventos `window.addEventListener('online')` e `offline`, provendo estado reativo `isOnline` e `wasOffline`.
2. `useSyncDrafts`: dispara automaticamente o envio dos rascunhos pendentes armazenados no Dexie para o backend (`POST /api/v1/sync/budget-drafts`) quando a conectividade é restabelecida, tratando retentativas, feedback de loading e marcação de sucesso.

---

## 🛠️ Checklist de Implementação

- [ ] Implementar `useNetworkStatus.ts` com listener de rede e cleanup no `useEffect`.
- [ ] Implementar `useSyncDrafts.ts` integrado com `TanStack Query` e Axios:
  - Recuperar rascunhos com `syncStatus === 'PENDING_SYNC'`.
  - Disparar envio em lote com idempotência baseada no `clientDraftId`.
  - Em caso de sucesso, marcar status como `SYNCED` e guardar o `budgetId` oficial retornado.
  - Em caso de falha de conexão no meio da requisição, reverter status para `PENDING_SYNC` para nova tentativa.
- [ ] Criar testes unitários para os hooks simulando alternância de eventos `online`/`offline`.

---

## ✅ Critérios de Aceitação

1. O hook `useNetworkStatus` deve reagir instantaneamente a mudanças no estado da conexão.
2. A sincronização deve ocorrer automaticamente quando o status mudar de `offline` para `online`.
3. Nenhum cálculo de preço deve ser executado no hook do frontend (SOLID).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

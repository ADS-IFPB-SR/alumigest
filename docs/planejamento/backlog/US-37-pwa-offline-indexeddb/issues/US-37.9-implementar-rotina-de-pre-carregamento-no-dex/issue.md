# [US-37.9] Integrar formulário de orçamento no frontend para salvar rascunho offline em IndexedDB e sincronizar

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.9`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 4: Frontend Integration & End-to-End Validation`
- **User Story**: [US1 - Operação Offline e Sincronização]
- **Sub-área**: `Frontend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `frontend/src/features/budgets/components/BudgetForm.tsx`, `frontend/src/features/pwa/services/pwaSyncService.ts`
- **Labels Sugeridas**: `release-3`, `pwa`, `offline`, `budgets`, `frontend`, `react`, `typescript`

---

## 🎯 Objetivo & Descrição

Integrar o fluxo de criação de orçamentos no frontend para operar de forma transparente em modo offline:
1. Quando `isOnline === false`, o botão "Salvar Rascunho Offline" grava os dados brutos no IndexedDB (`budgetDrafts`) via `saveBudgetDraft`.
2. Quando a conexão retorna, dispara a sincronização automática em segundo plano via `useSyncDrafts`, notificando o vendedor com um toast amigável: "Orçamento sincronizado com sucesso! Código oficial gerado: ORC-YYYY-NNNN".
3. Fornecer atalho na interface para visualizar e editar rascunhos salvos no dispositivo antes do envio.

---

## 🛠️ Checklist de Implementação

- [ ] Ajustar `BudgetForm.tsx` para detectar estado offline via `useNetworkStatus`.
- [ ] Alimentar dropdown de templates e clientes a partir do IndexedDB caso o cache do TanStack Query não esteja preenchido.
- [ ] Salvar os dados brutos sem tentar realizar cálculo de regras de negócio locais.
- [ ] Validar fluxo E2E simulando perda de conectividade com Chrome DevTools Network Offline.

---

## ✅ Critérios de Aceitação

1. O vendedor consegue abrir o aplicativo PWA sem internet, preencher as medidas de uma esquadria e salvar o rascunho sem travar a interface.
2. Ao restabelecer a conexão, o rascunho é enviado automaticamente e o orçamento oficial é registrado no banco do backend com todos os cálculos oficiais.
3. `npm run test` e `npm run build` passando com sucesso.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

# [US-37.4] Criar componente `NetworkStatusBanner` e modal de fila de rascunhos pendentes

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.4`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 2: Componentes de UI e Feedback`
- **User Story**: [US1 - Operação Offline e Sincronização]
- **Sub-área**: `Frontend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`, `frontend/src/features/pwa/components/DraftsQueueModal.tsx`
- **Labels Sugeridas**: `release-3`, `pwa`, `ui`, `components`, `frontend`, `tailwind`

---

## 🎯 Objetivo & Descrição

Criar os componentes visuais de feedback para o vendedor:
1. `NetworkStatusBanner`: barra superior discreta alertando quando a aplicação está operando offline ("Modo Offline — Orçamentos salvos localmente"). Ao reconectar, exibe transição temporária em verde ("Conexão restabelecida — Sincronizando rascunhos...").
2. `DraftsQueueModal`: modal acessível pelo cabeçalho exibindo a lista de rascunhos pendentes de envio com medidas, nome do cliente e botão "Tentar Sincronizar Agora".

---

## 🛠️ Checklist de Implementação

- [ ] Criar `NetworkStatusBanner.tsx` usando Tailwind CSS com animação suave de entrada/saída.
- [ ] Criar `DraftsQueueModal.tsx` listando os rascunhos salvos no IndexedDB (`clientDraftId`, `clientName`, `templateName`, `widthMm` x `heightMm`).
- [ ] Adicionar botão de retry manual por item e botão "Sincronizar Todos".
- [ ] Integrar no layout principal da aplicação (`AppLayout.tsx`).

---

## ✅ Critérios de Aceitação

1. O banner deve ser visível apenas quando `isOnline === false` ou durante os 4 segundos após o retorno da conexão.
2. O usuário pode abrir o modal de fila a qualquer momento para auditar os orçamentos que foram criados offline.
3. Total responsividade em telas mobile (smartphones) e desktop.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

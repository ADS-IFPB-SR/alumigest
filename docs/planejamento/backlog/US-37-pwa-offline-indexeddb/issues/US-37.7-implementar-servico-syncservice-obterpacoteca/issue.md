# [US-37.7] Implementar `SyncService` no backend agregando catálogo e orquestrando cálculos com `BudgetService`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.7`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 3: Backend Services & Business Orchestration`
- **User Story**: [US2 - Backend Sync Engine]
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`
- **Labels Sugeridas**: `release-3`, `backend`, `java`, `spring-boot`, `solid`, `business-logic`

---

## 🎯 Objetivo & Descrição

Implementar a interface e o serviço `SyncService` / `SyncServiceImpl`:
1. `obterCatalogoVendas()`: consulta templates de esquadrias ativos, opções de perfis/vidros e clientes recentes para alimentar o cache do PWA.
2. `sincronizarRascunhos(List<BudgetDraftSyncRequest>)`: processa cada rascunho de orçamento recebido em lote de forma transacional e idempotente (evitando duplicar orçamentos com o mesmo `clientDraftId`), invocando o `BudgetService` para executar a precificação oficial, corte de perfis, cálculo de m² e geração do código `ORC-YYYY-NNNN`.

### Princípios SOLID
- **Single Responsibility (SRP)**: O `SyncService` apenas coordena a entrada e saída do lote de sincronização; a matemática de precificação e criação do orçamento continua sob responsabilidade exclusiva do `BudgetService`.

---

## 🛠️ Checklist de Implementação

- [ ] Criar interface `SyncService` e implementação `SyncServiceImpl`.
- [ ] Injetar `TemplateRepository`, `ClientRepository` e `BudgetService`.
- [ ] Implementar verificação de idempotência por `clientDraftId` em cache ou banco.
- [ ] Garantir transacionalidade (`@Transactional`) para consistência dos registros.
- [ ] Criar testes unitários em `SyncServiceTest` com Mockito testando cenários de sucesso, retry de rascunhos duplicados e validação de rascunho inválido.

---

## ✅ Critérios de Aceitação

1. O serviço compila sem warnings e atinge cobertura $\ge 80\%$ no `SyncServiceTest`.
2. Todos os orçamentos gerados a partir de rascunhos passam pelas mesmas regras oficiais de validação e cálculo do sistema.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

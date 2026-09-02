# [US-06.3] Backend: BudgetService, Gerador de Código e Máquina de Estados

## 📌 Metadados da Issue
- **ID da Tarefa**: `US-06.3`
- **US Pai**: `US US-06`
- **Sprint**: Sprint 03 — Clientes, Motor de Orçamentos e Templates
- **Fase**: `Phase 3: Budgets Architecture`
- **Labels**: `task`, `sprint-03`, `backend`, `service`, `state-machine`

## 🎯 Objetivo & Descrição
Implementar regras de negócio no `BudgetService`, gerador de código sequencial diário (`ORC-YYYYMMDD-NNNN`) e transições seguras de status (`DRAFT` → `SENT` → `APPROVED` → `CANCELLED`).

## ✅ Critérios de Aceitação
- [x] Transições inválidas bloqueadas com BusinessException e código sequencial único.

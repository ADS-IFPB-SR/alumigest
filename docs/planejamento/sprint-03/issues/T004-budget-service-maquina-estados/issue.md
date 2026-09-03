# [T004] Backend: `BudgetService` e Máquina de Estados

## 📌 Metadados da Issue
- **ID da Tarefa**: `T004` (PR #113 / Issue #82)
- **Sprint**: Sprint 03
- **Fase**: `Phase 4: Budget Service & State Machine`
- **Labels**: `sprint-03`, `backend`, `service`, `state-machine`

## 🎯 Objetivo & Descrição
Implementar `BudgetService`, gerador sequencial de códigos `ORC-YYYYMMDD-NNNN` e transições de status (`DRAFT` -> `SENT` -> `APPROVED` -> `CANCELLED`) com congelamento de valores.

## ✅ Critérios de Aceitação
- [x] Transições validadas e bloqueio de edições em propostas aprovadas (HTTP 422).

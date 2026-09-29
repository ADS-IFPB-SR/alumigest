# [T008] Backend: Refactor de Remoção do `laborCost` do Catálogo de Produtos

## 📌 Metadados da Issue
- **ID da Tarefa**: `T008` (PRs #119, #120)
- **Sprint**: Sprint 03
- **Fase**: `Phase 8: Labor Cost Refactoring`
- **Labels**: `sprint-03`, `backend`, `refactor`, `flyway`

## 🎯 Objetivo & Descrição
Remover a coluna `labor_cost` da tabela `tb_products` (Flyway V10) e desacoplar o custo de mão de obra para o item do orçamento (`tb_budget_items.labor_cost`).

## ✅ Critérios de Aceitação
- [x] Migration V10 executada e testes de integração ajustados com sucesso.

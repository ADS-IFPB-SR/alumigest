-- ============================================================================
-- AlumiGest Database Migration - V11__limpar_dados_fantasmas.sql
-- Módulo: Orçamentos / Clientes
-- Limpar clientes e orçamentos mockados/fantasmas que quebram relatórios.
-- Requisitos: US-46
-- ============================================================================

DELETE FROM tb_budget_item_options;
DELETE FROM tb_budget_items;
DELETE FROM tb_budgets;
DELETE FROM tb_clients;

-- ============================================================================
-- AlumiGest Database Migration - V22__add_valor_mao_de_obra_to_orders.sql
-- Módulo: 📦 Pedidos de Venda / Snapshot Financeiro Imutável
-- Adição da coluna valor_mao_de_obra para congelamento explícito no pedido
-- ============================================================================

ALTER TABLE tb_orders
    ADD COLUMN valor_mao_de_obra NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

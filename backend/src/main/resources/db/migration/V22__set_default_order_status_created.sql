-- ============================================================================
-- AlumiGest Database Migration - V22__set_default_order_status_created.sql
-- Módulo: 📦 Pedidos de Venda / Ciclo de Vida (US-15.1)
-- Novas ordens de serviço devem iniciar com status padrão CREATED (Criado)
-- ============================================================================

ALTER TABLE tb_orders
    ALTER COLUMN status SET DEFAULT 'CREATED';

-- ============================================================================
-- AlumiGest Database Migration - V20__migrate_order_codes_ped_to_os.sql
-- Módulo: 📦 Ordens de Serviço (Pedidos de Venda)
-- Migração de compatibilidade de dados legados do prefixo PED- para OS-
-- Requisitos: US-13, US-13.2, US-13.3, Issue #411
-- ============================================================================

-- Atualiza códigos de pedidos legados persistidos com o prefixo 'PED-' para o
-- padrão canônico unificado 'OS-', garantindo consistência com o gerador anual,
-- consultas de busca textual e histórico operacional.
UPDATE tb_orders
SET codigo = REPLACE(codigo, 'PED-', 'OS-')
WHERE codigo LIKE 'PED-%';

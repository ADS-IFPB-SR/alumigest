-- ============================================================================
-- AlumiGest Database Migration - V26__add_supplier_and_provision_stock_items.sql
-- Módulo: Estoque e Almoxarifado
-- 1) Adiciona coluna supplier em tb_stock_movements
-- 2) Provisiona registros faltantes em tb_stock_items para materiais ativos
-- ============================================================================

ALTER TABLE tb_stock_movements
    ADD COLUMN IF NOT EXISTS supplier VARCHAR(150);

INSERT INTO tb_stock_items (
    material_id,
    physical_quantity,
    reserved_quantity,
    available_quantity,
    minimum_stock
)
SELECT
    m.id,
    0.0000,
    0.0000,
    0.0000,
    0.0000
FROM tb_materials m
WHERE m.is_active = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM tb_stock_items s
      WHERE s.material_id = m.id
  );
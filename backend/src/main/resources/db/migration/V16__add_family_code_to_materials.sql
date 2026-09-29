-- ============================================================================
-- AlumiGest Database Migration - V12__add_family_code_to_materials.sql
-- Módulo: Catálogo de Materiais e Insumos
-- US-46.4: Famílias de Materiais e Variação de Cores/Acabamentos (SKU)
-- ============================================================================

ALTER TABLE tb_materials ADD COLUMN IF NOT EXISTS family_code VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_materials_family_code ON tb_materials(family_code);

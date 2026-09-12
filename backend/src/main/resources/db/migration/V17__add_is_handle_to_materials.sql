-- ============================================================================
-- AlumiGest Database Migration - V17__add_is_handle_to_materials.sql
-- Módulo: Catálogo de Materiais e Insumos
-- Adicionar coluna is_handle (booleano) para identificação explícita de puxadores
-- ============================================================================

ALTER TABLE tb_materials ADD COLUMN IF NOT EXISTS is_handle BOOLEAN NOT NULL DEFAULT FALSE;

-- Atualizar registros legados existentes com base no nome para retrocompatibilidade
UPDATE tb_materials
SET is_handle = TRUE
WHERE LOWER(name) LIKE '%puxador%'
   OR LOWER(name) LIKE '%fecho%'
   OR LOWER(name) LIKE '%concha%'
   OR LOWER(name) LIKE '%maçaneta%'
   OR LOWER(name) LIKE '%macaneta%';

CREATE INDEX IF NOT EXISTS idx_materials_is_handle ON tb_materials(is_handle);

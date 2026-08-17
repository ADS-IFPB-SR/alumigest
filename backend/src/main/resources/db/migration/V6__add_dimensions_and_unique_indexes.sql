-- ============================================================================
-- AlumiGest Database Migration - V6
-- Adiciona colunas de dimensões máximas e restrições únicas para soft-delete
-- ============================================================================

-- Adicionar colunas de dimensões de chapa para materiais (usado principalmente em Vidros e Chapas)
ALTER TABLE tb_materials ADD COLUMN max_width_mm DECIMAL(10, 2);
ALTER TABLE tb_materials ADD COLUMN max_height_mm DECIMAL(10, 2);

-- Adicionar índice único para SKU Code considerando apenas os ativos
-- Isso evita colisões quando um material é inativado (soft delete) e outro com mesmo SKU é criado
CREATE UNIQUE INDEX idx_materials_sku_active ON tb_materials (sku_code) WHERE is_active = TRUE AND sku_code IS NOT NULL;

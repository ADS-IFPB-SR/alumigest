-- ============================================================================
-- AlumiGest Database Migration - V8
-- Módulo: Catálogo de Produtos Finais (Templates Paramétricos e Categorias de Insumos)
-- ============================================================================

-- Adicionar colunas de template paramétrico e requisitos de categorias em tb_products
ALTER TABLE tb_products ADD COLUMN template_type VARCHAR(50);
ALTER TABLE tb_products ADD COLUMN template_config JSONB;
ALTER TABLE tb_products ADD COLUMN category_requirements JSONB;

-- Comentários explicativos para documentação de banco
COMMENT ON COLUMN tb_products.template_type IS 'Modelo de esquadria/template (GIRO, CORRER, BASCULANTE, GAVETA)';
COMMENT ON COLUMN tb_products.template_config IS 'Configuração paramétrica padrão e esquema de opções disponíveis para orçamento (JSON)';
COMMENT ON COLUMN tb_products.category_requirements IS 'Lista de categorias de insumos requeridas para montagem (GLASS, PROFILE, HARDWARE, ROLLERS, FILM)';

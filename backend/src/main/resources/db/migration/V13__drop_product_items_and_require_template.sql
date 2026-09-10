-- V13: Remove tabela de itens estáticos de produto e torna template_type obrigatório

-- 1. Drop da tabela de insumos fixos do catálogo de produtos
DROP TABLE IF EXISTS tb_product_items CASCADE;

-- 2. Trata registros legados sem template (se houver)
-- Se o produto sem template estiver em orçamentos, atribui um template padrão seguro
UPDATE tb_products 
SET template_type = 'SLIDING_DOOR_2F' 
WHERE template_type IS NULL AND id IN (SELECT product_id FROM tb_budget_items);

-- Normaliza modelos legados para as novas constantes homologadas
UPDATE tb_products 
SET template_type = 'FRONT_DRAWER' 
WHERE template_type = 'DRAWER_FRONT';

-- Remove quaisquer outros produtos de teste sem template
DELETE FROM tb_products 
WHERE template_type IS NULL;

-- 3. Torna o modelo de template de esquadria estritamente obrigatório
ALTER TABLE tb_products 
ALTER COLUMN template_type SET NOT NULL;

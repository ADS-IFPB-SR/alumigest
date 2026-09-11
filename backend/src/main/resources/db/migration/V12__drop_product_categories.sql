-- V12: Remoção da tabela tb_product_categories e do vínculo category_id em tb_products
-- A categorização dos produtos passa a ser derivada diretamente do grupo de templates de esquadrias.

ALTER TABLE tb_products DROP CONSTRAINT IF EXISTS fk_product_category;
ALTER TABLE tb_products DROP COLUMN IF EXISTS category_id;

DROP TABLE IF EXISTS tb_product_categories CASCADE;

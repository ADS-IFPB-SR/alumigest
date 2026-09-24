-- Remove labor_cost from tb_products as labor is now calculated dynamically during budgeting
ALTER TABLE tb_products DROP COLUMN IF EXISTS labor_cost;

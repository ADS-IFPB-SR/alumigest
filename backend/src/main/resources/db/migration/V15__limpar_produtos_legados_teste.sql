-- V15: Limpa apenas os produtos legados de seed (anteriores a 10/09/2026) que não foram criados pelo novo Studio
-- Preserva todas as esquadrias criadas e configuradas pelo usuário

-- 1. Remove os produtos legados de seed que não estão vinculados a nenhum orçamento
DELETE FROM tb_products 
WHERE created_at < '2026-09-10 00:00:00+00'
  AND id NOT IN (SELECT product_id FROM tb_budget_items);

-- 2. Inativa os produtos legados de seed restantes com vínculo em orçamentos históricos
UPDATE tb_products 
SET is_active = false 
WHERE created_at < '2026-09-10 00:00:00+00';

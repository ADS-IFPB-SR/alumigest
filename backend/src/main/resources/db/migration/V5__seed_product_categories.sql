-- ============================================================================
-- AlumiGest Database Migration - V5__seed_product_categories.sql
-- Módulo: Catálogo de Produtos Finais (Esquadrias)
-- ============================================================================

INSERT INTO tb_product_categories (id, name, description, is_active, created_at, updated_at) VALUES 
(uuid_generate_v4(), 'Janelas de Correr', 'Janelas com folhas deslizantes (2, 3 ou 4 folhas)', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Janelas Basculantes', 'Janelas projetantes para banheiros e cozinhas', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Portas de Giro', 'Portas convencionais com dobradiças', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Portas de Correr', 'Portas com folhas deslizantes', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Portões e Grades', 'Portões de garagem, sociais e grades de proteção', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'Guarda-corpos', 'Guarda-corpos para sacadas e escadas', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

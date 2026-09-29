-- ============================================================================
-- AlumiGest - Script SQL para Execução Direta no pgAdmin (Query Tool)
-- Popula Catálogo de Insumos (com Famílias/Cores), Categorias, Produtos e Fichas Técnicas
-- NÃO insere Clientes e NÃO insere Orçamentos.
-- Idempotente (usa verificação IF NOT EXISTS / UPDATE direta).
-- ============================================================================

DO $$
DECLARE
    -- Grupos de Materiais
    v_group_vidro UUID;
    v_group_aluminio UUID;
    v_group_ferragem UUID;
    v_group_pelicula UUID;

    -- Categorias de Produtos
    v_cat_janela_correr UUID;
    v_cat_porta_correr UUID;
    v_cat_porta_giro UUID;
    v_cat_janela_basculante UUID;

    -- IDs dos Materiais
    v_mat_vidro_incolor UUID;
    v_mat_vidro_fume UUID;
    v_mat_vidro_verde UUID;
    v_mat_vidro_reflecta UUID;

    v_mat_perfil_branco UUID;
    v_mat_perfil_preto UUID;
    v_mat_perfil_fosco UUID;
    v_mat_perfil_bronze UUID;

    v_mat_puxador UUID;
    v_mat_fecho UUID;
    v_mat_roldana UUID;

    v_mat_pelicula_jato UUID;
    v_mat_pelicula_g5 UUID;

    -- IDs dos Produtos
    v_prod_janela_2f UUID;
    v_prod_janela_4f UUID;
    v_prod_porta_giro_1f UUID;
    v_prod_porta_correr_2f UUID;
    v_prod_max_ar UUID;

BEGIN
    RAISE NOTICE 'Iniciando carga de dados no AlumiGest...';

    -- ------------------------------------------------------------------------
    -- 0. Garantir coluna family_code em tb_materials
    -- ------------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_materials' AND column_name = 'family_code'
    ) THEN
        ALTER TABLE tb_materials ADD COLUMN family_code VARCHAR(50);
        CREATE INDEX IF NOT EXISTS idx_materials_family_code ON tb_materials(family_code);
        RAISE NOTICE 'Coluna family_code adicionada em tb_materials.';
    END IF;

    -- Corrigir qualquer material que tenha sido gravado com 'M' para 'METRO'
    UPDATE tb_materials SET unit_measure = 'METRO' WHERE unit_measure = 'M';

    -- ------------------------------------------------------------------------
    -- 1. Grupos de Materiais Nativos
    -- ------------------------------------------------------------------------
    INSERT INTO tb_material_groups (code, name, calculation_type, description, is_system_default, is_active)
    VALUES 
        ('VIDRO', 'Vidros e Espelhos', 'SQUARE_METER', 'Vidros planos, fantasia e temperados calculados por área (m²)', TRUE, TRUE),
        ('ALUMINIO', 'Perfis de Alumínio e Puxadores', 'LINEAR_METER', 'Perfis, trilhos e puxadores calculados por metro linear e barras', TRUE, TRUE),
        ('PELICULA', 'Películas de Proteção e Acabamento', 'SQUARE_METER', 'Películas decorativas e de proteção solar calculadas por m²', TRUE, TRUE),
        ('FERRAGEM', 'Ferragens, Componentes e Acessórios', 'UNIT', 'Fechaduras, rodízios, esquadretas e kits de montagem por unidade ou par', TRUE, TRUE)
    ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name,
        calculation_type = EXCLUDED.calculation_type,
        is_active = TRUE;

    SELECT id INTO v_group_vidro FROM tb_material_groups WHERE code = 'VIDRO';
    SELECT id INTO v_group_aluminio FROM tb_material_groups WHERE code = 'ALUMINIO';
    SELECT id INTO v_group_ferragem FROM tb_material_groups WHERE code = 'FERRAGEM';
    SELECT id INTO v_group_pelicula FROM tb_material_groups WHERE code = 'PELICULA';

    -- ------------------------------------------------------------------------
    -- 2. Categorias de Produtos
    -- ------------------------------------------------------------------------
    INSERT INTO tb_product_categories (id, name, description, is_active, created_at, updated_at)
    VALUES 
        (uuid_generate_v4(), 'Janelas de Correr', 'Janelas com folhas deslizantes (2, 3 ou 4 folhas)', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Janelas Basculantes', 'Janelas projetantes para banheiros e cozinhas', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Portas de Giro', 'Portas convencionais com dobradiças', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Portas de Correr', 'Portas com folhas deslizantes', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Portões e Grades', 'Portões de garagem, sociais e grades de proteção', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Guarda-corpos', 'Guarda-corpos para sacadas e escadas', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name) DO UPDATE SET is_active = TRUE;

    SELECT id INTO v_cat_janela_correr FROM tb_product_categories WHERE name = 'Janelas de Correr';
    SELECT id INTO v_cat_janela_basculante FROM tb_product_categories WHERE name = 'Janelas Basculantes';
    SELECT id INTO v_cat_porta_giro FROM tb_product_categories WHERE name = 'Portas de Giro';
    SELECT id INTO v_cat_porta_correr FROM tb_product_categories WHERE name = 'Portas de Correr';

    -- ------------------------------------------------------------------------
    -- 3. Materiais / Insumos com Família e Cores
    -- ------------------------------------------------------------------------

    -- 3.1 VIDROS (Família: FAM-VIDRO-TEMP-8MM)
    -- Incolor
    SELECT id INTO v_mat_vidro_incolor FROM tb_materials WHERE sku_code = 'VID-TEMP-8MM-INC' AND is_active = TRUE LIMIT 1;
    IF v_mat_vidro_incolor IS NULL THEN
        v_mat_vidro_incolor := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, thickness_mm, color_finish, family_code, max_width_mm, max_height_mm, is_active
        ) VALUES (
            v_mat_vidro_incolor, v_group_vidro, 'VID-TEMP-8MM-INC', 'VD-8INC', 'Vidro Temperado 8mm Incolor',
            110.00, 195.00, 'M2', 8.00, 'Incolor', 'FAM-VIDRO-TEMP-8MM', 2400.00, 3200.00, TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-VIDRO-TEMP-8MM', color_finish = 'Incolor', unit_measure = 'M2',
            cost_price = 110.00, sale_price = 195.00
        WHERE id = v_mat_vidro_incolor;
    END IF;

    -- Fumê
    SELECT id INTO v_mat_vidro_fume FROM tb_materials WHERE sku_code = 'VID-TEMP-8MM-FUM' AND is_active = TRUE LIMIT 1;
    IF v_mat_vidro_fume IS NULL THEN
        v_mat_vidro_fume := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, thickness_mm, color_finish, family_code, max_width_mm, max_height_mm, is_active
        ) VALUES (
            v_mat_vidro_fume, v_group_vidro, 'VID-TEMP-8MM-FUM', 'VD-8FUM', 'Vidro Temperado 8mm Fumê',
            135.00, 230.00, 'M2', 8.00, 'Fumê', 'FAM-VIDRO-TEMP-8MM', 2400.00, 3200.00, TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-VIDRO-TEMP-8MM', color_finish = 'Fumê', unit_measure = 'M2',
            cost_price = 135.00, sale_price = 230.00
        WHERE id = v_mat_vidro_fume;
    END IF;

    -- Verde
    SELECT id INTO v_mat_vidro_verde FROM tb_materials WHERE sku_code = 'VID-TEMP-8MM-VER' AND is_active = TRUE LIMIT 1;
    IF v_mat_vidro_verde IS NULL THEN
        v_mat_vidro_verde := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, thickness_mm, color_finish, family_code, max_width_mm, max_height_mm, is_active
        ) VALUES (
            v_mat_vidro_verde, v_group_vidro, 'VID-TEMP-8MM-VER', 'VD-8VER', 'Vidro Temperado 8mm Verde',
            130.00, 225.00, 'M2', 8.00, 'Verde', 'FAM-VIDRO-TEMP-8MM', 2400.00, 3200.00, TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-VIDRO-TEMP-8MM', color_finish = 'Verde', unit_measure = 'M2',
            cost_price = 130.00, sale_price = 225.00
        WHERE id = v_mat_vidro_verde;
    END IF;

    -- Reflecta Bronze
    SELECT id INTO v_mat_vidro_reflecta FROM tb_materials WHERE sku_code = 'VID-TEMP-8MM-BRO' AND is_active = TRUE LIMIT 1;
    IF v_mat_vidro_reflecta IS NULL THEN
        v_mat_vidro_reflecta := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, thickness_mm, color_finish, family_code, max_width_mm, max_height_mm, is_active
        ) VALUES (
            v_mat_vidro_reflecta, v_group_vidro, 'VID-TEMP-8MM-BRO', 'VD-8BRO', 'Vidro Temperado 8mm Reflecta Bronze',
            170.00, 290.00, 'M2', 8.00, 'Bronze', 'FAM-VIDRO-TEMP-8MM', 2400.00, 3200.00, TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-VIDRO-TEMP-8MM', color_finish = 'Bronze', unit_measure = 'M2',
            cost_price = 170.00, sale_price = 290.00
        WHERE id = v_mat_vidro_reflecta;
    END IF;

    -- 3.2 PERFIS DE ALUMÍNIO (Família: FAM-PERFIL-SUPREMA)
    -- Branco
    SELECT id INTO v_mat_perfil_branco FROM tb_materials WHERE sku_code = 'ALU-SUP-BRANCO' AND is_active = TRUE LIMIT 1;
    IF v_mat_perfil_branco IS NULL THEN
        v_mat_perfil_branco := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, standard_length_m, color_finish, family_code, is_active
        ) VALUES (
            v_mat_perfil_branco, v_group_aluminio, 'ALU-SUP-BRANCO', 'AL-SUP-B', 'Perfil Linha Suprema Branco',
            42.00, 78.00, 'METRO', 6.00, 'Branco', 'FAM-PERFIL-SUPREMA', TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-PERFIL-SUPREMA', color_finish = 'Branco', unit_measure = 'METRO',
            cost_price = 42.00, sale_price = 78.00
        WHERE id = v_mat_perfil_branco;
    END IF;

    -- Preto
    SELECT id INTO v_mat_perfil_preto FROM tb_materials WHERE sku_code = 'ALU-SUP-PRETO' AND is_active = TRUE LIMIT 1;
    IF v_mat_perfil_preto IS NULL THEN
        v_mat_perfil_preto := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, standard_length_m, color_finish, family_code, is_active
        ) VALUES (
            v_mat_perfil_preto, v_group_aluminio, 'ALU-SUP-PRETO', 'AL-SUP-P', 'Perfil Linha Suprema Preto Fosco',
            46.00, 85.00, 'METRO', 6.00, 'Preto', 'FAM-PERFIL-SUPREMA', TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-PERFIL-SUPREMA', color_finish = 'Preto', unit_measure = 'METRO',
            cost_price = 46.00, sale_price = 85.00
        WHERE id = v_mat_perfil_preto;
    END IF;

    -- Fosco / Anodizado Natural
    SELECT id INTO v_mat_perfil_fosco FROM tb_materials WHERE sku_code = 'ALU-SUP-FOSCO' AND is_active = TRUE LIMIT 1;
    IF v_mat_perfil_fosco IS NULL THEN
        v_mat_perfil_fosco := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, standard_length_m, color_finish, family_code, is_active
        ) VALUES (
            v_mat_perfil_fosco, v_group_aluminio, 'ALU-SUP-FOSCO', 'AL-SUP-F', 'Perfil Linha Suprema Fosco / Anodizado',
            39.00, 72.00, 'METRO', 6.00, 'Fosco', 'FAM-PERFIL-SUPREMA', TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-PERFIL-SUPREMA', color_finish = 'Fosco', unit_measure = 'METRO',
            cost_price = 39.00, sale_price = 72.00
        WHERE id = v_mat_perfil_fosco;
    END IF;

    -- Bronze
    SELECT id INTO v_mat_perfil_bronze FROM tb_materials WHERE sku_code = 'ALU-SUP-BRONZE' AND is_active = TRUE LIMIT 1;
    IF v_mat_perfil_bronze IS NULL THEN
        v_mat_perfil_bronze := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, standard_length_m, color_finish, family_code, is_active
        ) VALUES (
            v_mat_perfil_bronze, v_group_aluminio, 'ALU-SUP-BRONZE', 'AL-SUP-BZ', 'Perfil Linha Suprema Bronze 1003',
            48.00, 89.00, 'METRO', 6.00, 'Bronze', 'FAM-PERFIL-SUPREMA', TRUE
        );
    ELSE
        UPDATE tb_materials SET 
            family_code = 'FAM-PERFIL-SUPREMA', color_finish = 'Bronze', unit_measure = 'METRO',
            cost_price = 48.00, sale_price = 89.00
        WHERE id = v_mat_perfil_bronze;
    END IF;

    -- 3.3 FERRAGENS
    -- Puxador
    SELECT id INTO v_mat_puxador FROM tb_materials WHERE sku_code = 'FER-PUX-TUB-40' AND is_active = TRUE LIMIT 1;
    IF v_mat_puxador IS NULL THEN
        v_mat_puxador := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, is_active
        ) VALUES (
            v_mat_puxador, v_group_ferragem, 'FER-PUX-TUB-40', 'PUX-40CM', 'Puxador Tubular Inox 40cm',
            38.00, 75.00, 'UN', 'Inox Polido', TRUE
        );
    END IF;

    -- Fecho concha
    SELECT id INTO v_mat_fecho FROM tb_materials WHERE sku_code = 'FER-FECHO-CONCHA' AND is_active = TRUE LIMIT 1;
    IF v_mat_fecho IS NULL THEN
        v_mat_fecho := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, is_active
        ) VALUES (
            v_mat_fecho, v_group_ferragem, 'FER-FECHO-CONCHA', 'FCH-AUTO', 'Fecho Concha Automático para Linha Suprema',
            16.50, 32.00, 'UN', 'Preto', TRUE
        );
    END IF;

    -- Roldana dupla
    SELECT id INTO v_mat_roldana FROM tb_materials WHERE sku_code = 'FER-ROLD-DUPLA' AND is_active = TRUE LIMIT 1;
    IF v_mat_roldana IS NULL THEN
        v_mat_roldana := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, is_active
        ) VALUES (
            v_mat_roldana, v_group_ferragem, 'FER-ROLD-DUPLA', 'RLD-BLIND', 'Roldana Dupla Blindada Regulável',
            18.00, 36.00, 'UN', 'Nylon', TRUE
        );
    END IF;

    -- 3.4 PELÍCULAS
    -- Jateada
    SELECT id INTO v_mat_pelicula_jato FROM tb_materials WHERE sku_code = 'PEL-JATEADA-FOSCA' AND is_active = TRUE LIMIT 1;
    IF v_mat_pelicula_jato IS NULL THEN
        v_mat_pelicula_jato := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, is_active
        ) VALUES (
            v_mat_pelicula_jato, v_group_pelicula, 'PEL-JATEADA-FOSCA', 'PEL-JAT', 'Película Decorativa Jateada Fosca',
            18.00, 42.00, 'M2', 'Jateado', TRUE
        );
    END IF;

    -- Solar G5
    SELECT id INTO v_mat_pelicula_g5 FROM tb_materials WHERE sku_code = 'PEL-SOLAR-FUME-G5' AND is_active = TRUE LIMIT 1;
    IF v_mat_pelicula_g5 IS NULL THEN
        v_mat_pelicula_g5 := uuid_generate_v4();
        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, is_active
        ) VALUES (
            v_mat_pelicula_g5, v_group_pelicula, 'PEL-SOLAR-FUME-G5', 'PEL-G5', 'Película Solar Fumê G5 Alta Rejeição',
            22.00, 48.00, 'M2', 'Fumê', TRUE
        );
    END IF;

    -- ------------------------------------------------------------------------
    -- 4. Produtos Homologados (Esquadrias Paramétricas com Template)
    -- ------------------------------------------------------------------------

    -- 4.1 Janela de Correr 2 Folhas (SLIDING_DOOR_2F)
    SELECT id INTO v_prod_janela_2f FROM tb_products WHERE name = 'Janela de Correr 2 Folhas Suprema' LIMIT 1;
    IF v_prod_janela_2f IS NULL THEN
        v_prod_janela_2f := uuid_generate_v4();
        INSERT INTO tb_products (
            id, name, category_id, template_type, template_config, category_requirements, is_active, created_at, updated_at
        ) VALUES (
            v_prod_janela_2f,
            'Janela de Correr 2 Folhas Suprema',
            v_cat_janela_correr,
            'SLIDING_DOOR_2F',
            '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "CENTER",
                    "lengthMm": 120.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING", "LEFT_FIXED_RIGHT_SLIDING", "RIGHT_FIXED_LEFT_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb,
            '["GLASS", "PROFILE", "HARDWARE", "ROLLERS", "FILM"]'::jsonb,
            TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
    ELSE
        UPDATE tb_products SET 
            template_config = '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "CENTER",
                    "lengthMm": 120.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING", "LEFT_FIXED_RIGHT_SLIDING", "RIGHT_FIXED_LEFT_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb
        WHERE id = v_prod_janela_2f;
    END IF;

    -- 4.2 Janela de Correr 4 Folhas (SLIDING_DOOR_4F)
    SELECT id INTO v_prod_janela_4f FROM tb_products WHERE name = 'Janela de Correr 4 Folhas Suprema' LIMIT 1;
    IF v_prod_janela_4f IS NULL THEN
        v_prod_janela_4f := uuid_generate_v4();
        INSERT INTO tb_products (
            id, name, category_id, template_type, template_config, category_requirements, is_active, created_at, updated_at
        ) VALUES (
            v_prod_janela_4f,
            'Janela de Correr 4 Folhas Suprema',
            v_cat_janela_correr,
            'SLIDING_DOOR_4F',
            '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "CENTER",
                    "lengthMm": 120.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb,
            '["GLASS", "PROFILE", "HARDWARE", "ROLLERS", "FILM"]'::jsonb,
            TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
    ELSE
        UPDATE tb_products SET 
            template_config = '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "CENTER",
                    "lengthMm": 120.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb
        WHERE id = v_prod_janela_4f;
    END IF;

    -- 4.3 Porta de Giro 1 Folha (SWING_DOOR_1F)
    SELECT id INTO v_prod_porta_giro_1f FROM tb_products WHERE name = 'Porta de Giro 1 Folha Linha Suprema' LIMIT 1;
    IF v_prod_porta_giro_1f IS NULL THEN
        v_prod_porta_giro_1f := uuid_generate_v4();
        INSERT INTO tb_products (
            id, name, category_id, template_type, template_config, category_requirements, is_active, created_at, updated_at
        ) VALUES (
            v_prod_porta_giro_1f,
            'Porta de Giro 1 Folha Linha Suprema',
            v_cat_porta_giro,
            'SWING_DOOR_1F',
            '{
                "profileMm": 45.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "openingDirection": "LEFT_TO_RIGHT",
                "handleConfig": {
                    "handleType": "BAR_TUBULAR",
                    "position": "RIGHT",
                    "lengthMm": 400.0,
                    "offsetMm": 50.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 3,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": false,
                    "allowedSlidingModes": [],
                    "allowOpeningDirection": true,
                    "allowedOpeningDirections": ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT", "INSIDE", "OUTSIDE"],
                    "allowHandle": true,
                    "allowedHandleTypes": ["BAR_TUBULAR", "LEVER_HANDLE", "NONE"],
                    "allowedHandlePositions": ["LEFT", "RIGHT"],
                    "allowDrilling": true,
                    "allowedDrillingModes": ["EQUAL"],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb,
            '["GLASS", "PROFILE", "HARDWARE", "FILM"]'::jsonb,
            TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
    ELSE
        UPDATE tb_products SET 
            template_config = '{
                "profileMm": 45.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "openingDirection": "LEFT_TO_RIGHT",
                "handleConfig": {
                    "handleType": "BAR_TUBULAR",
                    "position": "RIGHT",
                    "lengthMm": 400.0,
                    "offsetMm": 50.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 3,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": false,
                    "allowedSlidingModes": [],
                    "allowOpeningDirection": true,
                    "allowedOpeningDirections": ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT", "INSIDE", "OUTSIDE"],
                    "allowHandle": true,
                    "allowedHandleTypes": ["BAR_TUBULAR", "LEVER_HANDLE", "NONE"],
                    "allowedHandlePositions": ["LEFT", "RIGHT"],
                    "allowDrilling": true,
                    "allowedDrillingModes": ["EQUAL"],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb
        WHERE id = v_prod_porta_giro_1f;
    END IF;

    -- 4.4 Porta de Correr 2 Folhas (SLIDING_DOOR_2F)
    SELECT id INTO v_prod_porta_correr_2f FROM tb_products WHERE name = 'Porta de Correr 2 Folhas Suprema' LIMIT 1;
    IF v_prod_porta_correr_2f IS NULL THEN
        v_prod_porta_correr_2f := uuid_generate_v4();
        INSERT INTO tb_products (
            id, name, category_id, template_type, template_config, category_requirements, is_active, created_at, updated_at
        ) VALUES (
            v_prod_porta_correr_2f,
            'Porta de Correr 2 Folhas Suprema',
            v_cat_porta_correr,
            'SLIDING_DOOR_2F',
            '{
                "profileMm": 32.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "BAR_TUBULAR",
                    "position": "CENTER",
                    "lengthMm": 400.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING", "LEFT_FIXED_RIGHT_SLIDING", "RIGHT_FIXED_LEFT_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["BAR_TUBULAR", "SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb,
            '["GLASS", "PROFILE", "HARDWARE", "ROLLERS", "FILM"]'::jsonb,
            TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
    ELSE
        UPDATE tb_products SET 
            template_config = '{
                "profileMm": 32.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "slidingMode": "BOTH_SLIDING",
                "handleConfig": {
                    "handleType": "BAR_TUBULAR",
                    "position": "CENTER",
                    "lengthMm": 400.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": true,
                    "allowedSlidingModes": ["BOTH_SLIDING", "LEFT_FIXED_RIGHT_SLIDING", "RIGHT_FIXED_LEFT_SLIDING"],
                    "allowOpeningDirection": false,
                    "allowedOpeningDirections": [],
                    "allowHandle": true,
                    "allowedHandleTypes": ["BAR_TUBULAR", "SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["CENTER"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb
        WHERE id = v_prod_porta_correr_2f;
    END IF;

    -- 4.5 Janela Maxim-ar / Basculante (AWNING_WINDOW_1F)
    SELECT id INTO v_prod_max_ar FROM tb_products WHERE name = 'Janela Maxim-ar 1 Folha Suprema' LIMIT 1;
    IF v_prod_max_ar IS NULL THEN
        v_prod_max_ar := uuid_generate_v4();
        INSERT INTO tb_products (
            id, name, category_id, template_type, template_config, category_requirements, is_active, created_at, updated_at
        ) VALUES (
            v_prod_max_ar,
            'Janela Maxim-ar 1 Folha Suprema',
            v_cat_janela_basculante,
            'AWNING_WINDOW_1F',
            '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "openingDirection": "OUTSIDE",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "BOTTOM",
                    "lengthMm": 100.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": false,
                    "allowedSlidingModes": [],
                    "allowOpeningDirection": true,
                    "allowedOpeningDirections": ["OUTSIDE"],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["BOTTOM"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb,
            '["GLASS", "PROFILE", "HARDWARE", "FILM"]'::jsonb,
            TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
    ELSE
        UPDATE tb_products SET 
            template_config = '{
                "profileMm": 20.0,
                "aluminumColor": "#FFFFFF",
                "glassColor": "#E3F2FD",
                "openingDirection": "OUTSIDE",
                "handleConfig": {
                    "handleType": "SHELL_LOCK",
                    "position": "BOTTOM",
                    "lengthMm": 100.0,
                    "offsetMm": 0.0
                },
                "drillingConfig": {
                    "mode": "EQUAL",
                    "holesCount": 2,
                    "customDistancesMm": []
                },
                "optionSchema": {
                    "allowSlidingMode": false,
                    "allowedSlidingModes": [],
                    "allowOpeningDirection": true,
                    "allowedOpeningDirections": ["OUTSIDE"],
                    "allowHandle": true,
                    "allowedHandleTypes": ["SHELL_LOCK", "NONE"],
                    "allowedHandlePositions": ["BOTTOM"],
                    "allowDrilling": false,
                    "allowedDrillingModes": [],
                    "allowAluminumColors": ["#FFFFFF", "#000000", "#757575", "#5D4037"],
                    "allowGlassColors": ["#E3F2FD", "#616161", "#A5D6A7", "#A1887F"]
                }
            }'::jsonb
        WHERE id = v_prod_max_ar;
    END IF;

    -- ------------------------------------------------------------------------
    -- 5. Fichas Técnicas dos Produtos (tb_product_items)
    -- Limpa itens antigos dos produtos cadastrados acima e recria limpo
    -- ------------------------------------------------------------------------
    DELETE FROM tb_product_items 
    WHERE product_id IN (v_prod_janela_2f, v_prod_janela_4f, v_prod_porta_giro_1f, v_prod_porta_correr_2f, v_prod_max_ar);

    -- 5.1 Itens Janela 2F: Vidro padrão incolor, perfil branco, fecho concha, 2 roldanas duplas
    INSERT INTO tb_product_items (id, product_id, material_id, quantity) VALUES
        (uuid_generate_v4(), v_prod_janela_2f, v_mat_vidro_incolor, 1.44),
        (uuid_generate_v4(), v_prod_janela_2f, v_mat_perfil_branco, 4.80),
        (uuid_generate_v4(), v_prod_janela_2f, v_mat_fecho, 1.00),
        (uuid_generate_v4(), v_prod_janela_2f, v_mat_roldana, 2.00);

    -- 5.2 Itens Janela 4F: Vidro padrão incolor, perfil branco, 2 fechos, 4 roldanas
    INSERT INTO tb_product_items (id, product_id, material_id, quantity) VALUES
        (uuid_generate_v4(), v_prod_janela_4f, v_mat_vidro_incolor, 2.40),
        (uuid_generate_v4(), v_prod_janela_4f, v_mat_perfil_branco, 8.40),
        (uuid_generate_v4(), v_prod_janela_4f, v_mat_fecho, 2.00),
        (uuid_generate_v4(), v_prod_janela_4f, v_mat_roldana, 4.00);

    -- 5.3 Itens Porta de Giro: Vidro incolor, perfil branco, puxador 40cm
    INSERT INTO tb_product_items (id, product_id, material_id, quantity) VALUES
        (uuid_generate_v4(), v_prod_porta_giro_1f, v_mat_vidro_incolor, 1.89),
        (uuid_generate_v4(), v_prod_porta_giro_1f, v_mat_perfil_branco, 6.00),
        (uuid_generate_v4(), v_prod_porta_giro_1f, v_mat_puxador, 1.00);

    -- 5.4 Itens Porta de Correr 2F: Vidro incolor, perfil branco, puxador, 2 roldanas
    INSERT INTO tb_product_items (id, product_id, material_id, quantity) VALUES
        (uuid_generate_v4(), v_prod_porta_correr_2f, v_mat_vidro_incolor, 3.36),
        (uuid_generate_v4(), v_prod_porta_correr_2f, v_mat_perfil_branco, 7.40),
        (uuid_generate_v4(), v_prod_porta_correr_2f, v_mat_puxador, 1.00),
        (uuid_generate_v4(), v_prod_porta_correr_2f, v_mat_roldana, 2.00);

    -- 5.5 Itens Maxim-ar: Vidro incolor, perfil branco, fecho concha
    INSERT INTO tb_product_items (id, product_id, material_id, quantity) VALUES
        (uuid_generate_v4(), v_prod_max_ar, v_mat_vidro_incolor, 0.36),
        (uuid_generate_v4(), v_prod_max_ar, v_mat_perfil_branco, 2.40),
        (uuid_generate_v4(), v_prod_max_ar, v_mat_fecho, 1.00);

    RAISE NOTICE 'Seed concluído com sucesso! Catálogo de materiais, produtos e composições carregados com êxito.';
END $$;

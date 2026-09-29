-- ============================================================================
-- AlumiGest - Correção e Carga de Catálogo (Produtos & Materiais)
-- Compatível 100% com os Enums do Backend:
--   SlidingMode: [BOTH_SLIDING, LEFT_FIXED_RIGHT_SLIDING, RIGHT_FIXED_LEFT_SLIDING]
--   OpeningDirection: [LEFT_TO_RIGHT, RIGHT_TO_LEFT, OUTSIDE, INSIDE, CENTER_TO_SIDES]
--   HandleType: [BAR_TUBULAR, SHELL_LOCK, LEVER_HANDLE, NONE]
--   HandlePosition: [RIGHT, LEFT, TOP, BOTTOM, CENTER]
-- ============================================================================

DO $$
DECLARE
    v_group_vidro UUID;
    v_group_aluminio UUID;
    v_group_pelicula UUID;
    v_group_ferragem UUID;

    i INT;
    v_color VARCHAR(50);
    v_family VARCHAR(50);
    v_template_type VARCHAR(50);
    v_config JSONB;
    v_cat_req JSONB;
    v_prod_name VARCHAR(150);

    v_aluminum_colors TEXT[] := ARRAY['Branco', 'Preto Fosco', 'Bronze 1003', 'Natural Fosco', 'Amadeirado Nogueira', 'Champagne'];
    v_glass_colors TEXT[] := ARRAY['Incolor', 'Verde', 'Fumê', 'Bronze', 'Reflecta Bronze', 'Reflecta Champanhe', 'Extra Clear', 'Satinato'];
    v_pelicula_types TEXT[] := ARRAY['G05 Fumê Profissional', 'G20 Proteção Solar', 'G35 Conforto Térmico', 'Jateada Fosca', 'Branca Leitosa', 'Espelhada Prata', 'Térmica Nanocerâmica'];
    v_ferragem_types TEXT[] := ARRAY[
        'Puxador Tubular Inox 304 40cm Duplo',
        'Puxador Tubular Inox 304 60cm Duplo',
        'Puxador Tubular Inox 304 80cm Duplo',
        'Puxador Tubular Inox 304 100cm Duplo',
        'Puxador Concha Embutir c/ Chave',
        'Fecho Bico de Papagaio Concha',
        'Fecho Toque Trava Automática',
        'Fechadura Rolotê Porta Pivotante',
        'Fechadura Papaiz 323 para Janela/Porta',
        'Roldana Dupla Suprema Blindada Nylon',
        'Roldana Côncava Simples c/ Rolamento',
        'Braço Articulado Maxim-ar Alumínio 30cm',
        'Braço Articulado Maxim-ar Inox 50cm',
        'Pivot Superior e Inferior Linha Gold Inox',
        'Escova de Vedação 7x5 com Barreira',
        'Borracha EPDM Vedação U Universal',
        'Guia Deslizante Inferior Nylon',
        'Batedor de Fim de Curso Borracha'
    ];

BEGIN
    RAISE NOTICE '>>> Limpando produtos com JSON inconsistente anterior...';
    -- Remove apenas os produtos gerados no seed anterior que causavam o erro 500 no Jackson
    DELETE FROM tb_products WHERE template_config::text LIKE '%TWO_LEAVES_ONE_FIXED%';

    -- 1. Obter IDs dos Grupos Nativos
    SELECT id INTO v_group_vidro FROM tb_material_groups WHERE code = 'VIDRO';
    SELECT id INTO v_group_aluminio FROM tb_material_groups WHERE code = 'ALUMINIO';
    SELECT id INTO v_group_pelicula FROM tb_material_groups WHERE code = 'PELICULA';
    SELECT id INTO v_group_ferragem FROM tb_material_groups WHERE code = 'FERRAGEM';

    IF v_group_vidro IS NULL OR v_group_aluminio IS NULL THEN
        RAISE EXCEPTION 'Grupos nativos de materiais não foram encontrados. Execute as migrações Flyway.';
    END IF;

    -- ========================================================================
    -- 2. MATERIAIS / INSUMOS
    -- ========================================================================
    RAISE NOTICE '1/2: Cadastrando materiais de catálogo...';

    -- Perfis de Alumínio
    FOR i IN 1..40 LOOP
        v_color := v_aluminum_colors[1 + (i % array_length(v_aluminum_colors, 1))];
        v_family := CASE WHEN (i % 2 = 0) THEN 'LINHA_SUPREMA' ELSE 'LINHA_GOLD' END;

        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, standard_length_m, color_finish, family_code, is_active, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_group_aluminio,
            'ALU-' || (CASE WHEN i % 2 = 0 THEN 'SU' ELSE 'GL' END) || LPAD(i::text, 3, '0') || '-' || SUBSTRING(UPPER(v_color) FROM 1 FOR 3),
            'PERF-' || (CASE WHEN i % 2 = 0 THEN 'SUP' ELSE 'GLD' END) || '-' || LPAD(i::text, 3, '0'),
            CASE (i % 10)
                WHEN 0 THEN 'Trilho Superior 2 Planos ' || v_family || ' - ' || v_color
                WHEN 1 THEN 'Trilho Inferior 2 Planos ' || v_family || ' - ' || v_color
                WHEN 2 THEN 'Montante Lateral Folha Móvel ' || v_family || ' - ' || v_color
                WHEN 3 THEN 'Travessa Superior/Inferior Folha ' || v_family || ' - ' || v_color
                WHEN 4 THEN 'Perfil Marco Lateral com Encaixe ' || v_family || ' - ' || v_color
                WHEN 5 THEN 'Baguela de Encaixe com Guarnição ' || v_family || ' - ' || v_color
                WHEN 6 THEN 'Perfil Pingadeira Superior ' || v_family || ' - ' || v_color
                WHEN 7 THEN 'Perfil Puxador Facetado Slim ' || v_family || ' - ' || v_color
                WHEN 8 THEN 'Perfil Puxador Cava Integrada ' || v_family || ' - ' || v_color
                ELSE 'Perfil Tubular Reforçado ' || v_family || ' - ' || v_color
            END,
            25.00 + (i * 1.50),
            48.00 + (i * 2.50),
            'METRO',
            6.00,
            v_color,
            v_family,
            TRUE,
            CURRENT_TIMESTAMP - (i || ' days')::interval,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Vidros
    FOR i IN 1..35 LOOP
        v_color := v_glass_colors[1 + (i % array_length(v_glass_colors, 1))];
        v_family := CASE 
            WHEN i % 3 = 0 THEN 'VIDRO_LAMINADO'
            WHEN i % 3 = 1 THEN 'VIDRO_TEMPERADO'
            ELSE 'VIDRO_REFLECTA'
        END;

        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, thickness_mm, max_width_mm, max_height_mm, color_finish, family_code, is_active, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_group_vidro,
            'VID-' || SUBSTRING(v_family FROM 7 FOR 3) || '-' || LPAD(i::text, 2, '0') || '-' || SUBSTRING(UPPER(v_color) FROM 1 FOR 3),
            'CHAPA-' || LPAD(i::text, 3, '0'),
            CASE (i % 3)
                WHEN 0 THEN 'Vidro Laminado de Segurança ' || (6 + (i % 3)*2)::text || 'mm ' || v_color
                WHEN 1 THEN 'Vidro Temperado Float ' || (8 + (i % 2)*2)::text || 'mm ' || v_color
                ELSE 'Vidro Especial Reflecta / Espelho ' || (4 + (i % 2)*2)::text || 'mm ' || v_color
            END,
            90.00 + (i * 3.50),
            170.00 + (i * 6.00),
            'M2',
            CASE (i % 4) WHEN 0 THEN 4.00 WHEN 1 THEN 6.00 WHEN 2 THEN 8.00 ELSE 10.00 END,
            3210.00,
            2400.00,
            v_color,
            v_family,
            TRUE,
            CURRENT_TIMESTAMP - (i || ' days')::interval,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Ferragens e Puxadores
    FOR i IN 1..array_length(v_ferragem_types, 1) LOOP
        v_color := CASE WHEN i % 3 = 0 THEN 'Preto Fosco' WHEN i % 3 = 1 THEN 'Inox Polido' ELSE 'Branco' END;
        v_family := CASE 
            WHEN v_ferragem_types[i] LIKE '%Puxador%' THEN 'PUXADORES'
            WHEN v_ferragem_types[i] LIKE '%Fecho%' OR v_ferragem_types[i] LIKE '%Fechadura%' THEN 'FECHOS_TRAVAS'
            WHEN v_ferragem_types[i] LIKE '%Roldana%' THEN 'ROLDANAS'
            ELSE 'ACESSORIOS_VEDACAO'
        END;

        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, family_code, is_active, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_group_ferragem,
            'FER-' || SUBSTRING(v_family FROM 1 FOR 4) || '-' || LPAD(i::text, 3, '0'),
            'FER-REF-' || LPAD(i::text, 3, '0'),
            v_ferragem_types[i] || ' (' || v_color || ')',
            15.00 + (i * 4.20),
            32.00 + (i * 8.50),
            CASE WHEN v_ferragem_types[i] LIKE '%Roldana%' OR v_ferragem_types[i] LIKE '%Pivot%' THEN 'PAR' ELSE 'UN' END,
            v_color,
            v_family,
            TRUE,
            CURRENT_TIMESTAMP - (i || ' days')::interval,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Películas
    FOR i IN 1..20 LOOP
        v_color := CASE WHEN i % 2 = 0 THEN 'Fumê' ELSE 'Jateado / Fosco' END;
        v_family := 'PELICULAS_SOLARES';

        INSERT INTO tb_materials (
            id, group_id, sku_code, commercial_reference, name, cost_price, sale_price,
            unit_measure, color_finish, family_code, is_active, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_group_pelicula,
            'PEL-' || LPAD(i::text, 3, '0'),
            'PEL-REF-' || LPAD(i::text, 3, '0'),
            v_pelicula_types[1 + (i % array_length(v_pelicula_types, 1))] || ' Bobina 1.52m',
            18.00 + (i * 1.80),
            40.00 + (i * 3.50),
            'M2',
            v_color,
            v_family,
            TRUE,
            CURRENT_TIMESTAMP - (i || ' days')::interval,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- ========================================================================
    -- 3. PRODUTOS / TEMPLATES (COM ENUMS EXATOS DO BACKEND)
    -- ========================================================================
    RAISE NOTICE '2/2: Cadastrando modelos de esquadrias ativos...';

    FOR i IN 1..40 LOOP
        CASE (i % 10)
            WHEN 0 THEN
                v_template_type := 'SLIDING_DOOR_2F';
                v_prod_name := 'Porta de Correr 2 Folhas (1 Móvel) Mod. ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRANCO", "glassColor": "INCOLOR", "slidingMode": "LEFT_FIXED_RIGHT_SLIDING", "profileMm": 50, "handleConfig": {"handleType": "BAR_TUBULAR", "position": "RIGHT", "lengthMm": 400, "offsetMm": 50}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 1 THEN
                v_template_type := 'SLIDING_DOOR_4F';
                v_prod_name := 'Porta de Correr 4 Folhas Suprema Mod. ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "PRETO", "glassColor": "FUME", "slidingMode": "BOTH_SLIDING", "profileMm": 50, "handleConfig": {"handleType": "SHELL_LOCK", "position": "CENTER", "lengthMm": 150, "offsetMm": 30}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 2 THEN
                v_template_type := 'SWING_DOOR_1F';
                v_prod_name := 'Porta Pivotante Linha Gold c/ Puxador Tubular ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "PRETO", "glassColor": "INCOLOR", "openingDirection": "LEFT_TO_RIGHT", "profileMm": 60, "handleConfig": {"handleType": "BAR_TUBULAR", "position": "RIGHT", "lengthMm": 600, "offsetMm": 60}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 3 THEN
                v_template_type := 'SWING_DOOR_2F';
                v_prod_name := 'Porta de Giro Dupla Pivotante Social ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRANCO", "glassColor": "INCOLOR", "openingDirection": "CENTER_TO_SIDES", "profileMm": 60, "handleConfig": {"handleType": "LEVER_HANDLE", "position": "CENTER", "lengthMm": 120, "offsetMm": 40}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 4 THEN
                v_template_type := 'AWNING_WINDOW_1F';
                v_prod_name := 'Janela Maxim-ar Banheiro c/ Fecho Toque ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRANCO", "glassColor": "VERDE", "openingDirection": "OUTSIDE", "profileMm": 40, "handleConfig": {"handleType": "SHELL_LOCK", "position": "BOTTOM", "lengthMm": 100, "offsetMm": 20}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 5 THEN
                v_template_type := 'AWNING_WINDOW_1F_INV';
                v_prod_name := 'Janela Maxim-ar Invertida Área de Serviço ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "PRETO", "glassColor": "FUME", "openingDirection": "INSIDE", "profileMm": 40, "handleConfig": {"handleType": "SHELL_LOCK", "position": "TOP", "lengthMm": 100, "offsetMm": 20}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 6 THEN
                v_template_type := 'SLIDING_DOOR_1F';
                v_prod_name := 'Box de Banheiro Frontal Elegance 1F+1M ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRANCO", "glassColor": "INCOLOR", "slidingMode": "LEFT_FIXED_RIGHT_SLIDING", "profileMm": 40, "handleConfig": {"handleType": "SHELL_LOCK", "position": "RIGHT", "lengthMm": 120, "offsetMm": 30}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE", "FILM"]'::jsonb;
            WHEN 7 THEN
                v_template_type := 'SLIDING_DOOR_3F';
                v_prod_name := 'Porta de Correr 3 Folhas 3 Planos Sacada ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRONZE", "glassColor": "REFLECTA_BRONZE", "slidingMode": "BOTH_SLIDING", "profileMm": 60, "handleConfig": {"handleType": "BAR_TUBULAR", "position": "RIGHT", "lengthMm": 400, "offsetMm": 50}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
            WHEN 8 THEN
                v_template_type := 'FIXED_PANEL';
                v_prod_name := 'Painel Pele de Vidro Fixo Fachada ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "PRETO", "glassColor": "REFLECTA_BRONZE", "profileMm": 50, "handleConfig": {"handleType": "NONE", "position": "CENTER", "lengthMm": 0, "offsetMm": 0}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE"]'::jsonb;
            ELSE
                v_template_type := 'FRONT_DRAWER';
                v_prod_name := 'Frente de Gaveta Vidro Reflecta c/ Puxador Perfil ' || LPAD(i::text, 2, '0');
                v_config := '{"aluminumColor": "BRONZE", "glassColor": "REFLECTA_BRONZE", "profileMm": 35, "handleConfig": {"handleType": "SHELL_LOCK", "position": "TOP", "lengthMm": 300, "offsetMm": 10}}'::jsonb;
                v_cat_req := '["GLASS", "PROFILE", "HARDWARE"]'::jsonb;
        END CASE;

        INSERT INTO tb_products (
            id, name, template_type, is_active, template_config, category_requirements, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_prod_name,
            v_template_type,
            TRUE,
            v_config,
            v_cat_req,
            CURRENT_TIMESTAMP - (i || ' days')::interval,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '>>> Carga corrigida e concluída com SUCESSO!';
END $$;

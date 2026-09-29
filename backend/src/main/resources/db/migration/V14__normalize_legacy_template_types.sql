-- V14: Normaliza template_type de registros legados para os nomes oficiais

UPDATE tb_products SET template_type = 'FRONT_DRAWER' WHERE template_type IN ('DRAWER_FRONT', 'DRAWER');
UPDATE tb_products SET template_type = 'AWNING_WINDOW_1F' WHERE template_type = 'MAXIM_AR_WINDOW';
UPDATE tb_products SET template_type = 'SWING_DOOR_1F' WHERE template_type = 'PIVOTING_DOOR';
UPDATE tb_products SET template_type = 'SLIDING_DOOR_2F' WHERE template_type = 'SLIDING_WINDOW_2F';
UPDATE tb_products SET template_type = 'SLIDING_DOOR_4F' WHERE template_type = 'SLIDING_WINDOW_4F';
UPDATE tb_products SET template_type = 'SLIDING_DOOR_1F' WHERE template_type = 'GLASS_BOX_FRONTAL';
UPDATE tb_products SET template_type = 'SLIDING_DOOR_2F' WHERE template_type = 'GLASS_BOX_CORNER';
UPDATE tb_products SET template_type = 'FIXED_PANEL' WHERE template_type = 'FIXED_GLASS_FACADE';
UPDATE tb_products SET template_type = 'SWING_DOOR_1F' WHERE template_type = 'SWING';
UPDATE tb_products SET template_type = 'SLIDING_DOOR_2F' WHERE template_type = 'SLIDING';
UPDATE tb_products SET template_type = 'AWNING_WINDOW_1F' WHERE template_type = 'TILT';

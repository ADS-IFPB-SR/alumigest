CREATE UNIQUE INDEX idx_materials_unique_commercial_ref_color_group
    ON tb_materials (group_id, LOWER(commercial_reference), LOWER(color_finish))
    WHERE is_active = TRUE;

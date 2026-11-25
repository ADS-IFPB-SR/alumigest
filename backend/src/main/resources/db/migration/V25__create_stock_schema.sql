-- ============================================================================
-- AlumiGest Database Migration - V25__create_stock_schema.sql
-- Módulo: Estoque, Almoxarifado e Trilha Kardex (US-21 e US-22)
-- Criação das tabelas tb_stock_items e tb_stock_movements
-- ============================================================================

CREATE TABLE tb_stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL,
    physical_quantity NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    reserved_quantity NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    available_quantity NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    minimum_stock NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_item_material FOREIGN KEY (material_id) REFERENCES tb_materials (id) ON DELETE RESTRICT,
    CONSTRAINT uk_stock_items_material_id UNIQUE (material_id),
    CONSTRAINT chk_stock_items_reserved_non_negative CHECK (reserved_quantity >= 0),
    CONSTRAINT chk_stock_items_minimum_non_negative CHECK (minimum_stock >= 0)
);

CREATE INDEX idx_stock_items_material_id ON tb_stock_items (material_id);
CREATE INDEX idx_stock_items_available_quantity ON tb_stock_items (available_quantity);

CREATE TABLE tb_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_item_id UUID NOT NULL,
    material_id UUID NOT NULL,
    order_id UUID,
    type VARCHAR(40) NOT NULL,
    quantity NUMERIC(14, 4) NOT NULL,
    unit_cost NUMERIC(12, 2),
    previous_physical_quantity NUMERIC(14, 4) NOT NULL,
    new_physical_quantity NUMERIC(14, 4) NOT NULL,
    previous_reserved_quantity NUMERIC(14, 4) NOT NULL,
    new_reserved_quantity NUMERIC(14, 4) NOT NULL,
    reference_document VARCHAR(100),
    reason TEXT,
    registered_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_movement_item FOREIGN KEY (stock_item_id) REFERENCES tb_stock_items (id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_movement_material FOREIGN KEY (material_id) REFERENCES tb_materials (id) ON DELETE RESTRICT,
    CONSTRAINT chk_stock_movements_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_stock_movements_stock_item_id ON tb_stock_movements (stock_item_id);
CREATE INDEX idx_stock_movements_material_created ON tb_stock_movements (material_id, created_at DESC);
CREATE INDEX idx_stock_movements_order_type ON tb_stock_movements (order_id, type);


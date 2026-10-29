-- V23__create_part_sales_schema.sql
-- Módulo de Venda Avulsa de Partes (US-46)
-- Criação das tabelas tb_part_sales e tb_part_sale_items

CREATE TABLE tb_part_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES tb_clients(id),
    status VARCHAR(20) NOT NULL,
    subtotal_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tb_part_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_sale_id UUID NOT NULL REFERENCES tb_part_sales(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES tb_materials(id),
    material_type VARCHAR(30) NOT NULL,
    width_mm INT NULL,
    height_mm INT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    calculated_unit_measure NUMERIC(10, 4) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_part_sales_client ON tb_part_sales(client_id);
CREATE INDEX idx_part_sales_status ON tb_part_sales(status);
CREATE INDEX idx_part_sale_items_sale ON tb_part_sale_items(part_sale_id);

-- Tabela principal de Produtos Finais (Esquadrias)
CREATE TABLE tb_products (
    id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    labor_cost NUMERIC(12,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    PRIMARY KEY (id)
);

-- Tabela de Itens (Ficha Técnica / Composição)
-- Relaciona qual Produto consome qual Material do Catálogo
CREATE TABLE tb_product_items (
    id UUID NOT NULL,
    product_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity NUMERIC(10,4) NOT NULL,
    
    PRIMARY KEY (id),
    CONSTRAINT fk_product_item_product FOREIGN KEY (product_id) REFERENCES tb_products (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item_material FOREIGN KEY (material_id) REFERENCES tb_materials (id)
);
-- ============================================================================
-- AlumiGest Database Migration - V9__create_budgets_schema.sql
-- Módulo: 📐 Orçamentos / Cálculos
-- Criação das tabelas de orçamentos, itens da esquadria e insumos vinculados
-- Requisitos: US-05
-- ============================================================================

-- Tabela Principal de Orçamentos
CREATE TABLE tb_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    discount_value NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_client FOREIGN KEY (client_id) REFERENCES tb_clients (id)
);

CREATE INDEX idx_budget_client ON tb_budgets(client_id);
CREATE INDEX idx_budget_status ON tb_budgets(status);
CREATE INDEX idx_budget_code ON tb_budgets(code);


-- Tabela de Itens do Orçamento
CREATE TABLE tb_budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    template_type VARCHAR(50),
    template_config JSONB,
    handle_config JSONB,
    drilling_config JSONB,
    width_mm NUMERIC(8, 2) NOT NULL,
    height_mm NUMERIC(8, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    labor_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,

    CONSTRAINT fk_item_budget FOREIGN KEY (budget_id) REFERENCES tb_budgets (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES tb_products (id)
);


-- Tabela de Opções/Insumos dos Itens
CREATE TABLE tb_budget_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_item_id UUID NOT NULL,
    material_id UUID NOT NULL,
    material_name VARCHAR(150) NOT NULL,
    unit_measure VARCHAR(20) NOT NULL,
    category_type VARCHAR(50) NOT NULL,
    selected_type VARCHAR(100),
    selected_color VARCHAR(50),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_option_item FOREIGN KEY (budget_item_id) REFERENCES tb_budget_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_option_material FOREIGN KEY (material_id) REFERENCES tb_materials (id)
);
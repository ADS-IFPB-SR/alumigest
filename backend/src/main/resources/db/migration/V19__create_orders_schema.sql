-- ============================================================================
-- AlumiGest Database Migration - V19__create_orders_schema.sql
-- Módulo: 📦 Pedidos de Venda / Snapshot Imutável (Lock de Preços)
-- Criação das tabelas de pedidos de venda, itens congelados e insumos
-- Requisitos: US-13, US-13.1
-- ============================================================================

-- Tabela Principal de Pedidos de Venda (Orders)
CREATE TABLE tb_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL,
    orcamento_id UUID NOT NULL,
    cliente_id UUID,
    cliente_nome VARCHAR(200) NOT NULL,
    cliente_telefone VARCHAR(20),
    cliente_endereco TEXT,
    status VARCHAR(25) NOT NULL DEFAULT 'WAITING_PRODUCTION',
    canal_aprovacao VARCHAR(20) NOT NULL,
    data_aprovacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_previsao_entrega DATE NOT NULL,
    data_conclusao DATE,
    valor_bruto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_desconto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    taxa_instalacao NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    taxa_frete NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_liquido NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    condicao_pagamento VARCHAR(30),
    observacoes_pagamento TEXT,
    observacoes TEXT,
    justificativa_cancelamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_order_budget FOREIGN KEY (orcamento_id) REFERENCES tb_budgets (id),
    CONSTRAINT fk_order_client FOREIGN KEY (cliente_id) REFERENCES tb_clients (id),
    CONSTRAINT uk_orders_codigo UNIQUE (codigo),
    CONSTRAINT uk_orders_orcamento_id UNIQUE (orcamento_id),
    CONSTRAINT chk_orders_valor_bruto CHECK (valor_bruto >= 0),
    CONSTRAINT chk_orders_valor_liquido CHECK (valor_liquido >= 0)
);

CREATE INDEX idx_orders_codigo ON tb_orders (codigo);
CREATE INDEX idx_orders_orcamento_id ON tb_orders (orcamento_id);
CREATE INDEX idx_orders_status ON tb_orders (status);
CREATE INDEX idx_orders_data_previsao_entrega ON tb_orders (data_previsao_entrega);
CREATE INDEX idx_orders_cliente_id ON tb_orders (cliente_id);

-- Tabela de Itens do Pedido (Snapshot Técnico & Comercial)
CREATE TABLE tb_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID,
    descricao VARCHAR(300) NOT NULL,
    largura_mm INTEGER NOT NULL,
    altura_mm INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    cor_aluminio VARCHAR(50),
    tipo_vidro VARCHAR(100),
    orientacao_abertura VARCHAR(30),
    ferragens TEXT,
    valor_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    template_config JSONB,
    handle_config JSONB,
    drilling_config JSONB,
    ordem INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES tb_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES tb_products (id),
    CONSTRAINT chk_order_items_largura CHECK (largura_mm > 0),
    CONSTRAINT chk_order_items_altura CHECK (altura_mm > 0),
    CONSTRAINT chk_order_items_quantidade CHECK (quantidade > 0),
    CONSTRAINT chk_order_items_valor_unitario CHECK (valor_unitario >= 0),
    CONSTRAINT chk_order_items_valor_total CHECK (valor_total >= 0)
);

CREATE INDEX idx_order_items_order_id ON tb_order_items (order_id);

-- Tabela de Opções / Insumos dos Itens do Pedido (Snapshot Imutável)
CREATE TABLE tb_order_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL,
    material_id UUID,
    material_name VARCHAR(150) NOT NULL,
    unit_measure VARCHAR(20) NOT NULL,
    category_type VARCHAR(50) NOT NULL,
    selected_type VARCHAR(100),
    selected_color VARCHAR(50),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_order_option_item FOREIGN KEY (order_item_id) REFERENCES tb_order_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_option_material FOREIGN KEY (material_id) REFERENCES tb_materials (id)
);

CREATE INDEX idx_order_item_options_item_id ON tb_order_item_options (order_item_id);

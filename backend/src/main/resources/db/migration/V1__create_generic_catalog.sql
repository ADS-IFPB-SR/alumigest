-- ============================================================================
-- AlumiGest Database Migration - V1__create_generic_catalog.sql
-- Módulo: Catálogo de Materiais e Insumos Genéricos
-- Arquitetura: Type-Object Pattern para Extensibilidade Setorial (Alumínio, Vidro, Marcenaria)
-- Parceiro Social: Alumiportas | IFPB Campus Sousa
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Criação da Tabela de Grupos de Materiais
CREATE TABLE tb_material_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    calculation_type VARCHAR(30) NOT NULL,
    description TEXT,
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed dos 4 Grupos Nativos da Alumiportas
INSERT INTO tb_material_groups (code, name, calculation_type, description, is_system_default) VALUES
('VIDRO', 'Vidros e Espelhos', 'SQUARE_METER', 'Vidros planos, fantasia e temperados calculados por área (m²)', TRUE),
('ALUMINIO', 'Perfis de Alumínio e Puxadores', 'LINEAR_METER', 'Perfis, trilhos e puxadores calculados por metro linear e barras de 3m/6m', TRUE),
('PELICULA', 'Películas de Proteção e Acabamento', 'SQUARE_METER', 'Películas decorativas e de proteção solar calculadas por m²', TRUE),
('FERRAGEM', 'Ferragens, Componentes e Acessórios', 'UNIT', 'Fechaduras, rodízios, esquadretas e kits de montagem por unidade ou par', TRUE);

-- 3. Criação da Tabela Universal de Materiais
CREATE TABLE tb_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL,
    sku_code VARCHAR(50),
    commercial_reference VARCHAR(100),
    ncm_code VARCHAR(10),
    name VARCHAR(150) NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit_measure VARCHAR(20) NOT NULL DEFAULT 'UN',
    thickness_mm DECIMAL(6, 2),
    color_finish VARCHAR(50),
    standard_length_m DECIMAL(6, 2),
    attributes_json JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_materials_group FOREIGN KEY (group_id) REFERENCES tb_material_groups (id) ON DELETE RESTRICT
);

-- 4. Índices de Otimização para Consultas
CREATE INDEX idx_materials_group_id ON tb_materials(group_id);
CREATE INDEX idx_materials_name ON tb_materials(name);
CREATE INDEX idx_materials_commercial_ref ON tb_materials(commercial_reference);
CREATE INDEX idx_materials_active ON tb_materials(is_active);

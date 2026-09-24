-- ============================================================================
-- AlumiGest Database Migration - V7__create_clients_table.sql
-- Módulo: Gestão e Cadastro de Clientes
-- Suporte a Tipo de Pessoa (PersonType: FISICA / JURIDICA) e Documento (CPF / CNPJ)
-- Requisitos: RF-007 a RF-011 | UC-12 e UC-13
-- ============================================================================

CREATE TABLE tb_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    person_type VARCHAR(20) NOT NULL DEFAULT 'FISICA',
    document_number VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    zip_code VARCHAR(10),
    street VARCHAR(150),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice único para documento (CPF ou CNPJ) quando preenchido
CREATE UNIQUE INDEX idx_clients_document_number ON tb_clients (document_number) 
    WHERE document_number IS NOT NULL AND document_number <> '';

-- Índices para otimização de busca e filtros
CREATE INDEX idx_clients_full_name ON tb_clients (full_name);
CREATE INDEX idx_clients_person_type ON tb_clients (person_type);
CREATE INDEX idx_clients_phone ON tb_clients (phone);
CREATE INDEX idx_clients_active ON tb_clients (is_active);

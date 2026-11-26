-- ============================================================================
-- AlumiGest Database Migration - V27__create_users_schema.sql
-- Módulo: Autenticação do Operador Único (US-48.1)
-- Criação da tabela tb_users e seed da conta inicial do operador (hash BCrypt).
--
-- A senha NUNCA é armazenada em texto puro: apenas o hash BCrypt (custo 10).
-- A senha padrão de implantação é informada fora do código (PR / guia de
-- implantação) e deve ser substituída pelo operador na primeira utilização.
-- ============================================================================

CREATE TABLE tb_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email_active ON tb_users (email, is_active);

-- Seed da conta inicial do operador (Release 1.0: perfil único, sem auto-cadastro)
INSERT INTO tb_users (name, email, password_hash, is_active)
VALUES (
    'Operador AlumiGest',
    'admin@alumigest.com',
    '$2a$10$/5bXcTnnK5DvLJae6OU7VewnqXdf43xbIAxq7Q79e44qyEc4cjmue',
    TRUE
);

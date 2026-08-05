-- ==========================================
-- AlumiGest - Inicialização do Banco PostgreSQL
-- ==========================================

-- Habilita a extensão para geração de UUIDs nativos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define o timezone padrão para Horário de Brasília
SET timezone = 'America/Sao_Paulo';

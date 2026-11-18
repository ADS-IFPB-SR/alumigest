-- V24__seed_default_walk_in_client.sql
-- Garante a existência do Cliente Balcão padrão para Venda Avulsa e Atendimento Imediato (US-46)

INSERT INTO tb_clients (id, full_name, person_type, document_number, phone, email, notes, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Cliente Balcão (Consumidor Final)',
    'FISICA',
    NULL,
    NULL,
    NULL,
    'Cliente padrão do sistema para vendas avulsas e balcão sem cadastro prévio.',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


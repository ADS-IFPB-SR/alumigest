CREATE TABLE tb_company_settings (
    id UUID PRIMARY KEY,
    singleton_lock BOOLEAN NOT NULL DEFAULT TRUE,
    company_name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) NOT NULL,
    state_registration VARCHAR(30),
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    zip_code VARCHAR(12),
    address VARCHAR(255) NOT NULL,
    city_state VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_company_settings_singleton UNIQUE (singleton_lock),
    CONSTRAINT ck_company_settings_singleton_true CHECK (singleton_lock = TRUE)
);

INSERT INTO tb_company_settings (
    id,
    singleton_lock,
    company_name,
    trade_name,
    cnpj,
    state_registration,
    phone,
    email,
    zip_code,
    address,
    city_state,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    'Alumiportas LTDA',
    'Alumiportas Esquadrias e Vidros',
    '11.222.333/0001-81',
    'Isento',
    '(83) 99999-9999',
    'contato@alumiportas.com.br',
    '58800-000',
    'Rua Principal, 100 - Centro',
    'Sousa - PB',
    NOW()
) ON CONFLICT (singleton_lock) DO NOTHING;

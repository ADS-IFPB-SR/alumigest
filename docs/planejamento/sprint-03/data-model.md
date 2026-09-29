# 🗃️ Modelo de Dados — Sprint 03

A Sprint 3 implementa as migrações Flyway V8, V9 e V10:

```sql
-- V8__create_customers.sql
CREATE TABLE tb_customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    person_type VARCHAR(20) NOT NULL,
    cpf_cnpj    VARCHAR(20) UNIQUE,
    phone       VARCHAR(20),
    email       VARCHAR(100),
    street      VARCHAR(150),
    number      VARCHAR(20),
    neighborhood VARCHAR(100),
    city        VARCHAR(100),
    state       VARCHAR(2),
    zip_code    VARCHAR(10),
    notes       TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- V9__create_budgets_schema.sql
CREATE TABLE tb_budgets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(30) UNIQUE NOT NULL,
    customer_id      UUID NOT NULL REFERENCES tb_customers(id),
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_cost       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_percent DECIMAL(5,2),
    discount_value   DECIMAL(12,2),
    notes            TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_budget_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id   UUID NOT NULL REFERENCES tb_budgets(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES tb_products(id),
    width_mm    INTEGER NOT NULL,
    height_mm   INTEGER NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_cost   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_cost  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    labor_cost  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_budget_item_options (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_item_id UUID NOT NULL REFERENCES tb_budget_items(id) ON DELETE CASCADE,
    material_id    UUID NOT NULL REFERENCES tb_materials(id),
    quantity       DECIMAL(10,3) NOT NULL,
    unit_price     DECIMAL(12,2) NOT NULL,
    total_price    DECIMAL(12,2) NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- V10__drop_product_labor_cost.sql
ALTER TABLE tb_products DROP COLUMN IF EXISTS labor_cost;
```

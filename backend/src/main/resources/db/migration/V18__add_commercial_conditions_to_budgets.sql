ALTER TABLE tb_budgets 
    ADD COLUMN IF NOT EXISTS payment_condition VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_notes TEXT;